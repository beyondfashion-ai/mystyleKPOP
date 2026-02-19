"use client";

import LegalPageLayout from "@/components/LegalPageLayout";

export default function RefundPage() {
  return (
    <LegalPageLayout
      pageTitle="결제/환불 정책"
      subtitle="Payment & Refund Policy"
      effectiveDate="2026년 2월 19일"
      version="v1.0"
    >
      <Section title="제1조 (결제 수단)">
        <p>
          현재 MY-STYLE.AI는 무료 서비스(Phase 1)로 운영되고 있으며, 유료 결제 기능은 Phase 2-B에서 도입될 예정입니다.
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>Phase 2-A:</strong> 무료 크레딧 (미션/광고 시청을 통해 획득)</li>
          <li><strong>Phase 2-B:</strong> PayPal을 통한 유료 크레딧 결제</li>
        </ul>
      </Section>

      <Section title="제2조 (크레딧 상품 안내)">
        <p>Phase 2-B에서 제공 예정인 크레딧 상품은 다음과 같습니다:</p>
        <table className="w-full mt-2 text-[12px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-bold">상품명</th>
              <th className="text-left py-2 font-bold">크레딧</th>
              <th className="text-left py-2 font-bold">가격</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2">Starter</td>
              <td className="py-2">50 Credits</td>
              <td className="py-2">$0.99</td>
            </tr>
            <tr>
              <td className="py-2">Basic</td>
              <td className="py-2">150 Credits</td>
              <td className="py-2">$2.49</td>
            </tr>
            <tr>
              <td className="py-2">Value</td>
              <td className="py-2">500 Credits</td>
              <td className="py-2">$6.99</td>
            </tr>
            <tr>
              <td className="py-2">Pro</td>
              <td className="py-2">1,200 Credits</td>
              <td className="py-2">$12.99</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-[11px] text-gray-500">
          * 상품 구성 및 가격은 사전 공지 후 변경될 수 있습니다.
        </p>
      </Section>

      <Section title="제3조 (환불 조건 및 절차)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>전액 환불:</strong> 결제 후 7일 이내, 크레딧을 전혀 사용하지 않은 경우 전액 환불이 가능합니다.
          </li>
          <li>
            <strong>부분 환불:</strong> 결제 후 7일 이내, 일부 크레딧을 사용한 경우 미사용 크레딧에 대해 비례 환불이 가능합니다.
          </li>
          <li>
            <strong>환불 불가:</strong> 결제 후 7일이 경과한 경우, 또는 크레딧을 전부 사용한 경우 환불이 불가합니다.
          </li>
        </ol>
      </Section>

      <Section title="제4조 (미사용 크레딧 환불 기준)">
        <ul className="list-disc pl-5 space-y-1">
          <li>미사용 크레딧은 결제일로부터 7일 이내에만 환불 신청 가능합니다.</li>
          <li>환불 금액 = (미사용 크레딧 수 / 구매 크레딧 수) × 결제 금액</li>
          <li>PayPal 수수료는 환불 금액에서 차감될 수 있습니다.</li>
          <li>환불 처리는 신청일로부터 영업일 기준 5일 이내에 완료됩니다.</li>
        </ul>
      </Section>

      <Section title="제5조 (결제 오류 처리)">
        <ul className="list-disc pl-5 space-y-1">
          <li>중복 결제, 미승인 결제 등 결제 오류 발생 시 즉시 전액 환불 처리됩니다.</li>
          <li>결제 오류 확인 후 영업일 기준 3일 이내에 환불이 완료됩니다.</li>
          <li>결제 오류 신고는 이메일(support@mystyle.ai)을 통해 접수 가능합니다.</li>
        </ul>
      </Section>

      <Section title="제6조 (무료/이벤트 크레딧)">
        <ul className="list-disc pl-5 space-y-1">
          <li>미션 완료, 광고 시청, 이벤트 등을 통해 획득한 무료 크레딧은 환불 대상이 아닙니다.</li>
          <li>무료 크레딧은 유효기간이 설정될 수 있으며, 기간 만료 시 자동 소멸됩니다.</li>
          <li>크레딧 사용 시 무료 크레딧이 유료 크레딧보다 우선 차감됩니다.</li>
        </ul>
      </Section>

      <Section title="문의">
        <p>
          결제 및 환불 관련 문의:{" "}
          <a href="mailto:support@mystyle.ai" className="text-black underline underline-offset-2">
            support@mystyle.ai
          </a>
        </p>
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
