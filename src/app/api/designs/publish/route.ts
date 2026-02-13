import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAuthToken } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, prompt, concept, ownerHandle } = body;

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Try Admin SDK auth first, fall back to client-sent uid
    const decoded = await verifyAuthToken(request);
    const uid = decoded?.uid || body.ownerUid || "anonymous";
    const handle = decoded?.name || ownerHandle || "Guest Designer";

    const designData = {
      ownerUid: uid,
      ownerHandle: handle,
      originalPrompt: prompt,
      englishPrompt: prompt,
      systemPrompt: prompt,
      concept: concept || "general",
      keywords: "",
      imageUrls: [{ url: imageUrl, index: 0 }],
      representativeIndex: 0,
      visibility: "public",
      likeCount: 0,
      boostCount: 0,
      status: "active",
    };

    // Use Admin SDK if available, otherwise fall back to client SDK
    if (adminDb) {
      const docRef = await adminDb.collection("designs").add({
        ...designData,
        publishedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ success: true, designId: docRef.id });
    }

    // Fallback to client SDK
    const docRef = await addDoc(collection(db, "designs"), {
      ...designData,
      publishedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return NextResponse.json({ success: true, designId: docRef.id });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
