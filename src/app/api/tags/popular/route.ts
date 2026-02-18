import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { resolveGroupName } from "@/lib/group-aliases";
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
function getPeriodCutoff(period: string | null): number | null {
  if (!period) return null;
  const now = new Date();
  if (period === "day") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    return Math.floor(start.getTime() / 1000);
  }
  if (period === "week") {
    const day = now.getUTCDay();
    const diff = day === 0 ? 6 : day - 1; // Monday = 0
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
    return Math.floor(start.getTime() / 1000);
  }
  return null;
}

function getCreatedAtSeconds(data: Record<string, unknown>): number {
  const ca = data.createdAt;
  if (ca && typeof ca === "object" && "_seconds" in (ca as Record<string, unknown>)) {
    return (ca as Record<string, number>)._seconds || 0;
  }
  if (typeof ca === "string") {
    const t = new Date(ca).getTime();
    return Number.isFinite(t) ? Math.floor(t / 1000) : 0;
  }
  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limitParam = Math.min(Number(searchParams.get("limit")) || 10, 30);
    const type = searchParams.get("type"); // "keywords" or default (groupTag)
    const period = searchParams.get("period"); // "week" | "day" | null (all-time)
    const cutoff = getPeriodCutoff(period);

    const tagMap = new Map<string, { displayName: string; count: number }>();

    function addTag(tag: string) {
      if (type === "keywords") {
        // Keywords: simple lowercase normalization (no alias resolution)
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
      } else {
        // Group tags: canonical alias resolution
        const resolved = resolveGroupName(tag);
        if (!resolved.canonical) return;
        const existing = tagMap.get(resolved.canonical);
        if (existing) {
          existing.count += 1;
        } else {
          tagMap.set(resolved.canonical, { displayName: resolved.displayName, count: 1 });
        }
      }
    }

    function extractFromDoc(data: Record<string, unknown>) {
      // Period filter: skip docs outside the time window
      if (cutoff !== null) {
        const ts = getCreatedAtSeconds(data);
        if (ts < cutoff) return;
      }
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

    const selectFields = type === "keywords" ? ["keywords"] : ["groupTag"];
    if (cutoff !== null) selectFields.push("createdAt");

    // Admin SDK path
    if (adminDb) {
      const snapshot = await adminDb
        .collection("designs")
        .where("visibility", "==", "public")
        .select(...selectFields)
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
