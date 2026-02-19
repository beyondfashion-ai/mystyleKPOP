"use client";

import LegalPageLayout from "@/components/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      pageTitle="개인정보처리방침"
      subtitle="Privacy Policy"
      effectiveDate="2026년 2월 19일"
      version="v1.0"
    >
      <Section title="제1조 (수집하는 개인정보 항목)">
        <p>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:</p>
        <table className="w-full mt-2 text-[12px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-bold">수집 시점</th>
              <th className="text-left py-2 font-bold">수집 항목</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2">회원가입</td>
              <td className="py-2">이메일 주소, 비밀번호(암호화), 닉네임</td>
            </tr>
            <tr>
              <td className="py-2">프로필 설정</td>
              <td className="py-2">프로필 이미지, 자기소개</td>
            </tr>
            <tr>
              <td className="py-2">서비스 이용</td>
              <td className="py-2">생성된 디자인 데이터, 좋아요/투표 기록, 프롬프트 입력 내용</td>
            </tr>
            <tr>
              <td className="py-2">자동 수집</td>
              <td className="py-2">IP 주소, 브라우저 정보, 접속 일시, 이용 기록</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="제2조 (수집 목적 및 이용)">
        <ul className="list-disc pl-5 space-y-1">
          <li>회원 식별 및 서비스 제공</li>
          <li>AI 이미지 생성 요청 처리</li>
          <li>갤러리 게시 및 커뮤니티 기능 운영</li>
          <li>좋아요/부스트 투표 및 랭킹 산정</li>
          <li>서비스 개선 및 통계 분석</li>
          <li>부정 이용 방지 및 서비스 보안</li>
          <li>고객 문의 대응 및 공지사항 전달</li>
        </ul>
      </Section>

      <Section title="제3조 (보유 기간)">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>회원 정보:</strong> 회원 탈퇴 시까지 (탈퇴 후 30일 이내 파기)</li>
          <li><strong>디자인 데이터:</strong> 회원 탈퇴 시 또는 삭제 요청 시까지</li>
          <li><strong>이용 기록:</strong> 서비스 이용 종료 후 1년</li>
          <li><strong>부정 이용 기록:</strong> 제재 종료 후 1년</li>
        </ul>
        <p className="mt-2">
          관련 법령에 의해 보존이 필요한 경우 해당 법령에서 정한 기간 동안 보존합니다.
        </p>
      </Section>

      <Section title="제4조 (제3자 제공)">
        <p>회사는 서비스 운영을 위해 다음 제3자에게 개인정보를 제공합니다:</p>
        <table className="w-full mt-2 text-[12px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-bold">제공 대상</th>
              <th className="text-left py-2 font-bold">제공 항목</th>
              <th className="text-left py-2 font-bold">목적</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2">Firebase (Google)</td>
              <td className="py-2">인증 정보, 디자인 데이터</td>
              <td className="py-2">인증, 데이터 저장, 파일 호스팅</td>
            </tr>
            <tr>
              <td className="py-2">fal.ai</td>
              <td className="py-2">프롬프트 텍스트</td>
              <td className="py-2">AI 이미지 생성</td>
            </tr>
            <tr>
              <td className="py-2">Vercel</td>
              <td className="py-2">접속 정보</td>
              <td className="py-2">서비스 호스팅 및 CDN</td>
            </tr>
            <tr>
              <td className="py-2">Google Cloud</td>
              <td className="py-2">텍스트 데이터</td>
              <td className="py-2">번역, 콘텐츠 검수, AI 스타일리스트</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="제5조 (개인정보 처리 위탁)">
        <p>
          회사는 원활한 서비스 제공을 위하여 위 제4조의 제3자에게 개인정보 처리를 위탁하고 있으며,
          위탁 계약 시 개인정보 보호 관련 법규의 준수, 개인정보 비밀 유지, 제3자 제공 금지,
          사고 시 손해배상 책임 등을 명확히 규정하고 있습니다.
        </p>
      </Section>

      <Section title="제6조 (이용자 권리)">
        <p>회원은 언제든지 다음의 권리를 행사할 수 있습니다:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>열람권:</strong> 본인의 개인정보 처리 현황을 확인할 수 있습니다.</li>
          <li><strong>정정권:</strong> 부정확한 개인정보에 대한 정정을 요청할 수 있습니다.</li>
          <li><strong>삭제권:</strong> 개인정보의 삭제를 요청할 수 있습니다.</li>
          <li><strong>탈퇴권:</strong> 언제든지 회원 탈퇴를 통해 개인정보 처리를 중단시킬 수 있습니다.</li>
        </ul>
        <p className="mt-2">
          권리 행사는 서비스 내 마이페이지 또는 이메일(support@mystyle.ai)을 통해 가능합니다.
        </p>
      </Section>

      <Section title="제7조 (쿠키 및 자동수집 정보)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            회사는 서비스 이용 편의 제공 및 분석을 위해 쿠키(Cookie)를 사용할 수 있습니다.
          </li>
          <li>
            회원은 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용에 일부 제한이 발생할 수 있습니다.
          </li>
          <li>
            Firebase Analytics를 통해 서비스 이용 패턴이 익명화된 형태로 수집될 수 있습니다.
          </li>
        </ol>
      </Section>

      <Section title="제8조 (개인정보 보호 조치)">
        <ul className="list-disc pl-5 space-y-1">
          <li>전송 구간 암호화 (TLS 1.3)</li>
          <li>비밀번호 해싱 처리 (Firebase Authentication)</li>
          <li>서버 측 데이터 암호화 (Firebase/Google Cloud)</li>
          <li>API 키 및 인증 정보의 환경변수 관리</li>
          <li>접근 권한 최소화 및 관리자 인증 (Firebase Custom Claims)</li>
        </ul>
      </Section>

      <Section title="제9조 (개인정보 보호책임자)">
        <table className="w-full text-[12px]">
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2 font-bold w-24">담당</td>
              <td className="py-2">개인정보 보호책임자</td>
            </tr>
            <tr>
              <td className="py-2 font-bold">이메일</td>
              <td className="py-2">
                <a href="mailto:privacy@mystyle.ai" className="text-black underline underline-offset-2">
                  privacy@mystyle.ai
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3">
          개인정보 침해에 대한 피해 구제, 상담이 필요한 경우 아래 기관에 문의하실 수 있습니다:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>개인정보침해신고센터 (privacy.kisa.or.kr / 118)</li>
          <li>대검찰청 사이버수사과 (spo.go.kr / 1301)</li>
          <li>경찰청 사이버안전국 (cyberbureau.police.go.kr / 182)</li>
        </ul>
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
