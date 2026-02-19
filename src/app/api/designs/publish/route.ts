import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { verifyAuthToken } from "@/lib/auth-helpers";
import { resolveGroupName } from "@/lib/group-aliases";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

/**
 * Download an image from a URL and upload it to Firebase Storage.
 * Returns the permanent public URL, or falls back to the original URL on failure.
 */
async function uploadToFirebaseStorage(
  imageUrl: string,
  designId: string,
  index: number
): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());

    const contentType = response.headers.get("content-type") || "image/webp";
    const ext = contentType.includes("png") ? "png" : contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "webp";
    const filePath = `designs/${designId}/${index}.${ext}`;

    const bucket = getStorage().bucket();
    const file = bucket.file(filePath);

    await file.save(buffer, {
      contentType,
      metadata: { cacheControl: "public, max-age=31536000" },
    });
    await file.makePublic();

    return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  } catch (error) {
    console.warn(`Failed to upload image ${index} to Firebase Storage, using original URL:`, error);
    return imageUrl;
  }
}

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "designs.json");

async function readLocalDb(): Promise<Record<string, unknown>[]> {
  try {
    const raw = await fs.readFile(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLocalDb(data: Record<string, unknown>[]) {
  await fs.mkdir(path.dirname(LOCAL_DB_PATH), { recursive: true });
  await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      imageUrl,
      imageUrls: rawImageUrls,
      prompt,
      concept,
      stylePresetId,
      stylePresetLabel,
      colorPresetIds,
      colorPresetLabels,
      stageVibeId,
      stageVibeLabel,
      keywords,
      ownerHandle,
      groupTag,
      stylistFeedbacks,
      selectedStylistId,
    } = body;

    // Support single imageUrl or multiple imageUrls
    const imageUrls: string[] = rawImageUrls?.length ? rawImageUrls : imageUrl ? [imageUrl] : [];

    if (imageUrls.length === 0 || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Try Admin SDK auth first, fall back to client-sent uid
    const decoded = await verifyAuthToken(request);
    const uid = decoded?.uid || body.ownerUid || "anonymous";
    const handle = decoded?.name || ownerHandle || "Guest Designer";

    // Resolve group tag via canonical alias mapping
    const rawGroupTag = groupTag ? String(groupTag).trim().replace(/^#/, "") : "";
    const resolved = rawGroupTag ? resolveGroupName(rawGroupTag) : null;
    const cleanGroupTag = resolved?.displayName || "";
    const normalizedGroupTag = resolved?.canonical || "";

    const designData = {
      ownerUid: uid,
      ownerHandle: handle,
      originalPrompt: prompt,
      englishPrompt: prompt,
      systemPrompt: prompt,
      concept: concept || "general",
      stylePresetId: stylePresetId || null,
      stylePresetLabel: stylePresetLabel || null,
      colorPresetIds: Array.isArray(colorPresetIds) ? colorPresetIds : [],
      colorPresetLabels: Array.isArray(colorPresetLabels) ? colorPresetLabels : [],
      stageVibeId: stageVibeId || null,
      stageVibeLabel: stageVibeLabel || null,
      keywords: keywords || "",
      groupTag: cleanGroupTag || null,
      groupTagNormalized: normalizedGroupTag || null,
      imageUrls: imageUrls.map((url: string, index: number) => ({ url, index })),
      representativeIndex: 0,
      visibility: "public",
      likeCount: 0,
      boostCount: 0,
      status: "active",
      stylistFeedbacks: Array.isArray(stylistFeedbacks) ? stylistFeedbacks : [],
      selectedStylistId: selectedStylistId || null,
    };

    // Use Admin SDK if available, otherwise fall back to client SDK
    if (adminDb) {
      // Pre-generate document ID for storage path
      const docRef = adminDb.collection("designs").doc();
      const designId = docRef.id;

      // Upload images from fal.ai to Firebase Storage (permanent URLs)
      const permanentUrls = await Promise.all(
        imageUrls.map((url: string, i: number) => uploadToFirebaseStorage(url, designId, i))
      );

      await docRef.set({
        ...designData,
        imageUrls: permanentUrls.map((url: string, index: number) => ({ url, index })),
        publishedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ success: true, designId });
    }

    // Fallback to client SDK
    if (db) {
      const docRef = await addDoc(collection(db, "designs"), {
        ...designData,
        publishedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return NextResponse.json({ success: true, designId: docRef.id });
    }

    // Local JSON fallback for development without Firebase
    const designId = randomUUID().replace(/-/g, "").slice(0, 20);
    const now = new Date().toISOString();
    const designs = await readLocalDb();
    designs.push({
      id: designId,
      ...designData,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    await writeLocalDb(designs);
    console.log(`[Dev] Design saved locally: ${designId}`);
    return NextResponse.json({ success: true, designId });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
