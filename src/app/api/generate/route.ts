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

        const { prompt, idolType, conceptStyle, imageCount: requestedCount } = body;

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

        // Build structured JSON prompt for flux-2-pro (expand mode)
        const subjectDescription = `Wearing a K-pop stage costume, ${prompt}`;
        const idolLabel = idolType || "K-pop idol";
        const conceptMood = conceptStyle || "Charismatic, stylish, energetic";

        const structuredPrompt = JSON.stringify({
            scene: "K-pop stage performance",
            subjects: [
                {
                    type: idolLabel,
                    description: subjectDescription,
                    pose: "Standing confident, facing forward, arms relaxed",
                    position: "center foreground",
                },
            ],
            style: "broadcast photography",
            color_palette: [],
            lighting: "Vibrant stage lighting, rim lighting, bright backlights",
            mood: conceptMood,
            background: "Blurred geometric stage lights",
            composition: "Full body vertical shot",
            camera: {
                angle: "Eye level",
                distance: "Full shot",
                focus: "Sharp focus on face and outfit",
                lens: "Telephoto 85mm-135mm",
                "f-number": "f/2.8",
                ISO: 800,
            },
            effects: [
                "Bokeh background",
                "Soft glow on skin",
                "Vibrant color saturation",
            ],
        });

        console.log("[Generate] Structured prompt:", structuredPrompt);

        // Generate 1-4 images based on requested count
        const count = Math.min(Math.max(Number(requestedCount) || 1, 1), 4);

        const generateOne = () =>
            fal.subscribe("fal-ai/flux-2-pro", {
                input: {
                    prompt: structuredPrompt,
                    image_size: "square_hd" as const,
                    safety_tolerance: "5" as const,
                },
                logs: false,
                pollInterval: 3000,
            });

        const results = await Promise.all(
            Array.from({ length: count }, () => generateOne())
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
