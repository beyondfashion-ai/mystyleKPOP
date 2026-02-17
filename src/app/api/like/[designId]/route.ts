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

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ designId: string }> }
) {
  try {
    const { designId } = await params;
    if (!designId) {
      return NextResponse.json({ error: "Design ID required" }, { status: 400 });
    }

    // Auth: prefer token, fall back to body uid, fall back to IP
    const decoded = await verifyAuthToken(request);
    const body = await request.json().catch(() => ({}));
    const uid = decoded?.uid || body.uid || `ip_${getClientIp(request)}`;

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
        const designData = designSnap.data();
        const currentCount = designData?.likeCount || 0;
        const ownerUid = designData?.ownerUid;

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

          // Trigger Notification (only if not self-like and owner exists)
          if (ownerUid && ownerUid !== uid && !ownerUid.startsWith("simulation_")) {
            // Create a new notification doc
            const notiRef = adminDb.collection("notifications").doc();
            tx.set(notiRef, {
              userId: ownerUid,
              type: "like",
              message: "회원님의 디자인을 누군가 좋아합니다!", // In real app, we might want to consolidate likes
              relatedId: designId,
              createdAt: FieldValue.serverTimestamp(),
              read: false
            });
          }

          return { liked: true, likeCount: currentCount + 1 };
        }
      });

      return NextResponse.json(result);
    }

    // Fallback: client SDK
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }
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
    const uid = searchParams.get("uid") || `ip_${getClientIp(request)}`;

    if (!designId) {
      return NextResponse.json({ liked: false });
    }

    const likeId = `${designId}_${uid}`;

    if (adminDb) {
      const snap = await adminDb.collection("likes").doc(likeId).get();
      return NextResponse.json({ liked: snap.exists });
    }

    if (!db) {
      return NextResponse.json({ liked: false });
    }
    const snap = await getDoc(doc(db, "likes", likeId));
    return NextResponse.json({ liked: snap.exists() });
  } catch {
    return NextResponse.json({ liked: false });
  }
}
