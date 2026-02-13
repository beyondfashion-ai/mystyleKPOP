export const dynamic = "force-dynamic";

import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

fal.config({
    credentials: process.env.FAL_KEY,
});

export async function POST(request: Request) {
    try {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { prompt, idolType, conceptStyle, conceptPrompt, imageCount: requestedCount } = body;

        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        if (prompt.length > 2000) {
            return NextResponse.json(
                { error: "Prompt too long (max 2000 characters)" },
                { status: 400 }
            );
        }

        if (!process.env.FAL_KEY) {
            return NextResponse.json(
                { error: "FAL_KEY is not configured" },
                { status: 500 }
            );
        }

        // Build natural language prompt for flux-2/turbo
        const idolLabel = idolType || "K-POP idol";
        const conceptKeywords = conceptPrompt || "";
        const conceptMood = conceptStyle || "charismatic, stylish, energetic";

        // Pose / angle / framing pools for variation
        const POSES = [
            "standing confident with one hand on hip",
            "walking forward mid-stride, dynamic motion",
            "sitting on a tall stool, legs crossed elegantly",
            "leaning against a wall, arms folded, cool attitude",
            "turning to look over shoulder, back partially visible",
            "kneeling on one knee, dramatic low angle",
            "dancing mid-move, arms extended, hair flowing",
            "hands in pockets, relaxed swagger",
            "pointing at camera with a wink",
            "arms raised above head, powerful stage presence",
        ];
        const ANGLES = [
            "eye level shot",
            "slight low angle, looking up",
            "high angle looking down, dramatic",
            "three-quarter view from the left",
            "three-quarter view from the right",
            "straight frontal shot",
        ];
        const FRAMINGS = [
            "full body shot showing head to toe",
            "full body vertical composition",
            "wide shot with environment visible",
            "medium-full shot from knees up",
        ];

        const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

        // Generate 1-4 images based on requested count
        const count = Math.min(Math.max(Number(requestedCount) || 1, 1), 4);

        const buildPrompt = () => {
            const pose = pick(POSES);
            const angle = pick(ANGLES);
            const framing = pick(FRAMINGS);

            return [
                `A ${idolLabel} wearing a K-pop stage costume, ${prompt}.`,
                conceptKeywords ? `Style: ${conceptKeywords}.` : "",
                `Mood: ${conceptMood}.`,
                `${framing}, ${pose}, ${angle}.`,
                "Broadcast photography, telephoto 85-135mm f/2.8 lens, sharp focus on face and outfit.",
                "Vibrant stage lighting, rim lighting, bright backlights, bokeh background.",
                "Vivid color saturation, soft glow on skin, blurred geometric stage lights in background.",
            ].filter(Boolean).join(" ");
        };

        const generateOne = (index: number) => {
            const variedPrompt = buildPrompt();
            console.log(`[Generate] Prompt #${index}:`, variedPrompt);

            return fal.subscribe("fal-ai/flux-2/turbo", {
                input: {
                    prompt: variedPrompt,
                    image_size: "square_hd" as const,
                    num_inference_steps: 8,
                    guidance_scale: 3.5,
                    seed: Math.floor(Math.random() * 2147483647),
                    safety_tolerance: "5" as const,
                },
                logs: false,
                pollInterval: 2000,
            });
        };

        const results = await Promise.all(
            Array.from({ length: count }, (_, i) => generateOne(i))
        );

        const urls: string[] = [];
        for (const result of results) {
            const images = (result.data as { images: { url: string }[] }).images;
            if (images && images.length > 0) {
                urls.push(images[0].url);
            }
        }

        if (urls.length === 0) {
            return NextResponse.json(
                { error: "No images generated" },
                { status: 500 }
            );
        }

        return NextResponse.json({ urls });
    } catch (error) {
        console.error("Generate error:", error);

        const message =
            error instanceof Error ? error.message : "Image generation failed";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
