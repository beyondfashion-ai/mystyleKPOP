export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

// =============================================================================
// Korean Tag → English Translation Map
// =============================================================================

const KO_EN_MAP: Record<string, string> = {
    // Materials / Textures
    "홀로그래픽 소재": "holographic fabric", "홀로그래픽 오간자": "holographic organza",
    "홀로그래픽 PVC": "holographic PVC", "홀로그래픽 코팅": "holographic coating",
    "홀로그래픽": "holographic", "크롬 메탈릭": "chrome metallic", "크롬": "chrome",
    "메탈릭": "metallic", "리퀴드 메탈": "liquid metal", "메탈 메쉬": "metal mesh",
    "PVC 하네스": "PVC harness", "PVC": "PVC", "미러 텍스처": "mirror texture",
    "반사 원단": "reflective fabric", "네오프렌 소재": "neoprene", "네오프렌": "neoprene",
    "실버 체인메일": "silver chainmail", "레이저 컷 패널": "laser-cut panel",
    "새틴": "satin", "시어 패브릭": "sheer fabric", "시어": "sheer",
    "메쉬 레이어": "mesh layer", "메쉬 패널": "mesh panel", "메쉬": "mesh",
    "오간자 드레스": "organza dress", "오간자": "organza",
    "벨벳": "velvet", "데님": "denim", "실크": "silk", "레더": "leather",
    "카프스킨": "calfskin", "램스킨": "lambskin", "트위드": "tweed",
    "시퀸": "sequin", "글리터": "glitter", "나일론": "nylon", "리넨": "linen",
    "워싱 데님": "washed denim", "로우 데님": "raw denim", "합성 레더": "faux leather",
    "소프트 데님": "soft denim", "코듀로이": "corduroy",
    "시폰 레이어": "chiffon layers", "파스텔 튤": "pastel tulle",
    "오로라 원단": "aurora iridescent fabric", "시어 가운": "sheer gown",
    "빈티지 데님": "vintage denim", "브라운 레더": "brown leather",
    "라텍스 글러브": "latex gloves", "라텍스": "latex",
    "카모플라주 패턴": "camouflage pattern", "카모플라주 메쉬": "camouflage mesh",

    // Silhouettes / Fit
    "오버사이즈 후디": "oversized hoodie", "오버사이즈 블레이저": "oversized blazer",
    "오버사이즈 핏": "oversized fit", "오버사이즈": "oversized",
    "크롭탑": "crop top", "크롭 코르셋": "cropped corset", "크롭 재킷": "cropped jacket",
    "크롭 상의": "cropped top", "크롭": "cropped",
    "와이드 팬츠": "wide-leg pants", "와이드 하의": "wide-leg bottom", "와이드": "wide",
    "슬림 핏": "slim fit", "슬림 타이": "slim tie", "슬림": "slim",
    "타이트": "tight", "루즈": "loose", "박시": "boxy",
    "A라인": "A-line", "스트레이트": "straight", "플레어": "flared",
    "스키니": "skinny", "드롭숄더": "drop shoulder",
    "파워 숄더": "power shoulder", "퍼프 슬리브": "puff sleeve",
    "구조적 숄더": "structured shoulder", "구조적 코트": "structured coat",
    "더블 브레스트": "double-breasted", "테일러드 핏": "tailored fit",
    "코르셋 탑": "corset top", "레이스 보디수트": "lace bodysuit",
    "새틴 슬립": "satin slip dress", "슬릿 드레스": "slit dress",
    "딥 브이넥": "deep V-neck", "백리스 디자인": "backless design",
    "컷아웃 디테일": "cutout detail", "오프숄더 가운": "off-shoulder gown",
    "레더 미니스커트": "leather mini skirt", "미니스커트": "mini skirt",
    "로우라이즈 팬츠": "low-rise pants", "벨보텀 팬츠": "bell-bottom pants",
    "카고 팬츠": "cargo pants", "카키 팬츠": "khaki pants",
    "플리츠 스커트": "pleated skirt", "테니스 스커트": "tennis skirt",
    "레터맨 재킷": "letterman jacket", "나일론 윈드브레이커": "nylon windbreaker",
    "밀리터리 재킷": "military jacket", "항공 점퍼": "flight bomber jacket",
    "레더 재킷": "leather jacket", "카디건 레이어": "cardigan layering",
    "레이어드 룩": "layered look", "올블랙 레이어드": "all-black layered look",
    "벨벳 트랙수트": "velvet tracksuit", "벨벳 수트": "velvet suit",
    "벨벳 케이프": "velvet cape", "레이스 케이프": "lace cape",
    "핫팬츠": "hot pants", "하이웨이스트": "high-waisted",
    "전술 조끼": "tactical vest", "에폴렛 숄더": "epaulette shoulders",

    // Accessories
    "LED 악세서리": "LED accessories", "LED 스트립": "LED strip accents",
    "사이버 고글": "cyber goggles", "크롬 링 이어링": "chrome ring earrings",
    "골드 체인": "gold chain", "체인 벨트": "chain belt",
    "청키 체인 벨트": "chunky chain belt", "바이커 체인": "biker chain",
    "체인 월렛": "chain wallet", "체인 브로치": "chain brooch",
    "벨벳 쵸커": "velvet choker", "크롬 초커": "chrome choker", "초커": "choker",
    "스틸레토 힐": "stiletto heels", "하이힐": "high heels",
    "플랫폼 부츠": "platform boots", "플랫폼 슈즈": "platform shoes",
    "컴뱃 부츠": "combat boots", "전투 부츠": "combat boots",
    "스터드 부츠": "studded boots", "청키 스니커즈": "chunky sneakers",
    "캔버스 스니커즈": "canvas sneakers", "하이탑 스니커즈": "high-top sneakers",
    "로퍼 슈즈": "loafer shoes", "실버 부츠": "silver boots",
    "워크 부츠": "work boots", "젤리 슈즈": "jelly shoes",
    "부츠": "boots", "이어링": "earrings", "뱅글": "bangle",
    "브로치": "brooch", "벨트": "belt", "글러브": "gloves",
    "크리스탈 티아라": "crystal tiara", "크리스탈 보디체인": "crystal body chain",
    "크리스탈 힐": "crystal heels",
    "펄 장식": "pearl embellishments", "펄 버튼": "pearl buttons",
    "진주 초커": "pearl choker", "비즈 목걸이": "beaded necklace",
    "새틴 리본": "satin ribbon", "리본 타이": "ribbon tie",
    "스터드 디테일": "studded details", "메탈 스파이크": "metal spikes",
    "블랙 하네스": "black harness", "버클 하네스": "buckle harness",
    "탄띠 벨트": "ammo belt", "유틸리티 벨트": "utility belt",
    "독태그 목걸이": "dog tag necklace", "밀리터리 베레": "military beret",
    "파일럿 선글라스": "aviator sunglasses", "사이버 선글라스": "cyber sunglasses",
    "레트로 선글라스": "retro sunglasses",
    "비니": "beanie", "슬라우치 비니": "slouchy beanie", "버킷햇": "bucket hat",
    "크로스바디 백": "crossbody bag", "비닐 미니백": "vinyl mini bag",
    "홀로그램 백": "hologram bag", "캔틴 백": "canteen bag",
    "커프스 버튼": "cufflinks", "골드 커프링크": "gold cufflinks",
    "나비 브로치": "butterfly brooch", "빈티지 브로치": "vintage brooch",
    "골드 앵클릿": "gold anklet", "실버 앵클릿": "silver anklet",
    "십자가 펜던트": "cross pendant", "고딕 초커": "gothic choker",
    "본 링": "bone ring", "스컬 링": "skull ring",
    "블랙 크라운": "black crown", "가시 왕관": "thorn crown",
    "아미 패치": "army patch", "더블 버클": "double buckle",
    "메달 장식": "medal decorations", "컴패스 브로치": "compass brooch",
    "빈티지 스카프": "vintage scarf", "폼폼 이어링": "pom-pom earrings",
    "하트 패치": "heart patch", "버터플라이 클립": "butterfly clip",
    "피셔넷 스타킹": "fishnet stockings", "피쉬넷 스타킹": "fishnet stockings",
    "페어리 윙": "fairy wings", "플로럴 크라운": "floral crown",
    "날개 하네스": "wing harness", "레이븐 페더": "raven feather accents",

    // Colors / Palettes
    "네온 라이팅": "neon lighting", "네온 액센트": "neon accents",
    "네온 그린": "neon green", "네온": "neon",
    "파스텔 컬러": "pastel colors", "파스텔": "pastel",
    "모노크롬 블랙": "monochrome black", "모노크롬": "monochrome",
    "핫핑크": "hot pink", "라임": "lime green",
    "올블랙": "all-black", "블러디 레드": "bloody red",
    "다크 레드 립": "dark red lip", "블러드문 컬러": "blood moon color",
    "베이비 핑크": "baby pink", "베이비 블루": "baby blue",
    "뉴트로 팔레트": "newtro palette", "카키 컬러": "khaki",
    "다크 올리브": "dark olive", "미드나잇 블루": "midnight blue",
    "퍼플 포이즌": "purple poison", "미드나잇 블랙": "midnight black",
    "핑크 퍼 트림": "pink fur trim", "골드 프레임": "gold frame",

    // Patterns / Prints
    "글리치 패턴": "glitch pattern", "디지털 프린트": "digital print",
    "와이어 프레임": "wireframe pattern",
    "타이다이 프린트": "tie-dye print", "체리 모티프": "cherry motif",
    "그래피티 프린트": "graffiti print", "체크 패턴": "check pattern",
    "핀스트라이프": "pinstripe", "스트릿 로고": "street logo print",
    "도트 패턴": "polka dot", "사이키델릭 프린트": "psychedelic print",
    "플라워 파워": "flower power print", "레코드 프린트": "vinyl record print",
    "스파이더 웹": "spider web pattern", "바로크 패턴": "baroque pattern",
    "불꽃 모티프": "flame motif", "백합 모티프": "lily motif",
    "플라워 자수": "floral embroidery", "엠브로이더리": "embroidery",
    "밴드 프린트 티": "band print tee", "패치워크": "patchwork",
    "컬러 블로킹 슈트": "color-blocking suit", "지퍼 디테일": "zipper details",

    // Balletcore / Neohanbok / Luxesport / Dark Romance
    "튤 스커트": "tulle skirt", "새틴 코르셋": "satin corset",
    "리본 레이스업": "ribbon lace-up", "포인트 슈즈": "pointe shoes",
    "레오타드 탑": "leotard top", "발레 랩스커트": "ballet wrap skirt",
    "실크 슬리퍼": "silk slippers", "토슈즈 앵클릿": "pointe shoe anklet",
    "발레리나 번": "ballerina bun", "튤 케이프": "tulle cape",
    "스완레이크 모티프": "swan lake motif", "파스텔 그라데이션": "pastel gradient",
    "고딕 레이스": "gothic lace", "블랙 케이프": "black cape",
    "레이스업 부츠": "lace-up boots", "오간자 베일": "organza veil",
    "블랙 로즈": "black rose", "뱀파이어 칼라": "vampire collar",
    "와인 새틴": "wine satin", "문라이트 실루엣": "moonlight silhouette",
    "블랙 레이스 베일": "black lace veil", "로즈 자수": "rose embroidery",
    "캔들라이트 무드": "candlelight mood",
    "모던 저고리": "modernized jeogori", "한복 리본": "hanbok ribbon",
    "금박 자수": "gold leaf embroidery", "실크 치마": "silk chima skirt",
    "오방색 컬러": "five-direction color palette", "고름 디테일": "goreum tie detail",
    "전통 문양": "traditional Korean pattern", "한지 텍스처": "hanji paper texture",
    "자개 장식": "mother-of-pearl ornament", "갓 모티프": "gat hat motif",
    "비단 원단": "silk brocade", "배자 레이어": "baeja vest layering",
    "옥색 팔레트": "jade color palette", "자수 패턴": "embroidery pattern",
    "노리개 악세서리": "norigae accessory", "두루마기 실루엣": "durumagi silhouette",
    "댕기 리본": "daenggi ribbon", "금사 자수": "gold thread embroidery",
    "매듭 장식": "maedeup knot ornament",
    "테일러드 트랙재킷": "tailored track jacket", "테크니컬 패브릭": "technical fabric",
    "실크 패널": "silk panel", "프리미엄 스니커즈": "premium sneakers",
    "로고 테이프": "logo tape trim", "슬림 조거": "slim jogger pants",
    "스포츠 선글라스": "sport sunglasses", "카본 텍스처": "carbon fiber texture",
    "야광 파이핑": "glow-in-the-dark piping", "에어로 핏": "aero fit",
    "테크웨어 고글": "techwear goggles", "퍼포먼스 니트": "performance knit",

    // Mood / Vibe
    "스모키 아이": "smoky eye makeup", "글로시 립": "glossy lip",
    "글로우 스킨": "glowing skin", "레드 립스틱 무드": "red lipstick mood",
    "소프트 글리터": "soft glitter", "글리터 바디": "glitter body",
    "폴라로이드 무드": "polaroid mood", "디스코 볼": "disco ball vibe",
    "안개 효과": "fog effect",
};

