import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const dynamic = "force-dynamic";

// GET /api/user/stats?uid=xxx — fetch user's design count & total likes
export async function GET(request: NextRequest) {
    try {
        const uid = request.nextUrl.searchParams.get("uid");
        if (!uid) {
            return NextResponse.json({ error: "uid required" }, { status: 400 });
        }

        let designCount = 0;
        let totalLikes = 0;

        if (adminDb) {
            const snapshot = await adminDb
                .collection("designs")
                .where("ownerUid", "==", uid)
                .where("visibility", "==", "public")
                .get();

            designCount = snapshot.size;
            snapshot.docs.forEach((doc) => {
                totalLikes += (doc.data().likeCount as number) || 0;
            });
        } else {
            const q = query(
                collection(db, "designs"),
                where("ownerUid", "==", uid),
                where("visibility", "==", "public")
            );
            const snapshot = await getDocs(q);
            designCount = snapshot.size;
            snapshot.docs.forEach((doc) => {
                totalLikes += (doc.data().likeCount as number) || 0;
            });
        }

        return NextResponse.json({
            designCount,
            totalLikes,
            // TODO: follower/following counts when social features are built
            followerCount: 0,
            followingCount: 0,
        });
    } catch (error) {
        console.error("User stats error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
