import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    serverTimestamp,
} from "firebase/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAuthToken } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

// GET: Fetch community posts
export async function GET() {
    try {
        // Admin SDK path
        if (adminDb) {
            const snapshot = await adminDb
                .collection("communityPosts")
                .orderBy("createdAt", "desc")
                .limit(PAGE_SIZE)
                .get();

            const posts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            return NextResponse.json({ posts });
        }

        // Client SDK fallback
        const q = query(
            collection(db, "communityPosts"),
            orderBy("createdAt", "desc"),
            limit(PAGE_SIZE)
        );
        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ posts });
    } catch (error) {
        console.error("Community fetch error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// POST: Create a new community post
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { content } = body;

        if (!content || typeof content !== "string" || content.trim().length === 0) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }

        if (content.length > 500) {
            return NextResponse.json(
                { error: "Content too long (max 500)" },
                { status: 400 }
            );
        }

        // Auth
        const decoded = await verifyAuthToken(request);
        const uid = decoded?.uid || body.uid || "anonymous";
        const displayName = decoded?.name || body.displayName || "익명";
        const photoURL = body.photoURL || null;

        const postData = {
            content: content.trim(),
            authorUid: uid,
            authorName: displayName,
            authorPhoto: photoURL,
            likeCount: 0,
            // TODO: Add admin role check — admin posts can be pinned, styled differently
            // TODO: Admin can delete/hide any post via PATCH /api/community/[id]
            isAdmin: false,
        };

        if (adminDb) {
            const docRef = await adminDb.collection("communityPosts").add({
                ...postData,
                createdAt: FieldValue.serverTimestamp(),
            });
            return NextResponse.json({ success: true, postId: docRef.id });
        }

        const docRef = await addDoc(collection(db, "communityPosts"), {
            ...postData,
            createdAt: serverTimestamp(),
        });
        return NextResponse.json({ success: true, postId: docRef.id });
    } catch (error) {
        console.error("Community post error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