/** Translate a single Korean tag to English */
function translateTag(tag: string): string {
    const trimmed = tag.trim();
    if (KO_EN_MAP[trimmed]) return KO_EN_MAP[trimmed];

    // Try partial match — longest match first
    for (const [ko, en] of Object.entries(KO_EN_MAP)) {
        if (trimmed.includes(ko)) return en;
    }

    // If already English or unknown, pass through
    return trimmed;
}

/** Convert comma-separated Korean tags to English keywords (no natural language wrapping) */
function tagsToEnglish(tagsStr: string): string {
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length === 0) return "";
    return [...new Set(tags.map(translateTag))].join(", ");
}

/** Extract English fashion terms and translate Korean style words from stylist advice */
function extractStyleKeywords(advice: string): string {
    const englishTerms = advice.match(/[A-Za-z][A-Za-z\-]{2,}/g) || [];

    const translated: string[] = [];
    for (const [ko, en] of Object.entries(KO_EN_MAP)) {
        if (advice.includes(ko)) translated.push(en);
    }

    const combined = [...new Set([...translated, ...englishTerms.filter(t => t.length > 2)])];
    return combined.slice(0, 12).join(", ");
}

// =============================================================================
// Content Safety
// =============================================================================

/** Blocked terms — reject generation if any match found in user input */
const BLOCKED_TERMS = [
    // Explicit nudity / pornography (NOT fashion-sexy — K-POP sexy concepts are allowed)
    "nude", "naked", "topless", "bottomless", "nsfw", "porn", "hentai",
    "orgasm", "genital", "penis", "vagina", "intercourse",
    "nipple", "bondage", "bdsm", "fetish", "loli", "underage", "child abuse",
    // Violence / gore
    "gore", "dismember", "decapitat", "mutilat", "torture", "rape",
    // Hate
    "nazi", "swastika", "white supremac", "racial slur",
    // Self-harm / drugs
    "suicide", "self-harm", "drug injection", "meth", "cocaine",
    // Korean — explicit only (패션 노출/섹시는 허용)
    "누드", "나체", "알몸", "벗은", "포르노", "야동", "성인물",
    "성행위", "성관계", "자위", "음부", "성기",
    "고문", "참수", "살해", "강간", "아동학대",
    "나치", "인종차별", "자살", "자해", "마약",
];

