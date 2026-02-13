import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAuthToken } from "@/lib/auth-helpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ designId: string }> }
) {
  try {
    const { designId } = await params;
    if (!designId) {
      return NextResponse.json({ error: "Design ID required" }, { status: 400 });
    }

    // Auth: prefer token, fall back to body uid
    const decoded = await verifyAuthToken(request);
    const body = await request.json().catch(() => ({}));
    const uid = decoded?.uid || body.uid;

    if (!uid) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const likeId = `${designId}_${uid}`;

    // Use Admin SDK if available
    if (adminDb) {
      const designRef = adminDb.collection("designs").doc(designId);
      const likeRef = adminDb.collection("likes").doc(likeId);

      const result = await adminDb.runTransaction(async (tx) => {
        const designSnap = await tx.get(designRef);
        if (!designSnap.exists) {
          throw new Error("Design not found");
        }

        const likeSnap = await tx.get(likeRef);
        const alreadyLiked = likeSnap.exists;
        const currentCount = designSnap.data()?.likeCount || 0;

        if (alreadyLiked) {
          tx.delete(likeRef);
          tx.update(designRef, { likeCount: Math.max(0, currentCount - 1) });
          return { liked: false, likeCount: Math.max(0, currentCount - 1) };
        } else {
          tx.set(likeRef, {
            designId,
            uid,
            createdAt: FieldValue.serverTimestamp(),
          });
          tx.update(designRef, { likeCount: currentCount + 1 });
          return { liked: true, likeCount: currentCount + 1 };
        }
      });

      return NextResponse.json(result);
    }

    // Fallback: client SDK
    const designRef = doc(db, "designs", designId);
    const likeRef = doc(db, "likes", likeId);

    const designSnap = await getDoc(designRef);
    if (!designSnap.exists()) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const likeSnap = await getDoc(likeRef);
    const alreadyLiked = likeSnap.exists();

    await runTransaction(db, async (transaction) => {
      const fresh = await transaction.get(designRef);
      if (!fresh.exists()) throw new Error("Design not found");
      const count = fresh.data().likeCount || 0;

      if (alreadyLiked) {
        transaction.delete(likeRef);
        transaction.update(designRef, { likeCount: Math.max(0, count - 1) });
      } else {
        transaction.set(likeRef, { designId, uid, createdAt: new Date() });
        transaction.update(designRef, { likeCount: count + 1 });
      }
    });

    return NextResponse.json({
      liked: !alreadyLiked,
      likeCount: (designSnap.data()?.likeCount || 0) + (alreadyLiked ? -1 : 1),
    });
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ designId: string }> }
) {
  try {
    const { designId } = await params;
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid || !designId) {
      return NextResponse.json({ liked: false });
    }

    const likeId = `${designId}_${uid}`;

    if (adminDb) {
      const snap = await adminDb.collection("likes").doc(likeId).get();
      return NextResponse.json({ liked: snap.exists });
    }

    const snap = await getDoc(doc(db, "likes", likeId));
    return NextResponse.json({ liked: snap.exists() });
  } catch {
    return NextResponse.json({ liked: false });
  }
}
