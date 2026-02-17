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
 * Aggregate groupTag or keyword counts from designs collection.
 * ?type=keywords → aggregate fashion keywords from designs.keywords field
 * default → aggregate groupTag counts
 * Returns top N sorted by usage count.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limitParam = Math.min(Number(searchParams.get("limit")) || 10, 30);
    const type = searchParams.get("type"); // "keywords" or default (groupTag)

    const tagMap = new Map<string, { displayName: string; count: number }>();

    function addTag(tag: string) {
      const normalized = tag.toLowerCase().replace(/\s+/g, "");
      if (!normalized) return;
      const existing = tagMap.get(normalized);
      if (existing) {
        existing.count += 1;
        if (tag.length > existing.displayName.length) {
          existing.displayName = tag;
        }
      } else {
        tagMap.set(normalized, { displayName: tag, count: 1 });
      }
    }

    function extractFromDoc(data: Record<string, unknown>) {
      if (type === "keywords") {
        // keywords field: comma-separated string
        const kw = data.keywords as string | undefined;
        if (kw) {
          kw.split(",").forEach((k) => {
            const trimmed = k.trim().replace(/^#/, "");
            if (trimmed) addTag(trimmed);
          });
        }
      } else {
        const tag = data.groupTag as string | undefined;
        if (tag) addTag(tag);
      }
    }

    const selectFields = type === "keywords" ? "keywords" : "groupTag";

    // Admin SDK path
    if (adminDb) {
      const snapshot = await adminDb
        .collection("designs")
        .where("visibility", "==", "public")
        .select(selectFields)
        .get();

      snapshot.docs.forEach((doc) => extractFromDoc(doc.data()));
    } else if (db) {
      // Client SDK fallback
      const q = query(collection(db, "designs"), where("visibility", "==", "public"));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((doc) => extractFromDoc(doc.data() as Record<string, unknown>));
    } else {
      // Local JSON fallback
      try {
        const raw = await fs.readFile(LOCAL_DB_PATH, "utf-8");
        const designs: Record<string, unknown>[] = JSON.parse(raw);
        designs
          .filter((d) => d.visibility === "public")
          .forEach((d) => extractFromDoc(d));
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