/** Check if user input contains blocked content */
function containsBlockedContent(text: string): boolean {
    const lower = text.toLowerCase().replace(/[\s_\-\.]/g, "");
    return BLOCKED_TERMS.some((term) => lower.includes(term.replace(/[\s_\-]/g, "")));
}

/** Safety prefix injected into every prompt (invisible to users) */
const SAFETY_PREFIX = "Professional K-POP stage performance fashion editorial photo. Sensual and alluring stage outfits are allowed, but absolutely no full nudity, no explicit sexual content, no pornography, no gore, no hate symbols. The subject must always be wearing a stage costume.";

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

        const { prompt, idolType, conceptStyle, conceptPrompt, imageCount: requestedCount, stylistAdvice, posePrompt, quality } = body;

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

        // Content safety: block NSFW/harmful input
        const allUserText = [prompt, stylistAdvice, posePrompt].filter(Boolean).join(" ");
        if (containsBlockedContent(allUserText)) {
            return NextResponse.json(
                { error: "부적절한 내용이 포함되어 있습니다. 패션/의상 관련 키워드만 사용해주세요." },
                { status: 400 }
            );
        }

        if (!process.env.FAL_KEY) {
            return NextResponse.json(
                { error: "FAL_KEY is not configured" },
                { status: 500 }
            );
        }

        const usePro = quality === "pro";
        const idolLabel = idolType || "K-POP idol";
        const conceptKeywords = conceptPrompt || "";
        const conceptMood = conceptStyle || "charismatic, stylish, energetic";
        const count = Math.min(Math.max(Number(requestedCount) || 1, 1), 4);
        const adviceKeywords = stylistAdvice ? extractStyleKeywords(stylistAdvice) : "";

        // Translate Korean tags to English keywords (direct, no wrapping)
        const outfitKeywords = tagsToEnglish(prompt);

        // Pre-shuffle variation banks
        const shuffledPoses = shuffle(POSES);
        const shuffledCameras = shuffle(CAMERAS);
        const shuffledAngles = shuffle(ANGLES);
        const shuffledLighting = shuffle(LIGHTING);

        const buildPrompt = (index: number) => {
            const pose = posePrompt || shuffledPoses[index % shuffledPoses.length];
            const camera = shuffledCameras[index % shuffledCameras.length];
            const angle = shuffledAngles[index % shuffledAngles.length];
            const light = shuffledLighting[index % shuffledLighting.length];

            return [
                // Safety guardrail (invisible to user, highest priority)
                SAFETY_PREFIX,
                `Editorial fancam photograph of a real Korean ${idolLabel} ${pose} on a massive concert stage.`,
                `Wearing: ${outfitKeywords}.`,
                conceptKeywords ? `${conceptKeywords} aesthetic.` : "",
                `Mood: ${conceptMood}.`,
                adviceKeywords ? `Style: ${adviceKeywords}.` : "",
                "Authentic Korean beauty, natural skin texture, real hair, K-POP stage makeup.",
                `${light}.`,
                `${camera}, ${angle}.`,
            ].filter(Boolean).join(" ");
        };

        const generateOne = (index: number) => {
            const variedPrompt = buildPrompt(index);
            console.log(`[Generate][${usePro ? "PRO" : "LIGHT"}] #${index + 1}/${count}:`, variedPrompt.substring(0, 120) + "...");

            if (usePro) {
                return fal.subscribe("fal-ai/flux-2-pro", {
                    input: {
                        prompt: variedPrompt,
                        image_size: "portrait_4_3" as const,
                        seed: Math.floor(Math.random() * 2147483647),
                        safety_tolerance: 3,
                    },
                    logs: false,
                    pollInterval: 1500,
                });
            }

            // Light mode: flux-2/turbo — fast + affordable
            return fal.subscribe("fal-ai/flux-2/turbo", {
                input: {
                    prompt: variedPrompt,
                    image_size: "portrait_4_3" as const,
                    num_inference_steps: 8,
                    guidance_scale: 2.5,
                    seed: Math.floor(Math.random() * 2147483647),
                    enable_safety_checker: true,
                },
                logs: false,
                pollInterval: 1000,
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

        return NextResponse.json({ urls, quality: usePro ? "pro" : "light" });
    } catch (error: unknown) {
        console.error("Generate error:", error);

        let message = "Image generation failed";
        let status = 500;

        if (error instanceof Error) {
            message = error.message;
            // Extract fal.ai status if available
            const errAny = error as Record<string, unknown>;
            if (errAny.status) status = Number(errAny.status) || 500;
            if (errAny.body) console.error("fal.ai error body:", JSON.stringify(errAny.body));
        }

        return NextResponse.json({ error: message }, { status });
    }
}
