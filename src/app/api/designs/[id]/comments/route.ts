import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { verifyAuthToken } from "@/lib/auth-helpers";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const COMMENTS_LIMIT = 100;
const LOCAL_COMMENTS_DB_PATH = path.join(process.cwd(), "data", "design-comments.json");
const LOCAL_DESIGNS_DB_PATH = path.join(process.cwd(), "data", "designs.json");

function toEpochSeconds(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "object") {
    const ts = value as { _seconds?: number; seconds?: number; toDate?: () => Date };
    if (typeof ts.toDate === "function") {
      return Math.floor(ts.toDate().getTime() / 1000);
    }
    if (typeof ts._seconds === "number") return ts._seconds;
    if (typeof ts.seconds === "number") return ts.seconds;
  }
  if (typeof value === "string") {
    const ms = Date.parse(value);
    if (!Number.isNaN(ms)) return Math.floor(ms / 1000);
  }
  return 0;
}

type LocalComment = {
  id: string;
  designId: string;
  content: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string | null;
  isAdmin: boolean;
  createdAt: string;
};

async function readLocalComments(): Promise<LocalComment[]> {
  try {
    const raw = await fs.readFile(LOCAL_COMMENTS_DB_PATH, "utf-8");
    return JSON.parse(raw) as LocalComment[];
  } catch {
    return [];
  }
}

async function writeLocalComments(comments: LocalComment[]) {
  await fs.mkdir(path.dirname(LOCAL_COMMENTS_DB_PATH), { recursive: true });
  await fs.writeFile(LOCAL_COMMENTS_DB_PATH, JSON.stringify(comments, null, 2));
}

async function readLocalDesign(designId: string): Promise<Record<string, unknown> | null> {
  try {
    const raw = await fs.readFile(LOCAL_DESIGNS_DB_PATH, "utf-8");
    const designs = JSON.parse(raw) as Record<string, unknown>[];
    return designs.find((d) => d.id === designId) || null;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: designId } = await params;

    if (!designId) {
      return NextResponse.json({ error: "Design ID is required" }, { status: 400 });
    }

    if (adminDb) {
      const snap = await adminDb
        .collection("designComments")
        .where("designId", "==", designId)
        .limit(COMMENTS_LIMIT)
        .get();

      const comments = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort(
          (a, b) =>
            toEpochSeconds((a as Record<string, unknown>).createdAt) -
            toEpochSeconds((b as Record<string, unknown>).createdAt)
        );
      return NextResponse.json({ comments, commentCount: comments.length });
    }

    if (db) {
      const q = query(
        collection(db, "designComments"),
        where("designId", "==", designId),
        limit(COMMENTS_LIMIT)
      );
      const snap = await getDocs(q);
      const comments = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort(
          (a, b) =>
            toEpochSeconds((a as Record<string, unknown>).createdAt) -
            toEpochSeconds((b as Record<string, unknown>).createdAt)
        );
      return NextResponse.json({ comments, commentCount: comments.length });
    }

    const comments = (await readLocalComments())
      .filter((c) => c.designId === designId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(0, COMMENTS_LIMIT)
      .map((c) => ({
        ...c,
        createdAt: { seconds: Math.floor(new Date(c.createdAt).getTime() / 1000) },
      }));

    return NextResponse.json({ comments, commentCount: comments.length });
  } catch (error) {
    console.error("Design comments fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: designId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!designId) {
      return NextResponse.json({ error: "Design ID is required" }, { status: 400 });
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    if (content.trim().length > 300) {
      return NextResponse.json({ error: "Comment too long (max 300)" }, { status: 400 });
    }

    const decoded = await verifyAuthToken(request);
    const uid = decoded?.uid || body.uid || "anonymous";
    const displayName = decoded?.name || body.displayName || "익명";
    const photoURL = body.photoURL || null;

    let designOwnerHandle = "";
    let designConcept = "";
    let designImageUrl = "";

    if (adminDb) {
      const designSnap = await adminDb.collection("designs").doc(designId).get();
      if (designSnap.exists) {
        const data = designSnap.data();
        const images = (data?.imageUrls as { url?: string }[] | undefined) || [];
        designOwnerHandle = String(data?.ownerHandle || "");
        designConcept = String(data?.concept || "");
        designImageUrl = String(images[0]?.url || "");
      }

      const commentRef = await adminDb.collection("designComments").add({
        designId,
        content: content.trim(),
        authorUid: uid,
        authorName: displayName,
        authorPhoto: photoURL,
        isAdmin: false,
        createdAt: FieldValue.serverTimestamp(),
      });

      await adminDb.collection("communityPosts").add({
        content: content.trim(),
        authorUid: uid,
        authorName: displayName,
        authorPhoto: photoURL,
        likeCount: 0,
        isAdmin: false,
        sourceType: "design-comment",
        commentId: commentRef.id,
        designId,
        designOwnerHandle,
        designConcept,
        designImageUrl,
        createdAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true, commentId: commentRef.id });
    }

    if (db) {
      const designSnap = await getDoc(doc(db, "designs", designId));
      if (designSnap.exists()) {
        const data = designSnap.data();
        const images = (data?.imageUrls as { url?: string }[] | undefined) || [];
        designOwnerHandle = String(data?.ownerHandle || "");
        designConcept = String(data?.concept || "");
        designImageUrl = String(images[0]?.url || "");
      }

      const commentRef = await addDoc(collection(db, "designComments"), {
        designId,
        content: content.trim(),
        authorUid: uid,
        authorName: displayName,
        authorPhoto: photoURL,
        isAdmin: false,
        createdAt: serverTimestamp(),
      });

      const batch = writeBatch(db);
      batch.set(doc(db, "communityPosts", randomUUID().replace(/-/g, "").slice(0, 20)), {
        content: content.trim(),
        authorUid: uid,
        authorName: displayName,
        authorPhoto: photoURL,
        likeCount: 0,
        isAdmin: false,
        sourceType: "design-comment",
        commentId: commentRef.id,
        designId,
        designOwnerHandle,
        designConcept,
        designImageUrl,
        createdAt: serverTimestamp(),
      });
      await batch.commit();

      return NextResponse.json({ success: true, commentId: commentRef.id });
    }

    const localDesign = await readLocalDesign(designId);
    const localComments = await readLocalComments();
    const commentId = randomUUID().replace(/-/g, "").slice(0, 20);
    const now = new Date().toISOString();

    localComments.push({
      id: commentId,
      designId,
      content: content.trim(),
      authorUid: uid,
      authorName: displayName,
      authorPhoto: photoURL,
      isAdmin: false,
      createdAt: now,
    });

    await writeLocalComments(localComments);

    return NextResponse.json({
      success: true,
      commentId,
      design: {
        ownerHandle: String(localDesign?.ownerHandle || ""),
        concept: String(localDesign?.concept || ""),
      },
    });
  } catch (error) {
    console.error("Design comment create error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
