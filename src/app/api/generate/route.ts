export const dynamic = "force-dynamic";

import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

fal.config({
    credentials: process.env.FAL_KEY,
});

// =============================================================================
// Variation Banks — 4 axes of diversity for multi-image generation
// =============================================================================

const POSES = [
    "performing an intense choreography mid-spin with arms extended",
    "striking a powerful ending pose with one arm raised toward the sky",
    "walking confidently toward the camera on a runway-style stage extension",
    "standing in a commanding center-stage pose with a subtle head tilt",
    "captured mid-jump during an explosive dance break",
    "kneeling dramatically on one knee with spotlight directly overhead",
    "leaning back with a charismatic gaze, hand brushing through hair",
    "in a graceful side-profile turn, silhouetted against backlighting",
    "crouching low with fierce eye contact directed at the camera",
    "pointing at the roaring crowd with a playful, confident smile",
    "mid-stride during a powerful dance sequence with flowing fabric in motion",
    "standing at the edge of the stage reaching toward fans below",
];

const CAMERAS = [
    "Shot on Canon EOS R5, 85mm f/1.4 lens, shallow depth of field",
    "Shot on Sony A7R V, 70-200mm f/2.8 at 135mm, creamy bokeh",
    "Shot on Nikon Z9, 50mm f/1.2 lens, natural perspective",
    "Shot on Fujifilm X-T5, 56mm f/1.2, rich color rendering",
    "Shot on Canon 5D Mark IV, 135mm f/2.0, compressed background",
    "Shot on Sony A1, 85mm f/1.2, ultra-sharp detail with soft background",
];

const ANGLES = [
    "low angle looking up, making the subject appear powerful and heroic",
    "eye-level straight-on angle for an intimate natural perspective",
    "slight high angle capturing the full stage setup behind the performer",
    "three-quarter angle from the left showing depth and dimension",
    "dramatic low angle from stage floor level looking upward",
    "slight dutch angle adding cinematic tension to the frame",
];

const LIGHTING = [
    "dramatic single spotlight from above casting deep theatrical shadows, with colorful LED wash on the stage floor",
    "backlit rim lighting creating a glowing silhouette outline, atmospheric purple and blue haze filling the air",
    "warm golden spotlights mixed with cool blue arena flood lighting, creating rich contrast",
    "pulsing strobe lights freezing the moment in high contrast, sharp stage shadows",
    "rainbow LED panels towering behind the performer with soft diffused front fill light",
    "moody low-key side lighting with a single dramatic source, theatrical smoke drifting across the stage",
];

// =============================================================================
// Helpers
// =============================================================================

/** Fisher-Yates shuffle — returns a new shuffled copy */
function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/** Extract English fashion terms and translate Korean style words from stylist advice */
function extractStyleKeywords(advice: string): string {
    const englishTerms = advice.match(/[A-Za-z][A-Za-z\-]{2,}/g) || [];

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

// =============================================================================
// POST /api/generate
// =============================================================================

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

        const idolLabel = idolType || "K-POP idol";
        const conceptKeywords = conceptPrompt || "";
        const conceptMood = conceptStyle || "charismatic, stylish, energetic";
        const count = Math.min(Math.max(Number(requestedCount) || 1, 1), 4);
        const adviceKeywords = stylistAdvice ? extractStyleKeywords(stylistAdvice) : "";

        // Pre-shuffle variation banks so each image in a batch gets unique elements
        const shuffledPoses = shuffle(POSES);
        const shuffledCameras = shuffle(CAMERAS);
        const shuffledAngles = shuffle(ANGLES);
        const shuffledLighting = shuffle(LIGHTING);

        const buildPrompt = (index: number) => {
            const pose = shuffledPoses[index % shuffledPoses.length];
            const camera = shuffledCameras[index % shuffledCameras.length];
            const angle = shuffledAngles[index % shuffledAngles.length];
            const light = shuffledLighting[index % shuffledLighting.length];

            return [
                // Subject + action (highest priority for Flux)
                `Editorial fancam photograph of a real Korean ${idolLabel} ${pose} on a massive concert stage.`,
                // Outfit (user prompt)
                `The performer wears ${prompt}.`,
                // Concept
                conceptKeywords ? `${conceptKeywords} concept aesthetic.` : "",
                // Mood
                `Mood: ${conceptMood}.`,
                // Stylist advice keywords
                adviceKeywords ? `Style details: ${adviceKeywords}.` : "",
                // Photorealism anchors — skin, hair, makeup
                "Authentic Korean beauty with natural skin texture showing visible pores and subtle perspiration glow under stage lights, real human hair with individual strands visible, professional K-POP stage makeup with precise eyeliner and subtle glitter accents.",
                // Stage environment + lighting
                `${light}.`,
                // Camera + angle (end of prompt — technical specs)
                `${camera}, ${angle}.`,
            ].filter(Boolean).join(" ");
        };

        const generateOne = (index: number) => {
            const variedPrompt = buildPrompt(index);
            console.log(`[Generate] Image #${index + 1}/${count}:`, variedPrompt.substring(0, 120) + "...");

            return fal.subscribe("fal-ai/flux-2-pro", {
                input: {
                    prompt: variedPrompt,
                    image_size: "portrait_4_3" as const,
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
