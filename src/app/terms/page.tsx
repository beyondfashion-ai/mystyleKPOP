"use client";

import LegalPageLayout from "@/components/LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout
      pageTitle="이용약관"
      subtitle="Terms of Service"
      effectiveDate="2026년 2월 19일"
      version="v1.0"
    >
      <Section title="제1조 (목적 및 정의)">
        <p>
          본 약관은 MY-STYLE.AI(이하 &quot;서비스&quot;)를 운영하는 beyondfashion-ai(이하 &quot;회사&quot;)와
          서비스를 이용하는 이용자(이하 &quot;회원&quot;) 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>&quot;서비스&quot;란 회사가 제공하는 AI 기반 K-POP 무대 의상 디자인 플랫폼 및 관련 제반 서비스를 말합니다.</li>
          <li>&quot;회원&quot;이란 본 약관에 동의하고 회원가입을 완료한 자를 말합니다.</li>
          <li>&quot;디자인&quot;이란 회원이 서비스를 통해 생성한 AI 이미지를 말합니다.</li>
          <li>&quot;크레딧&quot;이란 서비스 내에서 추가 기능 이용을 위해 사용되는 가상 재화를 말합니다.</li>
        </ul>
      </Section>

      <Section title="제2조 (서비스 이용 조건)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>서비스 이용을 위해서는 이메일 주소를 통한 회원가입이 필요합니다.</li>
          <li>만 14세 미만의 아동은 법정대리인의 동의 없이 서비스를 이용할 수 없습니다.</li>
          <li>회원가입 시 허위 정보를 기재하거나 타인의 정보를 도용할 경우, 서비스 이용이 제한될 수 있습니다.</li>
          <li>1인 1계정 원칙을 적용하며, 다중 계정 생성을 통한 부정 이용은 금지됩니다.</li>
        </ol>
      </Section>

      <Section title="제3조 (서비스 내용)">
        <p>회사가 제공하는 서비스의 주요 내용은 다음과 같습니다:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>AI 이미지 생성 (메이킹 룸):</strong> 프롬프트 입력을 통한 K-POP 무대 의상 스타일 이미지 생성</li>
          <li><strong>갤러리 (스타일 픽):</strong> 생성된 디자인의 공유 및 커뮤니티 탐색</li>
          <li><strong>랭킹 (명예의 전당):</strong> 월간 좋아요/부스트 기반 디자인 순위 산정</li>
          <li><strong>AI 스타일리스트:</strong> 가상 AI 캐릭터를 통한 디자인 피드백 제공</li>
          <li><strong>우승작 제작:</strong> 월간 1위 우승 디자인의 실물 의상 제작 연결</li>
        </ul>
      </Section>

      <Section title="제4조 (이용자 의무 및 금지행위)">
        <p>회원은 다음 각 호의 행위를 하여서는 안 됩니다:</p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>타인의 저작권, 초상권, 상표권 등 지적재산권을 침해하는 콘텐츠 생성 및 게시</li>
          <li>혐오, 차별, 폭력, 성적으로 부적절한 콘텐츠 생성 및 게시</li>
          <li>다중 계정, 자동화 도구 등을 이용한 투표/좋아요 조작</li>
          <li>서비스의 정상적인 운영을 방해하는 행위</li>
          <li>타 회원의 개인정보를 무단으로 수집하거나 유포하는 행위</li>
          <li>서비스를 이용하여 영리 목적의 광고, 스팸 등을 게시하는 행위</li>
        </ol>
      </Section>

      <Section title="제5조 (지적재산권)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>AI 생성 콘텐츠:</strong> 서비스를 통해 생성된 AI 이미지는 팬 창작 목적의 비공식 시안입니다.
            회원은 생성된 이미지를 개인적, 비상업적 목적으로 사용할 수 있습니다.
          </li>
          <li>
            <strong>UGC 권리:</strong> 회원이 갤러리에 공개한 디자인에 대해 회사는 서비스 운영 및 홍보 목적으로
            이용할 수 있는 비독점적 라이선스를 보유합니다.
          </li>
          <li>
            <strong>프롬프트 보호:</strong> 회원이 입력한 프롬프트(키워드, 레시피)는 다른 회원에게 공개되지 않습니다.
          </li>
          <li>
            <strong>상업적 이용 제한:</strong> AI 생성물의 상업적 활용(광고, 상품화, 판매 등)을 위해서는
            회사의 사전 서면 동의 및 해당 권리자의 허락이 필요합니다.
          </li>
        </ol>
      </Section>

      <Section title="제6조 (서비스 변경 및 중단)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>회사는 운영상, 기술상의 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.</li>
          <li>서비스 변경 또는 중단 시 회사는 합리적인 기간 전에 서비스 내 공지를 통해 회원에게 알립니다.</li>
          <li>회사는 무료로 제공되는 서비스의 일부 또는 전부를 회사의 정책에 따라 수정, 중단, 변경할 수 있으며, 이에 대해 관련 법령에 특별한 규정이 없는 한 별도의 보상을 하지 않습니다.</li>
        </ol>
      </Section>

      <Section title="제7조 (면책조항)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>회사는 AI가 생성한 이미지의 정확성, 완전성, 적합성을 보증하지 않습니다.</li>
          <li>AI 생성물은 특정 기획사, 아티스트, 그룹과의 공식적인 관계를 나타내지 않습니다.</li>
          <li>회원이 서비스를 통해 생성한 콘텐츠의 사용으로 인해 발생하는 법적 책임은 해당 회원에게 있습니다.</li>
          <li>천재지변, 서버 장애 등 불가항력적 사유로 인한 서비스 중단에 대해 회사는 책임을 지지 않습니다.</li>
        </ol>
      </Section>

      <Section title="제8조 (분쟁 해결 및 관할법원)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>본 약관과 관련하여 분쟁이 발생한 경우, 회사와 회원은 우선적으로 상호 협의하여 해결하도록 노력합니다.</li>
          <li>협의가 이루어지지 않을 경우, 관련 법령에 따른 관할 법원에 소를 제기할 수 있습니다.</li>
          <li>본 약관은 대한민국 법률에 따라 규율되고 해석됩니다.</li>
        </ol>
      </Section>

      <ContactSection />
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

function ContactSection() {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5">
      <h2 className="text-[15px] font-bold font-korean mb-2">문의</h2>
      <p className="text-[13px] text-gray-700 font-korean">
        본 약관에 대한 문의:{" "}
        <a href="mailto:support@mystyle.ai" className="text-black underline underline-offset-2">
          support@mystyle.ai
        </a>
      </p>
    </section>
  );
}
