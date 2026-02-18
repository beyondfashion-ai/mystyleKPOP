import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

const SYSTEM_PROMPT = `당신은 K-POP 무대의상 AI 이미지 생성용 프롬프트 전문가입니다.

[작업]
사용자의 원본 프롬프트(의상 키워드)와 AI 스타일리스트의 조언을 조합하여,
AI 이미지 생성에 최적화된 새 프롬프트를 만드세요.

[규칙]
- 출력은 한글 키워드를 쉼표(,)로 구분한 형태만 허용
- 원본에서 유지할 것은 유지, 조언에서 반영할 것만 추가/교체
- 조언이 "빼세요"라고 한 요소는 원본에서 제거
- 조언이 "교체하세요"라고 한 요소는 원본에서 교체
- 조언의 감정적 표현/비유는 무시하고 실행 가능한 패션 키워드만 추출
- 최대 15개 키워드
- 설명, 문장, 부연 없이 키워드만 출력

[예시]
원본: 크롭 탑, 와이드 팬츠, 시퀸, 핫핑크
조언: 소재가 문제예요. 시퀸 대신 매트 실크로 바꾸고, 컬러는 버건디가 더 고급스럽거든요.
결과: 크롭 탑, 와이드 팬츠, 매트 실크, 버건디`;

export async function POST(request: Request) {
  try {
    const { originalPrompt, advice, idolType, concept } = await request.json();

    if (!originalPrompt || !advice) {
      return NextResponse.json(
        { error: "Missing originalPrompt or advice" },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      // Fallback: return original prompt as-is when Gemini is not configured
      return NextResponse.json({ refinedPrompt: originalPrompt });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const userMessage = [
      idolType ? `아이돌 타입: ${idolType}` : "",
      concept ? `컨셉: ${concept}` : "",
      `원본 프롬프트: ${originalPrompt}`,
      `스타일리스트 조언: ${advice}`,
      "",
      "위 정보를 바탕으로 새 프롬프트 키워드를 만들어주세요.",
    ]
      .filter((line) => line !== "" || line === "")
      .join("\n");

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n${userMessage}` }] },
      ],
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.3,
      },
    });

    const refinedPrompt = result.response.text()?.trim() || originalPrompt;

    return NextResponse.json({ refinedPrompt });
  } catch (error) {
    console.error("Refine prompt error:", error);
    // On any error, return original prompt so generation can still proceed
    try {
      const { originalPrompt } = await request.clone().json();
      return NextResponse.json({ refinedPrompt: originalPrompt || "" });
    } catch {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}
