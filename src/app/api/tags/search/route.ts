import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { resolveGroupName } from "@/lib/group-aliases";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "designs.json");

/**
 * Search group tags by prefix match for autocomplete.
 * GET /api/tags/search?q=new&limit=5
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const rawQuery = (searchParams.get("q") || "").trim();
    const limitParam = Math.min(Number(searchParams.get("limit")) || 5, 20);

    if (rawQuery.length < 1) {
      return NextResponse.json({ tags: [] });
    }

    // Resolve query through alias mapping for canonical matching
    const resolvedQuery = resolveGroupName(rawQuery);
    const searchCanonical = resolvedQuery.canonical;

    const tagMap = new Map<string, { displayName: string; count: number }>();

    function addTag(groupTag: string) {
      // Resolve stored tag to canonical form for grouping
      const resolved = resolveGroupName(groupTag);
      const canonical = resolved.canonical;
      if (!canonical.includes(searchCanonical)) return;
      const existing = tagMap.get(canonical);
      if (existing) {
        existing.count += 1;
      } else {
        tagMap.set(canonical, { displayName: resolved.displayName, count: 1 });
      }
    }

    // Admin SDK path
    if (adminDb) {
      const snapshot = await adminDb
        .collection("designs")
        .where("visibility", "==", "public")
        .select("groupTag")
        .get();

      snapshot.docs.forEach((doc) => {
        const tag = doc.data().groupTag;
        if (tag) addTag(tag);
      });
    } else if (db) {
      const q = query(collection(db, "designs"), where("visibility", "==", "public"));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((doc) => {
        const tag = doc.data().groupTag;
        if (tag) addTag(tag);
      });
    } else {
      // Local JSON fallback
      try {
        const raw = await fs.readFile(LOCAL_DB_PATH, "utf-8");
        const designs: Record<string, unknown>[] = JSON.parse(raw);
        designs
          .filter((d) => d.visibility === "public" && d.groupTag)
          .forEach((d) => addTag(d.groupTag as string));
      } catch {
        // no local data
      }
    }

    const tags = Array.from(tagMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limitParam);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Tag search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
