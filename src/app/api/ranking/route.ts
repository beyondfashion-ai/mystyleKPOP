import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

export const dynamic = "force-dynamic";

function stripPrivate(id: string, data: Record<string, unknown>, rank: number) {
  return {
    rank,
    id,
    imageUrls: data.imageUrls,
    imageUrl: data.imageUrl,
    likeCount: data.likeCount || 0,
    boostCount: data.boostCount || 0,
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
        .orderBy("likeCount", "desc")
        .limit(50)
        .get();

      const rankings = snap.docs.map((d, i) =>
        stripPrivate(d.id, d.data() as Record<string, unknown>, i + 1)
      );
      return NextResponse.json({ rankings });
    }

    // Fallback: client SDK
    const q = query(
      collection(db, "designs"),
      where("visibility", "==", "public"),
      orderBy("likeCount", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    const rankings = snap.docs.map((d, i) =>
      stripPrivate(d.id, d.data() as Record<string, unknown>, i + 1)
    );

    return NextResponse.json({ rankings });
  } catch (error) {
    console.error("Ranking fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
