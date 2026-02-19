"use client";

import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black pb-24">
      <Header pageTitle="About" subtitle="MY-STYLE.AI 소개" />

      <main className="max-w-md mx-auto px-6 space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="text-lg font-bold font-korean mb-3">MY-STYLE.AI는 무엇을 하는 서비스인가요?</h2>
          <p className="text-[13px] text-gray-700 leading-relaxed font-korean">
            MY-STYLE.AI는 K-POP 무대 의상에서 영감을 받은 팬 창작 경험을 제공하는 AI 기반 디자인 플랫폼입니다.
            사용자는 자신의 아이디어를 프롬프트로 입력해 스타일 이미지를 만들고, 커뮤니티에서 공유 및 반응을 확인할 수 있습니다.
            서비스의 목표는 팬의 창의적 참여를 확대하고, 건강한 커뮤니티 기반의 디자인 문화를 구축하는 것입니다.
            또한 월간 우승작은 K-POP전문 무대의상 제작팀의 현실 제작 프로세스로 연결되는 것을 지향합니다.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h3 className="text-[15px] font-bold font-korean mb-3">운영 원칙</h3>
          <ul className="text-[13px] text-gray-700 leading-relaxed font-korean space-y-2">
            <li>창작자 존중: 사용자 생성 콘텐츠(UGC)의 창작 맥락과 기여를 존중합니다.</li>
            <li>투명한 경험: 주요 기능과 커뮤니티 상호작용 방식이 이해 가능하도록 안내합니다.</li>
            <li>안전한 커뮤니티: 혐오, 명예훼손, 권리 침해 가능성이 있는 콘텐츠는 정책에 따라 제한될 수 있습니다.</li>
            <li>책임 있는 AI 활용: AI 결과물은 참고용 창작 산출물이며, 사실 진술이나 공식 정보로 간주되지 않습니다.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h3 className="text-[15px] font-bold font-korean mb-3">법적 고지 및 권리 안내</h3>
          <div className="text-[13px] text-gray-700 leading-relaxed font-korean space-y-3">
            <p>
              MY-STYLE.AI는 특정 K-POP 기획사, 연예기획사, 아티스트, 레이블, 방송사와 공식 제휴 또는 직접적인 운영 관계가 없는 독립 서비스입니다.
            </p>
            <p>
              본 서비스 내에서 언급될 수 있는 상호, 아티스트명, 그룹명, 로고, 트레이드드레스 및 관련 표지는 각 권리자에게 귀속되며,
              당사는 이에 대한 소유권을 주장하지 않습니다.
            </p>
            <p>
              AI 생성 결과물은 팬 창작 및 콘셉트 탐색 목적의 비공식 시안입니다. 상업적 활용, 대외 배포, 광고 집행, 상품화 등 권리 영향을
              수반하는 이용을 계획하는 경우, 반드시 해당 권리자 허락 및 별도 법률 검토를 거쳐야 합니다.
            </p>
            <p>
              당사는 준법 및 권리 보호 관점에서 서비스 정책을 지속적으로 보완하며, 출시/사업화 관련 최종 법률 판단은 전문 법률 자문을
              통해 확정하시길 권고합니다.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h3 className="text-[15px] font-bold font-korean mb-3">법률 및 정책 안내</h3>
          <nav className="space-y-0 divide-y divide-gray-100">
            {[
              { href: "/terms", label: "이용약관", sub: "Terms of Service" },
              { href: "/privacy", label: "개인정보처리방침", sub: "Privacy Policy" },
              { href: "/refund", label: "결제/환불 정책", sub: "Payment & Refund Policy" },
              { href: "/ai-policy", label: "AI 콘텐츠 정책", sub: "AI Content Policy" },
              { href: "/community-guidelines", label: "커뮤니티 가이드라인", sub: "Community Guidelines" },
              { href: "/security", label: "데이터 보안 고지", sub: "Data Security Notice" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between py-3 group"
              >
                <div>
                  <p className="text-[13px] font-bold font-korean text-black group-hover:text-gray-600">{item.label}</p>
                  <p className="text-[11px] text-gray-400">{item.sub}</p>
                </div>
                <span className="material-symbols-outlined text-gray-300 text-lg group-hover:text-gray-500">
                  chevron_right
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h3 className="text-[15px] font-bold font-korean mb-2">문의</h3>
          <p className="text-[13px] text-gray-700 font-korean">
            서비스 운영 및 정책 문의: {" "}
            <a href="mailto:support@mystyle.ai" className="text-black underline underline-offset-2">
              support@mystyle.ai
            </a>
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
