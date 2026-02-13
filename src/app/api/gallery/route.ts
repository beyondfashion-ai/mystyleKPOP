import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;
const LOCAL_DB_PATH = path.join(process.cwd(), "data", "designs.json");

function stripPrivateFields(id: string, data: Record<string, unknown>) {
  return {
    id,
    imageUrls: data.imageUrls,
    imageUrl: data.imageUrl,
    likeCount: data.likeCount || 0,
    boostCount: data.boostCount || 0,
    ownerHandle: data.ownerHandle,
    ownerUid: data.ownerUid,
    concept: data.concept,
    createdAt: data.createdAt,
    representativeIndex: data.representativeIndex || 0,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const sort = searchParams.get("sort") || "popular";
    const cursor = searchParams.get("cursor");
    const concept = searchParams.get("concept");
    const ownerUid = searchParams.get("ownerUid");

    // Use Admin SDK if available
    if (adminDb) {
      let q = adminDb
        .collection("designs")
        .where("visibility", "==", "public");

      if (ownerUid) {
        q = q.where("ownerUid", "==", ownerUid);
      }
      if (concept) {
        q = q.where("concept", "==", concept);
      }

      q =
        sort === "newest"
          ? q.orderBy("createdAt", "desc")
          : q.orderBy("likeCount", "desc");

      if (cursor) {
        try {
          const cursorSnap = await adminDb
            .collection("designs")
            .doc(cursor)
            .get();
          if (cursorSnap.exists) {
            q = q.startAfter(cursorSnap);
          }
        } catch {
          // skip
        }
      }

      q = q.limit(PAGE_SIZE);
      const snapshot = await q.get();

      const designs = snapshot.docs.map((d) =>
        stripPrivateFields(d.id, d.data() as Record<string, unknown>)
      );
      const nextCursor =
        snapshot.docs.length === PAGE_SIZE
          ? snapshot.docs[snapshot.docs.length - 1].id
          : null;

      return NextResponse.json({
        designs,
        nextCursor,
        hasMore: nextCursor !== null,
      });
    }

    // Fallback: client SDK
    if (!db) {
      // Local JSON fallback for development without Firebase
      try {
        const raw = await fs.readFile(LOCAL_DB_PATH, "utf-8");
        let designs: Record<string, unknown>[] = JSON.parse(raw);

        // Filter
        designs = designs.filter((d) => d.visibility === "public");
        if (ownerUid) designs = designs.filter((d) => d.ownerUid === ownerUid);
        if (concept) designs = designs.filter((d) => d.concept === concept);

        // Sort
        designs.sort((a, b) => {
          if (sort === "newest") {
            return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
          }
          return ((b.likeCount as number) || 0) - ((a.likeCount as number) || 0);
        });

        // Paginate
        const cursorIndex = cursor ? designs.findIndex((d) => d.id === cursor) : -1;
        const start = cursorIndex >= 0 ? cursorIndex + 1 : 0;
        const page = designs.slice(start, start + PAGE_SIZE);
        const nextCursor = page.length === PAGE_SIZE ? (page[page.length - 1].id as string) : null;

        return NextResponse.json({
          designs: page.map((d) => stripPrivateFields(d.id as string, d)),
          nextCursor,
          hasMore: nextCursor !== null,
        });
      } catch {
        return NextResponse.json({ designs: [], nextCursor: null, hasMore: false });
      }
    }
    const constraints: Parameters<typeof query>[1][] = [];

    if (ownerUid) constraints.push(where("ownerUid", "==", ownerUid));
    if (concept) constraints.push(where("concept", "==", concept));
    constraints.push(where("visibility", "==", "public"));
    constraints.push(
      sort === "newest"
        ? orderBy("createdAt", "desc")
        : orderBy("likeCount", "desc")
    );

    if (cursor) {
      try {
        const cursorDoc = await getDoc(doc(db, "designs", cursor));
        if (cursorDoc.exists()) constraints.push(startAfter(cursorDoc));
      } catch {
        // skip
      }
    }

    constraints.push(limit(PAGE_SIZE));

    const q = query(collection(db, "designs"), ...constraints);
    const snapshot = await getDocs(q);

    const designs = snapshot.docs.map((d) =>
      stripPrivateFields(d.id, d.data() as Record<string, unknown>)
    );
    const nextCursor =
      snapshot.docs.length === PAGE_SIZE
        ? snapshot.docs[snapshot.docs.length - 1].id
        : null;

    return NextResponse.json({
      designs,
      nextCursor,
      hasMore: nextCursor !== null,
    });
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
