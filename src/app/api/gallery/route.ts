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

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

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
