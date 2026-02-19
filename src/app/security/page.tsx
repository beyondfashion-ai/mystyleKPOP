"use client";

import LegalPageLayout from "@/components/LegalPageLayout";

export default function SecurityPage() {
  return (
    <LegalPageLayout
      pageTitle="데이터 보안 고지"
      subtitle="Data Security Notice"
      effectiveDate="2026년 2월 19일"
      version="v1.0"
    >
      <Section title="제1조 (데이터 암호화)">
        <div className="space-y-3">
          <div>
            <p className="font-bold text-black">전송 구간 암호화</p>
            <p>
              서비스와 사용자 간의 모든 데이터 전송은 TLS 1.3 프로토콜을 통해 암호화됩니다.
              Vercel Edge Network를 통해 HTTPS가 기본 적용되어 있으며,
              중간자 공격(MITM)으로부터 데이터를 보호합니다.
            </p>
          </div>
          <div>
            <p className="font-bold text-black">저장 데이터 암호화</p>
            <p>
              Firebase/Google Cloud 인프라에 저장되는 모든 데이터는
              서버 측 암호화(Server-Side Encryption)가 적용됩니다.
              AES-256 암호화 표준을 사용하며, 암호화 키는 Google이 관리합니다.
            </p>
          </div>
        </div>
      </Section>

      <Section title="제2조 (인증 보안)">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Firebase Authentication:</strong> 사용자 인증은 Google의 Firebase Authentication 서비스를 통해 처리됩니다.
          </li>
          <li>
            <strong>비밀번호 해싱:</strong> 사용자 비밀번호는 Firebase에서 자동으로 해싱 처리되어 저장되며,
            평문 비밀번호는 서버에 저장되지 않습니다.
          </li>
          <li>
            <strong>관리자 인증:</strong> 관리자 권한은 Firebase Custom Claims를 통해 서버 측에서만 검증되며,
            클라이언트 측 조작이 불가능합니다.
          </li>
          <li>
            <strong>세션 관리:</strong> Firebase ID Token을 통해 세션이 관리되며,
            토큰 만료 시 자동 갱신됩니다.
          </li>
        </ul>
      </Section>

      <Section title="제3조 (API 보안)">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>서버사이드 처리:</strong> 모든 데이터 변경(생성, 수정, 삭제)은 서버 측 API Route를 통해서만 수행됩니다.
            클라이언트에서 직접 데이터베이스를 수정할 수 없습니다.
          </li>
          <li>
            <strong>환경변수 관리:</strong> API 키, 비밀 키 등 민감한 정보는 환경변수로 관리되며,
            클라이언트 코드에 노출되지 않습니다.
          </li>
          <li>
            <strong>원자적 연산:</strong> 좋아요 수, 부스트 수 등 카운터 데이터는
            Firestore 트랜잭션/원자적 연산을 통해 처리되어 데이터 정합성을 보장합니다.
          </li>
          <li>
            <strong>Rate Limiting:</strong> API 엔드포인트에 요청 속도 제한이 적용되어
            악의적인 대량 요청을 방지합니다.
          </li>
        </ul>
      </Section>

      <Section title="제4조 (이미지 저장 보안)">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            AI 생성 이미지는 Firebase Storage에 저장되며,
            Firebase Security Rules를 통해 접근이 제어됩니다.
          </li>
          <li>
            공개된 디자인의 이미지는 읽기 전용으로 공개되며,
            업로드/수정/삭제 권한은 인증된 사용자의 본인 콘텐츠에만 부여됩니다.
          </li>
          <li>
            이미지 업로드 시 Google Cloud Vision API를 통해
            유해 콘텐츠 검수(SafeSearch)가 자동으로 수행됩니다.
          </li>
        </ul>
      </Section>

      <Section title="제5조 (인프라 보안)">
        <div className="space-y-3">
          <div>
            <p className="font-bold text-black">Vercel Edge Network</p>
            <p>
              서비스는 Vercel의 글로벌 Edge Network를 통해 제공되며,
              DDoS 방어, 자동 SSL 인증서 관리, CDN 캐싱 등의 보안 기능이 기본 적용됩니다.
            </p>
          </div>
          <div>
            <p className="font-bold text-black">Google Cloud Platform</p>
            <p>
              Firebase 및 관련 서비스는 Google Cloud Platform 인프라 위에서 운영되며,
              Google의 엔터프라이즈급 보안 표준(SOC 2, ISO 27001)이 적용됩니다.
            </p>
          </div>
          <div>
            <p className="font-bold text-black">코드 보안</p>
            <p>
              소스 코드는 비공개 저장소에서 관리되며, 배포 파이프라인을 통해서만
              프로덕션 환경에 반영됩니다.
            </p>
          </div>
        </div>
      </Section>

      <Section title="제6조 (취약점 신고 및 대응)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            서비스의 보안 취약점을 발견한 경우, 아래 이메일로 신고해 주시기 바랍니다.
          </li>
          <li>
            신고 시 다음 정보를 포함해 주세요:
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>취약점 유형 및 발견 위치</li>
              <li>재현 방법 (가능한 경우)</li>
              <li>예상되는 영향 범위</li>
            </ul>
          </li>
          <li>
            보안 취약점 신고는 영업일 기준 48시간 이내에 1차 응답을 드리며,
            심각도에 따라 우선순위를 결정하여 조치합니다.
          </li>
          <li>
            취약점을 책임감 있게 신고해 주신 분들에게 감사의 인정(Acknowledgment)을 제공합니다.
          </li>
        </ol>
        <p className="mt-3">
          보안 취약점 신고:{" "}
          <a href="mailto:security@mystyle.ai" className="text-black underline underline-offset-2">
            security@mystyle.ai
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
