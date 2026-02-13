import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "designs.json");

function safeDesign(id: string, data: Record<string, unknown>) {
  return {
    id,
    ownerUid: data.ownerUid,
    ownerHandle: data.ownerHandle,
    concept: data.concept,
    imageUrls: data.imageUrls,
    representativeIndex: data.representativeIndex,
    likeCount: data.likeCount || 0,
    boostCount: data.boostCount || 0,
    visibility: data.visibility,
    publishedAt: data.publishedAt,
    createdAt: data.createdAt,
    status: data.status,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Admin SDK path
    if (adminDb) {
      const snap = await adminDb.collection("designs").doc(id).get();
      if (!snap.exists) {
        return NextResponse.json({ error: "Design not found" }, { status: 404 });
      }

      const design = safeDesign(snap.id, snap.data() as Record<string, unknown>);

      // Creator's other designs
      let creatorDesigns: { id: string; imageUrls?: unknown }[] = [];
      try {
        const cSnap = await adminDb
          .collection("designs")
          .where("ownerUid", "==", design.ownerUid)
          .where("visibility", "==", "public")
          .orderBy("createdAt", "desc")
          .limit(5)
          .get();
        creatorDesigns = cSnap.docs
          .filter((d) => d.id !== id)
          .slice(0, 4)
          .map((d) => ({ id: d.id, imageUrls: d.data().imageUrls }));
      } catch { /* index may not exist */ }

      // Recommended
      let recommended: { id: string; imageUrls?: unknown }[] = [];
      try {
        const rSnap = await adminDb
          .collection("designs")
          .where("visibility", "==", "public")
          .orderBy("likeCount", "desc")
          .limit(4)
          .get();
        recommended = rSnap.docs
          .filter((d) => d.id !== id)
          .slice(0, 3)
          .map((d) => ({ id: d.id, imageUrls: d.data().imageUrls }));
      } catch { /* index may not exist */ }

      return NextResponse.json({ design, creatorDesigns, recommended });
    }

    // Fallback: client SDK
    if (!db) {
      // Local JSON fallback for development without Firebase
      try {
        const raw = await fs.readFile(LOCAL_DB_PATH, "utf-8");
        const designs: Record<string, unknown>[] = JSON.parse(raw);
        const found = designs.find((d) => d.id === id);
        if (!found) {
          return NextResponse.json({ error: "Design not found" }, { status: 404 });
        }
        const design = safeDesign(found.id as string, found);
        const creatorDesigns = designs
          .filter((d) => d.ownerUid === design.ownerUid && d.id !== id && d.visibility === "public")
          .slice(0, 4)
          .map((d) => ({ id: d.id as string, imageUrls: d.imageUrls }));
        const recommended = designs
          .filter((d) => d.id !== id && d.visibility === "public")
          .sort((a, b) => ((b.likeCount as number) || 0) - ((a.likeCount as number) || 0))
          .slice(0, 3)
          .map((d) => ({ id: d.id as string, imageUrls: d.imageUrls }));
        return NextResponse.json({ design, creatorDesigns, recommended });
      } catch {
        return NextResponse.json({ error: "Design not found" }, { status: 404 });
      }
    }
    const docRef = doc(db, "designs", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const design = safeDesign(docSnap.id, docSnap.data() as Record<string, unknown>);

    let creatorDesigns: { id: string; imageUrls?: unknown }[] = [];
    try {
      const cQuery = query(
        collection(db, "designs"),
        where("ownerUid", "==", design.ownerUid),
        where("visibility", "==", "public"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const cSnap = await getDocs(cQuery);
      creatorDesigns = cSnap.docs
        .filter((d) => d.id !== id)
        .slice(0, 4)
        .map((d) => ({ id: d.id, imageUrls: d.data().imageUrls }));
    } catch { /* skip */ }

    let recommended: { id: string; imageUrls?: unknown }[] = [];
    try {
      const rQuery = query(
        collection(db, "designs"),
        where("visibility", "==", "public"),
        orderBy("likeCount", "desc"),
        limit(4)
      );
      const rSnap = await getDocs(rQuery);
      recommended = rSnap.docs
        .filter((d) => d.id !== id)
        .slice(0, 3)
        .map((d) => ({ id: d.id, imageUrls: d.data().imageUrls }));
    } catch { /* skip */ }

    return NextResponse.json({ design, creatorDesigns, recommended });
  } catch (error) {
    console.error("Design fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
