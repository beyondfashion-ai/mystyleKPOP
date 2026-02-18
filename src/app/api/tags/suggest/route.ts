import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getConceptTags } from "@/lib/tag-constants";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

const CONCEPT_LABELS: Record<string, string> = {
  cyber: "사이버/미래지향적",
  y2k: "Y2K 레트로",
  highteen: "하이틴/프레피",
  sexy: "섹시/글래머러스",
  suit: "수트/포멀",
  street: "스트릿/어반",
  girlcrush: "걸크러쉬/에지",
  elegant: "요정/페어리/에테리얼",
  dark: "다크/고딕/인텐스",
  retro: "레트로/빈티지/클래식",
  military: "밀리터리/유니폼/스트럭처드",
};

const IDOL_TYPE_LABELS: Record<string, string> = {
  girlgroup: "걸그룹",
  boygroup: "보이그룹",
  solo: "솔로 아티스트",
};

export async function POST(request: Request) {
  try {
    const { idolType, conceptStyle, exclude } = await request.json();

    if (!conceptStyle) {
      return NextResponse.json(
        { error: "Missing conceptStyle" },
        { status: 400 }
      );
    }

    const excludeList: string[] = Array.isArray(exclude)
      ? exclude.filter((t: unknown) => typeof t === "string")
      : [];

    const fallback = getConceptTags(conceptStyle, idolType);

    // Initial load (no exclude): always return local fallback instantly
    // Gemini is only used for "태그 추천 더받기" (has exclude list)
    if (excludeList.length === 0) {
      return NextResponse.json({
        conceptTags: fallback.conceptTags,
        recommendedTags: fallback.recommendedTags,
        source: "fallback" as const,
      });
    }

    // "더받기" request but no API key — return empty
    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        conceptTags: [],
        recommendedTags: [],
        source: "fallback" as const,
      });
    }

    const conceptLabel = CONCEPT_LABELS[conceptStyle] || conceptStyle;
    const idolLabel = IDOL_TYPE_LABELS[idolType] || "K-POP 아이돌";

    const excludeInstruction = excludeList.length > 0
      ? `\n- 다음 태그는 이미 추천했으므로 절대 포함하지 마세요: ${excludeList.join(", ")}`
      : "";

    const prompt = `당신은 K-POP 무대의상 스타일링 전문가입니다.
${idolLabel}의 "${conceptLabel}" 컨셉 무대의상에 어울리는 스타일 태그를 추천해주세요.

다음 JSON 형식으로만 응답하세요:
{
  "conceptTags": ["태그1", "태그2", ...],
  "recommendedTags": ["태그1", "태그2", ...]
}

규칙:
- conceptTags: 소재, 실루엣, 컬러, 악세서리, 무드 중심의 핵심 태그 20개
- recommendedTags: 의외성 있는 보완 태그 10개 (트렌디하거나 독특한 조합)
- 각 태그는 2~6글자 한국어 패션 키워드 (예: 크롬 메탈릭, 코르셋 탑)
- 중요: ${idolLabel} 의상에 적합한 태그만 추천. ${idolType === "boygroup" ? "미니스커트, 코르셋, 브라탑, 보디수트, 스타킹, 티아라, 하이힐 등 여성복 태그 제외." : ""}${excludeInstruction}
- JSON만 출력, 다른 텍스트 없이`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      });

      clearTimeout(timeout);

      const text = result.response.text();
      // Strip markdown code fences if present
      const jsonStr = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(jsonStr);

      const conceptTags = Array.isArray(parsed.conceptTags)
        ? parsed.conceptTags.filter((t: unknown) => typeof t === "string").slice(0, 20)
        : fallback.conceptTags;

      const recommendedTags = Array.isArray(parsed.recommendedTags)
        ? parsed.recommendedTags.filter((t: unknown) => typeof t === "string").slice(0, 10)
        : fallback.recommendedTags;

      return NextResponse.json({
        conceptTags,
        recommendedTags,
        source: "gemini" as const,
      });
    } catch {
      clearTimeout(timeout);
      // Gemini failed or timed out — return fallback
      return NextResponse.json({
        conceptTags: fallback.conceptTags,
        recommendedTags: fallback.recommendedTags,
        source: "fallback" as const,
      });
    }
  } catch (error) {
    console.error("Tag suggest error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
