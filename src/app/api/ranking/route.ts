import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  limit,
  where,
} from "firebase/firestore";

export const dynamic = "force-dynamic";

function stripPrivate(id: string, data: Record<string, unknown>, rank: number) {
  const likeCount = Number(data.likeCount || 0);
  const boostCount = Number(data.boostCount || 0);
  const totalScore = likeCount + boostCount * 10;

  return {
    rank,
    id,
    imageUrls: data.imageUrls,
    imageUrl: data.imageUrl,
    likeCount,
    boostCount,
    totalScore,
    ownerHandle: data.ownerHandle,
    concept: data.concept,
    createdAt: data.createdAt,
  };
}

export async function GET() {
  try {
    // Admin SDK path
    if (adminDb) {
      const snap = await adminDb
        .collection("designs")
        .where("visibility", "==", "public")
        .get();

      const rows = snap.docs.map((d) => ({ id: d.id, data: d.data() as Record<string, unknown> }));
      rows.sort((a, b) => {
        const aLike = Number(a.data.likeCount || 0);
        const bLike = Number(b.data.likeCount || 0);
        const aBoost = Number(a.data.boostCount || 0);
        const bBoost = Number(b.data.boostCount || 0);
        const aScore = aLike + aBoost * 10;
        const bScore = bLike + bBoost * 10;
        if (bScore !== aScore) return bScore - aScore;
        return bLike - aLike;
      });
      const rankings = rows.slice(0, 50).map((row, i) => stripPrivate(row.id, row.data, i + 1));
      return NextResponse.json({ rankings });
    }

    // Fallback: client SDK
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }
    const q = query(
      collection(db, "designs"),
      where("visibility", "==", "public"),
      limit(50)
    );
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, data: d.data() as Record<string, unknown> }));
    rows.sort((a, b) => {
      const aLike = Number(a.data.likeCount || 0);
      const bLike = Number(b.data.likeCount || 0);
      const aBoost = Number(a.data.boostCount || 0);
      const bBoost = Number(b.data.boostCount || 0);
      const aScore = aLike + aBoost * 10;
      const bScore = bLike + bBoost * 10;
      if (bScore !== aScore) return bScore - aScore;
      return bLike - aLike;
    });
    const rankings = rows.slice(0, 50).map((row, i) => stripPrivate(row.id, row.data, i + 1));

    return NextResponse.json({ rankings });
  } catch (error) {
    console.error("Ranking fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
