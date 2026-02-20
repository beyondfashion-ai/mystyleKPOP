import { NextResponse } from "next/server";
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { STYLIST_PERSONAS, type StylistFeedback } from "@/lib/stylist-personas";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

async function fetchImageAsBase64(
  url: string
): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/png";
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return { base64, mimeType: contentType };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { idolType, concept, keywords, imageUrl, personaIds } = await request.json();

    if (!concept) {
      return NextResponse.json(
        { error: "Missing concept field" },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Primary: Gemini 2.0 Flash with Google Search grounding
    const modelWithSearch = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [{ googleSearch: {} } as any],
    });

    // Fallback: without Google Search (in case grounding is unavailable)
    const modelBasic = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    // Fetch image for visual analysis
    const imageData = imageUrl ? await fetchImageAsBase64(imageUrl) : null;

    const textContext = [
      idolType ? `아이돌 타입: ${idolType}` : "",
      `컨셉: ${concept}`,
      keywords ? `키워드: ${keywords}` : "",
    ]
      .filter(Boolean)
      .join(". ");

    // If personaIds provided, only generate for those personas (faster)
    const targetPersonas = personaIds?.length
      ? STYLIST_PERSONAS.filter((p) => personaIds.includes(p.id))
      : STYLIST_PERSONAS;

    const feedbacks: StylistFeedback[] = await Promise.all(
      targetPersonas.map(async (persona) => {
        try {
          const parts: Part[] = [];

          // Add image if available
          if (imageData) {
            parts.push({
              inlineData: {
                mimeType: imageData.mimeType,
                data: imageData.base64,
              },
            });
          }

          // Gender-specific styling instruction injected after persona prompt
          const genderInstruction = idolType === "boygroup"
            ? "\n\n[중요 지시] 이 의상은 보이그룹용입니다. 미니스커트, 코르셋, 브라탑, 보디수트, 슬릿 드레스, 스타킹, 하이힐 등 여성 전용 아이템을 절대 추천하지 마세요. 파워숄더, 와이드팬츠, 테일러드 재킷, 레더 팬츠, 하네스, 체인 디테일, 컴뱃 부츠 등 남성 무대의상에 적합한 방향으로 조언하세요."
            : idolType === "girlgroup"
              ? "\n\n[참고] 이 의상은 걸그룹용입니다. 걸그룹 무대의상 특성(실루엣, 무브먼트, 팬서비스 포인트 등)을 고려하여 조언하세요."
              : "";

          // Construct prompt with search guidance
          parts.push({
            text: `${persona.systemPrompt}${genderInstruction}

${imageData ? "위 이미지는 유저가 AI로 생성한 K-POP 무대의상 디자인입니다. 이 이미지를 직접 보고 평가하세요." : ""}
디자인 정보: ${textContext}

최신 패션 트렌드를 검색하여 참고한 뒤, 당신의 관점에서 이 디자인을 평가해주세요. 반드시 한국어로 2~3줄. 당신만의 말투와 관점으로 짧고 임팩트 있게.`,
          });

          let text: string;
          try {
            // Try with Google Search grounding first
            const result = await modelWithSearch.generateContent({
              contents: [{ role: "user", parts }],
              generationConfig: {
                maxOutputTokens: 200,
                temperature: 0.9,
              },
            });
            text = result.response.text()?.trim() || "";
          } catch (searchErr) {
            console.warn(
              `[${persona.id}] Google Search grounding failed, falling back to basic model:`,
              searchErr instanceof Error ? searchErr.message : searchErr
            );
            // Fallback: generate without search grounding
            const result = await modelBasic.generateContent({
              contents: [{ role: "user", parts }],
              generationConfig: {
                maxOutputTokens: 200,
                temperature: 0.9,
              },
            });
            text = result.response.text()?.trim() || "";
          }

          if (!text) text = "피드백을 생성할 수 없습니다.";

          // Filter out any real artist/group names that might slip through
          const filtered = filterOutput(text);

          const shuffled = [...persona.tags].sort(() => Math.random() - 0.5);
          const selectedTags = shuffled.slice(0, 3);

          return {
            personaId: persona.id,
            fullName: persona.fullName,
            stylehouse: persona.stylehouse,
            title: persona.title,
            bio: persona.bio,
            philosophy: persona.philosophy,
            mbti: persona.mbti,
            feedback: filtered,
            tags: selectedTags,
            color: persona.color,
            icon: persona.icon,
            avatar: persona.avatar,
          };
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error(
            `Feedback generation failed for ${persona.id}:`,
            errMsg
          );
          return {
            personaId: persona.id,
            fullName: persona.fullName,
            stylehouse: persona.stylehouse,
            title: persona.title,
            bio: persona.bio,
            philosophy: persona.philosophy,
            mbti: persona.mbti,
            feedback:
              "현재 피드백을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.",
            tags: persona.tags.slice(0, 3),
            color: persona.color,
            icon: persona.icon,
            avatar: persona.avatar,
          };
        }
      })
    );

    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error("Stylist feedback error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Output filter: remove real K-POP artist/group names from AI responses
const BLOCKED_NAMES = [
  "BTS",
  "방탄소년단",
  "aespa",
  "에스파",
  "BLACKPINK",
  "블랙핑크",
  "TWICE",
  "트와이스",
  "NewJeans",
  "뉴진스",
  "LE SSERAFIM",
  "르세라핌",
  "Stray Kids",
  "스트레이키즈",
  "SEVENTEEN",
  "세븐틴",
  "NCT",
  "EXO",
  "엑소",
  "Red Velvet",
  "레드벨벳",
  "ITZY",
  "있지",
  "NMIXX",
  "엔믹스",
  "TXT",
  "투모로우바이투게더",
  "ENHYPEN",
  "엔하이픈",
  "TREASURE",
  "트레저",
  "BIGBANG",
  "빅뱅",
  "GOT7",
  "갓세븐",
  "BABYMONSTER",
  "베이비몬스터",
  "IVE",
  "아이브",
  "ILLIT",
  "아일릿",
  "NiziU",
  "니쥬",
  "2NE1",
  "투애니원",
  "SHINee",
  "샤이니",
  "f(x)",
  "에프엑스",
  "ATEEZ",
  "에이티즈",
  "Stray Kids",
];

function filterOutput(text: string): string {
  let filtered = text;
  // Remove citation markers from Google Search Grounding ([cite: ...], [1], etc.)
  filtered = filtered.replace(/\[cite:\s*[\d,\s]+\]/g, "");
  filtered = filtered.replace(/\[\d+\]/g, "");
  // Remove preamble phrases (AI greeting/acknowledgment before actual advice)
  filtered = filtered.replace(/^(네[,.]?\s*|예[,.]?\s*|알겠습니다[.!]?\s*|조언\s*(시작|드리|해)\S*\s*)/g, "");
  // Filter real artist/group names
  for (const name of BLOCKED_NAMES) {
    const regex = new RegExp(name, "gi");
    filtered = filtered.replace(regex, "아티스트");
  }
  return filtered.trim();
}
