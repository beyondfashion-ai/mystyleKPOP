import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "designs.json");

interface TagCount {
  displayName: string;
  count: number;
}

/**
 * Aggregate groupTag counts from designs collection.
 * Returns top N popular group tags sorted by usage count.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limitParam = Math.min(Number(searchParams.get("limit")) || 10, 30);

    const tagMap = new Map<string, { displayName: string; count: number }>();

    function addTag(groupTag: string) {
      const normalized = groupTag.toLowerCase().replace(/\s+/g, "");
      const existing = tagMap.get(normalized);
      if (existing) {
        existing.count += 1;
        // Keep the most-used display form (heuristic: longer = more specific)
        if (groupTag.length > existing.displayName.length) {
          existing.displayName = groupTag;
        }
      } else {
        tagMap.set(normalized, { displayName: groupTag, count: 1 });
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
      // Client SDK fallback
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

    const tags: TagCount[] = Array.from(tagMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limitParam);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Popular tags error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
