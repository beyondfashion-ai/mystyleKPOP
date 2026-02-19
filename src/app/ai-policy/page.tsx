"use client";

import LegalPageLayout from "@/components/LegalPageLayout";

export default function AiPolicyPage() {
  return (
    <LegalPageLayout
      pageTitle="AI 콘텐츠 정책"
      subtitle="AI Content Policy"
      effectiveDate="2026년 2월 19일"
      version="v1.0"
    >
      <Section title="제1조 (AI 이미지 생성 기술)">
        <p>
          MY-STYLE.AI는 fal.ai의 Flux 모델을 사용하여 AI 이미지를 생성합니다.
          사용자가 입력한 프롬프트(키워드, 스타일 컨셉)를 바탕으로 K-POP 무대 의상 스타일의 이미지를 자동 생성합니다.
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>AI 생성 과정에서 다양한 포즈, 앵글, 프레이밍이 랜덤으로 적용됩니다.</li>
          <li>동일한 프롬프트로도 매번 다른 결과물이 생성될 수 있습니다.</li>
          <li>생성된 이미지는 실존하는 특정 인물을 의도적으로 재현하지 않습니다.</li>
        </ul>
      </Section>

      <Section title="제2조 (AI 스타일리스트 시스템)">
        <p>
          서비스 내 AI 버추얼 스타일리스트는 Google Gemini 2.0 Flash 모델을 기반으로 운영됩니다.
          4명의 가상 캐릭터가 사용자의 디자인에 대해 전문적인 피드백을 제공합니다.
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>AI 스타일리스트는 완전히 가상의 캐릭터이며, 실존 인물과 무관합니다.</li>
          <li>캐릭터 프로필에 언급되는 경력 및 배경은 허구적 설정입니다.</li>
          <li>피드백은 AI가 생성한 의견이며, 전문적인 패션 조언을 대체하지 않습니다.</li>
          <li>Google Search Grounding을 통해 최신 트렌드 정보를 참조할 수 있습니다.</li>
        </ul>
        <p className="mt-2 text-[11px] text-gray-500 bg-gray-50 rounded-lg p-3">
          AI 버추얼 스타일리스트 · 특정 기획사와 공식 관계 없음
        </p>
      </Section>

      <Section title="제3조 (AI 생성물의 법적 성격)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            AI를 통해 생성된 모든 이미지는 <strong>비공식 팬 창작물(Fan-created Content)</strong>입니다.
          </li>
          <li>
            생성된 이미지는 특정 기획사, 아티스트, 그룹의 공식 콘텐츠가 아니며,
            공식적인 제휴 또는 승인을 나타내지 않습니다.
          </li>
          <li>
            AI 생성 이미지의 저작권 관련 법적 판단은 각국의 법률에 따라 다를 수 있으며,
            사용자는 이를 인지하고 서비스를 이용해야 합니다.
          </li>
        </ol>
      </Section>

      <Section title="제4조 (프롬프트 비공개 정책)">
        <ul className="list-disc pl-5 space-y-1">
          <li>사용자가 입력한 프롬프트(키워드, 스타일 레시피)는 다른 사용자에게 <strong>절대 공개되지 않습니다.</strong></li>
          <li>프롬프트 데이터는 이미지 생성 목적으로만 사용되며, 별도 저장 후 서비스 개선에 활용될 수 있습니다.</li>
          <li>갤러리에 공개된 디자인에서도 프롬프트 정보는 비공개로 유지됩니다.</li>
        </ul>
      </Section>

      <Section title="제5조 (실존 아티스트/그룹 관련 정책)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>AI 프롬프트:</strong> 시스템은 &quot;Style Archetypes&quot;(Girl Crush, High Teen, Cyber 등)를
            사용하며, AI 생성 프롬프트에 실제 그룹명을 포함하지 않습니다.
          </li>
          <li>
            <strong>출력 필터:</strong> AI 생성 텍스트(스타일리스트 피드백 등)에서 실존 아티스트/그룹명이
            포함될 경우 자동으로 &quot;아티스트&quot;로 대체됩니다.
          </li>
          <li>
            <strong>사용자 태깅 (UGC):</strong> 사용자가 디자인에 직접 입력하는 그룹 태그는 사용자 생성 콘텐츠(UGC)로
            취급되며, 플랫폼은 &quot;인기 태그&quot;를 표시하는 중립적 역할만 수행합니다.
          </li>
        </ol>
      </Section>

      <Section title="제6조 (AI 생성물 상업적 이용 제한)">
        <ul className="list-disc pl-5 space-y-1">
          <li>AI 생성 이미지의 상업적 이용(광고, 상품화, 판매, 2차 배포)은 <strong>원칙적으로 금지</strong>됩니다.</li>
          <li>상업적 이용이 필요한 경우, 회사의 사전 서면 동의가 필요합니다.</li>
          <li>특정 아티스트/그룹과 관련된 디자인의 상업적 이용 시, 해당 권리자의 별도 허가가 필요합니다.</li>
          <li>개인 SNS 공유, 팬 커뮤니티 내 비상업적 공유는 허용됩니다.</li>
        </ul>
      </Section>

      <Section title="제7조 (AI 콘텐츠 신고 및 삭제)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            AI 생성 콘텐츠가 저작권, 초상권, 기타 권리를 침해한다고 판단되는 경우,
            누구든지 신고할 수 있습니다.
          </li>
          <li>
            신고 접수 후 영업일 기준 3일 이내에 검토를 완료하며,
            침해가 확인된 콘텐츠는 즉시 비공개 처리됩니다.
          </li>
          <li>
            반복적인 침해 콘텐츠를 생성하는 계정은 경고 → 이용 제한 → 영구 차단 절차가 적용됩니다.
          </li>
          <li>
            콘텐츠 신고:{" "}
            <a href="mailto:report@mystyle.ai" className="text-black underline underline-offset-2">
              report@mystyle.ai
            </a>
          </li>
        </ol>
      </Section>
    </LegalPageLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5">
      <h2 className="text-[15px] font-bold font-korean mb-3">{title}</h2>
      <div className="text-[13px] text-gray-700 leading-relaxed font-korean space-y-2">
        {children}
      </div>
    </section>
  );
}
