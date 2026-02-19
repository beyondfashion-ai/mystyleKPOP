import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAuthToken } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/simulate/agent
 * Vote-only endpoint for simulation agents.
 * Generation and publishing now go through the real /api/generate and /api/designs/publish routes.
 *
 * Body: { action: "vote", agentName: string, targetDesignIds: string[] }
 * Requires admin auth.
 */
export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyAuthToken(request);
    if (!decoded) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (!decoded.admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { action, agentName, targetDesignIds } = body;

    if (action !== "vote") {
      return NextResponse.json({ error: "Only 'vote' action is supported" }, { status: 400 });
    }

    if (!agentName || !Array.isArray(targetDesignIds) || targetDesignIds.length === 0) {
      return NextResponse.json({ error: "agentName and targetDesignIds[] required" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Admin DB not configured" }, { status: 500 });
    }

    const voterUid = `simulation_${agentName}`;
    let votedCount = 0;

    for (const designId of targetDesignIds) {
      // Check if already liked
      const existingLike = await adminDb
        .collection("likes")
        .where("userId", "==", voterUid)
        .where("designId", "==", designId)
        .limit(1)
        .get();

      if (!existingLike.empty) continue;

      // Increment like count atomically
      await adminDb.collection("designs").doc(designId).update({
        likeCount: FieldValue.increment(1),
      });

      // Record like
      await adminDb.collection("likes").add({
        userId: voterUid,
        designId,
        createdAt: FieldValue.serverTimestamp(),
      });

      // Notify design owner (skip simulation owners)
      const designDoc = await adminDb.collection("designs").doc(designId).get();
      const ownerUid = designDoc.data()?.ownerUid;

      if (ownerUid && !ownerUid.startsWith("simulation_")) {
        await adminDb.collection("notifications").add({
          userId: ownerUid,
          type: "like",
          message: `새로운 팬(${agentName})이 회원님의 디자인을 좋아합니다!`,
          relatedId: designId,
          createdAt: FieldValue.serverTimestamp(),
          read: false,
        });
      }

      votedCount++;
    }

    return NextResponse.json({ success: true, votedCount });
  } catch (error) {
    console.error("Simulation vote error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
