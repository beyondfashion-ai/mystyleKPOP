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
    stylePresetId: data.stylePresetId || null,
    stylePresetLabel: data.stylePresetLabel || null,
    colorPresetIds: Array.isArray(data.colorPresetIds) ? data.colorPresetIds : [],
    colorPresetLabels: Array.isArray(data.colorPresetLabels) ? data.colorPresetLabels : [],
    stageVibeId: data.stageVibeId || null,
    stageVibeLabel: data.stageVibeLabel || null,
    groupTag: data.groupTag || null,
    createdAt: data.createdAt,
    representativeIndex: data.representativeIndex || 0,
  };
}

function sortByPopular(a: Record<string, unknown>, b: Record<string, unknown>) {
  const scoreDiff = weightedScore(b) - weightedScore(a);
  if (scoreDiff !== 0) return scoreDiff;
  return ((b.likeCount as number) || 0) - ((a.likeCount as number) || 0);
}

function sortByNewest(a: Record<string, unknown>, b: Record<string, unknown>) {
  const aTime = a.createdAt && typeof a.createdAt === "object" && "_seconds" in (a.createdAt as Record<string, unknown>)
    ? ((a.createdAt as Record<string, number>)._seconds || 0)
    : 0;
  const bTime = b.createdAt && typeof b.createdAt === "object" && "_seconds" in (b.createdAt as Record<string, unknown>)
    ? ((b.createdAt as Record<string, number>)._seconds || 0)
    : 0;
  return bTime - aTime;
}

function applyRecommended(
  all: Record<string, unknown>[],
  groups: string[],
  cursor: string | null
) {
  const normalizedGroups = groups.map((g) => g.toLowerCase().replace(/\s+/g, ""));

  // Split into matched vs unmatched
  const matched: Record<string, unknown>[] = [];
  const rest: Record<string, unknown>[] = [];
  for (const d of all) {
    const norm = (d.groupTagNormalized as string) || "";
    if (normalizedGroups.includes(norm)) {
      matched.push(d);
    } else {
      rest.push(d);
    }
  }

  // Sort each group by score
  matched.sort(sortByPopular);
  rest.sort(sortByPopular);

  // Interleave: matched first, then rest
  const combined = [...matched, ...rest];

  // Cursor-based pagination
  const cursorIndex = cursor ? combined.findIndex((d) => d.id === cursor) : -1;
  const start = cursorIndex >= 0 ? cursorIndex + 1 : 0;
  const page = combined.slice(start, start + PAGE_SIZE);
  const nextCursor = page.length === PAGE_SIZE ? (page[page.length - 1].id as string) : null;

  return { page, nextCursor };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const sort = searchParams.get("sort") || "popular";
    const cursor = searchParams.get("cursor");
    const concept = searchParams.get("concept");
    const groupTag = searchParams.get("groupTag");
    const ownerUid = searchParams.get("ownerUid");
    const likedBy = searchParams.get("likedBy");
    const groupsParam = searchParams.get("groups"); // comma-separated for recommended

    // Use Admin SDK if available (no composite index needed — filter/sort in JS)
    if (adminDb) {
      // If likedBy is provided, first get liked designIds from likes collection
      let likedDesignIds: Set<string> | null = null;
      if (likedBy) {
        const likesSnap = await adminDb.collection("likes")
          .where("uid", "==", likedBy).get();
        likedDesignIds = new Set(likesSnap.docs.map((d) => d.data().designId as string));
        if (likedDesignIds.size === 0) {
          return NextResponse.json({ designs: [], nextCursor: null, hasMore: false });
        }
      }

      const snapshot = await adminDb.collection("designs").get();
      let all: Record<string, unknown>[] = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as Record<string, unknown>))
        .filter((d) => d.visibility === "public");

      if (likedDesignIds) all = all.filter((d) => likedDesignIds!.has(d.id as string));
      if (ownerUid) all = all.filter((d) => d.ownerUid === ownerUid);
      if (groupTag) {
        const norm = groupTag.toLowerCase().replace(/\s+/g, "");
        all = all.filter((d) => d.groupTagNormalized === norm);
      }
      if (concept) all = all.filter((d) => d.concept === concept);

      // Recommended sort with groups prioritization
      if (sort === "recommended" && groupsParam) {
        const groups = groupsParam.split(",").map((g) => g.trim()).filter(Boolean);
        const { page, nextCursor } = applyRecommended(all, groups, cursor);
        return NextResponse.json({
          designs: page.map((d) => stripPrivateFields(d.id as string, d)),
          nextCursor,
          hasMore: nextCursor !== null,
        });
      }

      // Sort
      if (sort === "newest") {
        all.sort(sortByNewest);
      } else {
        all.sort(sortByPopular);
      }

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

        // Recommended sort with groups prioritization
        if (sort === "recommended" && groupsParam) {
          const groups = groupsParam.split(",").map((g) => g.trim()).filter(Boolean);
          const { page, nextCursor } = applyRecommended(designs, groups, cursor);
          return NextResponse.json({
            designs: page.map((d) => stripPrivateFields(d.id as string, d)),
            nextCursor,
            hasMore: nextCursor !== null,
          });
        }

        // Sort
        if (sort === "newest") {
          designs.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
        } else {
          designs.sort(sortByPopular);
        }

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
    // If likedBy, get liked design IDs first (client SDK)
    let likedDesignIdsClient: Set<string> | null = null;
    if (likedBy) {
      const likesSnap = await getDocs(query(collection(db, "likes"), where("uid", "==", likedBy)));
      likedDesignIdsClient = new Set(likesSnap.docs.map((d) => d.data().designId as string));
      if (likedDesignIdsClient.size === 0) {
        return NextResponse.json({ designs: [], nextCursor: null, hasMore: false });
      }
    }

    const constraints: Parameters<typeof query>[1][] = [where("visibility", "==", "public")];
    if (ownerUid) constraints.push(where("ownerUid", "==", ownerUid));
    if (groupTag) constraints.push(where("groupTagNormalized", "==", groupTag.toLowerCase().replace(/\s+/g, "")));
    if (concept) constraints.push(where("concept", "==", concept));

    const q = query(collection(db, "designs"), ...constraints);
    const snapshot = await getDocs(q);
    let all: Record<string, unknown>[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
    if (likedDesignIdsClient) all = all.filter((d) => likedDesignIdsClient!.has(d.id as string));

    // Recommended sort with groups prioritization
    if (sort === "recommended" && groupsParam) {
      const groups = groupsParam.split(",").map((g) => g.trim()).filter(Boolean);
      const { page: recPage, nextCursor: recCursor } = applyRecommended(all, groups, cursor);
      return NextResponse.json({
        designs: recPage.map((d) => stripPrivateFields(d.id as string, d)),
        nextCursor: recCursor,
        hasMore: recCursor !== null,
      });
    }

    if (sort === "newest") {
      all.sort(sortByNewest);
    } else {
      all.sort(sortByPopular);
    }

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
