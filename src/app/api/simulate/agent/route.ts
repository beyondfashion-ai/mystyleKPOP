import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { AGENT_PERSONAS } from "@/lib/simulation-config";
import { fal } from "@fal-ai/client";
import { verifyAuthToken } from "@/lib/auth-helpers";

// Configure Fal on server side just in case (though client usually needs proxy)
// We will use FETCH directly to FAL API to avoid client-side config issues in server route
const FAL_KEY = process.env.FAL_KEY;

export const dynamic = "force-dynamic";

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
        const { agentIndex } = body;

        if (agentIndex === undefined || agentIndex < 0 || agentIndex >= AGENT_PERSONAS.length) {
            return NextResponse.json({ error: "Invalid agent index" }, { status: 400 });
        }

        const agent = AGENT_PERSONAS[agentIndex];
        console.log(`[Simulation] Agent ${agent.name} (${agentIndex + 1}/30) starting...`);

        // 1. Generate Image (Flux Dev)
        // We use a simple fetch to fal.ai to bypass client library complexity in server route
        const inferenceRes = await fetch("https://fal.run/fal-ai/flux/dev", {
            method: "POST",
            headers: {
                "Authorization": `Key ${FAL_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: `(masterpiece, best quality, photorealistic:1.2), (Korean K-pop idol:1.3), (korean beauty:1.2), (k-pop stage makeup:1.1), a photo of ${agent.prompt}, wearing high-end k-pop stage costume, concert lighting, soft skin texture, detailed eyes, 8k uhd, dslr`,
                image_size: "portrait_4_3",
                num_inference_steps: 28,
                guidance_scale: 3.5,
                num_images: 1,
                enable_safety_checker: true,
            }),
        });

        if (!inferenceRes.ok) {
            const err = await inferenceRes.text();
            console.error("Fal generation failed:", err);
            throw new Error(`Fal generation failed: ${err}`);
        }

        const inferenceData = await inferenceRes.json();
        const imageUrl = inferenceData.images?.[0]?.url;

        if (!imageUrl) {
            throw new Error("No image URL returned from Fal");
        }

        // 2. Publish Design to Firestore
        if (!adminDb) {
            throw new Error("Admin DB not configured");
        }

        // Normalize tag
        const normalizedGroupTag = agent.groupTag.toLowerCase().replace(/\s+/g, "");

        const designRef = await adminDb.collection("designs").add({
            ownerUid: `simulation_${agent.name}`,
            ownerHandle: agent.name,
            originalPrompt: agent.prompt,
            englishPrompt: agent.prompt,
            systemPrompt: agent.prompt,
            concept: agent.conceptStyle || "general",
            keywords: `simulation,${agent.conceptStyle},${normalizedGroupTag}`,
            groupTag: agent.groupTag,
            groupTagNormalized: normalizedGroupTag,
            imageUrls: [{ url: imageUrl, index: 0 }],
            representativeIndex: 0,
            visibility: "public",
            likeCount: Math.floor(Math.random() * 5), // Random initial likes
            boostCount: 0,
            status: "active",
            publishedAt: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        console.log(`[Simulation] Design published: ${designRef.id}`);

        // 3. Post to Community (Optional)
        if (agent.comment) {
            await adminDb.collection("communityPosts").add({
                content: agent.comment,
                authorUid: `simulation_${agent.name}`,
                authorName: agent.name,
                authorPhoto: null,
                likeCount: Math.floor(Math.random() * 10),
                isAdmin: false,
                createdAt: FieldValue.serverTimestamp(),
            });
            console.log(`[Simulation] Comment posted`);
        }

        // 4. Vote on Random Designs (3 times)
        // Fetch 20 recent designs
        const recentDesignsSnap = await adminDb.collection("designs")
            .orderBy("createdAt", "desc")
            .limit(20)
            .get();

        const recentIds = recentDesignsSnap.docs.map(d => d.id).filter(id => id !== designRef.id);

        if (recentIds.length > 0) {
            // Pick 3 random
            const shuffled = recentIds.sort(() => 0.5 - Math.random());
            const targetIds = shuffled.slice(0, 3);

            for (const tid of targetIds) {
                // Increment like count
                await adminDb.collection("designs").doc(tid).update({
                    likeCount: FieldValue.increment(1)
                });
                // Record like
                await adminDb.collection("likes").add({
                    userId: `simulation_${agent.name}`,
                    designId: tid,
                    createdAt: FieldValue.serverTimestamp()
                });

                // Trigger Notification
                const targetDoc = recentDesignsSnap.docs.find(d => d.id === tid);
                const ownerUid = targetDoc?.data()?.ownerUid;

                if (ownerUid && !ownerUid.startsWith("simulation_")) {
                    await adminDb.collection("notifications").add({
                        userId: ownerUid,
                        type: "like",
                        message: `새로운 팬(${agent.name})이 회원님의 디자인을 좋아합니다!`,
                        relatedId: tid,
                        createdAt: FieldValue.serverTimestamp(),
                        read: false
                    });
                }
            }
            console.log(`[Simulation] Voted on ${targetIds.length} designs`);
        }

        return NextResponse.json({
            success: true,
            agent: agent.name,
            designId: designRef.id,
            imageUrl
        });

    } catch (error) {
        console.error("Simulation error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
