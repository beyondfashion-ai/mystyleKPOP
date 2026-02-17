export const dynamic = "force-dynamic";

import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

fal.config({
    credentials: process.env.FAL_KEY,
});

// Extract English fashion terms and translate key Korean style words from stylist advice
function extractStyleKeywords(advice: string): string {
    // 1. Pull out English fashion terms already in the advice (Silhouette, Layering, etc.)
    const englishTerms = advice.match(/[A-Za-z][A-Za-z\-]{2,}/g) || [];

    // 2. Map common Korean fashion terms to English
    const koToEn: Record<string, string> = {
        "크롭": "cropped", "와이드": "wide", "오버사이즈": "oversized",
        "슬림": "slim fit", "타이트": "tight fit",
        "레더": "leather", "새틴": "satin", "시어": "sheer",
        "메쉬": "mesh", "오간자": "organza", "벨벳": "velvet",
        "데님": "denim", "실크": "silk", "트위드": "tweed",
        "홀로그래픽": "holographic", "메탈릭": "metallic", "크롬": "chrome",
        "시퀸": "sequin", "글리터": "glitter", "PVC": "PVC",
        "체인": "chain", "벨트": "belt", "초커": "choker",
        "부츠": "boots", "하이힐": "high heels",
        "네온": "neon", "파스텔": "pastel", "모노크롬": "monochrome",
        "핫핑크": "hot pink", "라임": "lime green", "블랙": "black",
        "올블랙": "all-black", "화이트": "white",
        "프린지": "fringe", "러플": "ruffle", "플리츠": "pleated",
        "드레이핑": "draped", "컷아웃": "cutout", "슬릿": "slit",
        "파워 숄더": "power shoulder", "퍼프 슬리브": "puff sleeve",
        "스포티": "sporty", "스트릿": "streetwear",
    };

    const translated: string[] = [];
    for (const [ko, en] of Object.entries(koToEn)) {
        if (advice.includes(ko)) translated.push(en);
    }

    const combined = [...new Set([...translated, ...englishTerms.filter(t => t.length > 2)])];
    return combined.slice(0, 12).join(", ");
}

export async function POST(request: Request) {
    try {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { prompt, idolType, conceptStyle, conceptPrompt, imageCount: requestedCount, stylistAdvice } = body;

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

        // Build photorealistic fancam-style prompt for flux-2/turbo
        const idolLabel = idolType || "K-POP idol";
        const conceptKeywords = conceptPrompt || "";
        const conceptMood = conceptStyle || "charismatic, stylish, energetic";

        const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

        // Generate 1-4 images based on requested count
        const count = Math.min(Math.max(Number(requestedCount) || 1, 1), 4);

        // Extract style keywords from Korean stylist advice for prompt enhancement
        const adviceKeywords = stylistAdvice ? extractStyleKeywords(stylistAdvice) : "";

        const buildPrompt = () => {
            return [
                `Live concert fancam photo of a real Korean ${idolLabel} performing on stage, wearing ${prompt}.`,
                conceptKeywords ? `${conceptKeywords} concept.` : "",
                `Mood: ${conceptMood}.`,
                adviceKeywords ? `Style details: ${adviceKeywords}.` : "",
                "Korean beauty standards, k-pop makeup, glitters, colored contact lenses.",
                "Full body shot from head to shoes.",
                "Real person, natural skin texture, real hair.",
                "Concert stage with LED panels and moving lights in background.",
                "Telephoto lens, 4K fancam quality, photorealistic.",
            ].filter(Boolean).join(" ");
        };

        const generateOne = (index: number) => {
            const variedPrompt = buildPrompt();
            console.log(`[Generate] Prompt #${index}:`, variedPrompt);

            return fal.subscribe("fal-ai/flux-2/turbo", {
                input: {
                    prompt: variedPrompt,
                    image_size: "portrait_4_3" as const,
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
