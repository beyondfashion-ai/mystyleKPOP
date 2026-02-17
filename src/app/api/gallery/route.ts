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

function weightedScore(data: Record<string, unknown>) {
  const likeCount = Number(data.likeCount || 0);
  const boostCount = Number(data.boostCount || 0);
  return likeCount + boostCount * 10;
}

function stripPrivateFields(id: string, data: Record<string, unknown>) {
  return {
    id,
    imageUrls: data.imageUrls,
    imageUrl: data.imageUrl,
    likeCount: data.likeCount || 0,
    boostCount: data.boostCount || 0,
    totalScore: weightedScore(data),
    ownerHandle: data.ownerHandle,
    ownerUid: data.ownerUid,
    concept: data.concept,
    groupTag: data.groupTag || null,
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
    const groupTag = searchParams.get("groupTag");
    const ownerUid = searchParams.get("ownerUid");

    // Use Admin SDK if available (no composite index needed — filter/sort in JS)
    if (adminDb) {
      const snapshot = await adminDb.collection("designs").get();
      let all: Record<string, unknown>[] = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as Record<string, unknown>))
        .filter((d) => d.visibility === "public");

      if (ownerUid) all = all.filter((d) => d.ownerUid === ownerUid);
      if (groupTag) {
        const norm = groupTag.toLowerCase().replace(/\s+/g, "");
        all = all.filter((d) => d.groupTagNormalized === norm);
      }
      if (concept) all = all.filter((d) => d.concept === concept);

      // Sort
      all.sort((a, b) => {
        if (sort === "newest") {
          const aTime = a.createdAt && typeof a.createdAt === "object" && "_seconds" in (a.createdAt as Record<string, unknown>)
            ? ((a.createdAt as Record<string, number>)._seconds || 0)
            : 0;
          const bTime = b.createdAt && typeof b.createdAt === "object" && "_seconds" in (b.createdAt as Record<string, unknown>)
            ? ((b.createdAt as Record<string, number>)._seconds || 0)
            : 0;
          return bTime - aTime;
        }
        const scoreDiff = weightedScore(b) - weightedScore(a);
        if (scoreDiff !== 0) return scoreDiff;
        return ((b.likeCount as number) || 0) - ((a.likeCount as number) || 0);
      });

      // Cursor-based pagination
      const cursorIndex = cursor ? all.findIndex((d) => d.id === cursor) : -1;
      const start = cursorIndex >= 0 ? cursorIndex + 1 : 0;
      const page = all.slice(start, start + PAGE_SIZE);
      const nextCursor = page.length === PAGE_SIZE ? (page[page.length - 1].id as string) : null;

      return NextResponse.json({
        designs: page.map((d) => stripPrivateFields(d.id as string, d)),
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
        if (groupTag) {
          const normalizedFilter = groupTag.toLowerCase().replace(/\s+/g, "");
          designs = designs.filter((d) => d.groupTagNormalized === normalizedFilter);
        }
        if (concept) designs = designs.filter((d) => d.concept === concept);

        // Sort
        designs.sort((a, b) => {
          if (sort === "newest") {
            return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
          }
          const scoreDiff = weightedScore(b) - weightedScore(a);
          if (scoreDiff !== 0) return scoreDiff;
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
    const constraints: Parameters<typeof query>[1][] = [where("visibility", "==", "public")];
    if (ownerUid) constraints.push(where("ownerUid", "==", ownerUid));
    if (groupTag) constraints.push(where("groupTagNormalized", "==", groupTag.toLowerCase().replace(/\s+/g, "")));
    if (concept) constraints.push(where("concept", "==", concept));

    const q = query(collection(db, "designs"), ...constraints);
    const snapshot = await getDocs(q);
    const all: Record<string, unknown>[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));

    all.sort((a, b) => {
      if (sort === "newest") {
        const aTime = a.createdAt && typeof a.createdAt === "object" && "_seconds" in (a.createdAt as Record<string, unknown>)
          ? ((a.createdAt as Record<string, number>)._seconds || 0)
          : 0;
        const bTime = b.createdAt && typeof b.createdAt === "object" && "_seconds" in (b.createdAt as Record<string, unknown>)
          ? ((b.createdAt as Record<string, number>)._seconds || 0)
          : 0;
        return bTime - aTime;
      }
      const scoreDiff = weightedScore(b) - weightedScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return (Number(b.likeCount || 0) - Number(a.likeCount || 0));
    });

    const cursorIndex = cursor ? all.findIndex((d) => d.id === cursor) : -1;
    const start = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    const page = all.slice(start, start + PAGE_SIZE);
    const nextCursor = page.length === PAGE_SIZE ? (page[page.length - 1].id as string) : null;

    const designs = page.map((d) => stripPrivateFields(d.id as string, d));

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
