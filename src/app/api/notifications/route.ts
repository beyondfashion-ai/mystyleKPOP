import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { verifyAuthToken } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const decoded = await verifyAuthToken(request);
        const uid = decoded?.uid;

        if (!uid) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Admin SDK
        if (adminDb) {
            const snapshot = await adminDb
                .collection("notifications")
                .where("userId", "==", uid)
                .orderBy("createdAt", "desc")
                .limit(20)
                .get();

            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert timestamp to distinct string for frontend
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            }));

            return NextResponse.json({ notifications });
        }

        // Client SDK Fallback
        if (db) {
            const q = query(
                collection(db, "notifications"),
                where("userId", "==", uid),
                orderBy("createdAt", "desc"),
                limit(20)
            );

            const snapshot = await getDocs(q);
            const notifications = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
                };
            });

            return NextResponse.json({ notifications });
        }

        return NextResponse.json({ notifications: [] });

    } catch (error) {
        console.error("Notification fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
