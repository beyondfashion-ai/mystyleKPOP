"use client";

import LegalPageLayout from "@/components/LegalPageLayout";

export default function CommunityGuidelinesPage() {
  return (
    <LegalPageLayout
      pageTitle="커뮤니티 가이드라인"
      subtitle="Community Guidelines"
      effectiveDate="2026년 2월 19일"
      version="v1.0"
    >
      <Section title="제1조 (커뮤니티 목적 및 가치)">
        <p>
          MY-STYLE.AI 커뮤니티는 K-POP 팬들이 창의적인 무대 의상 디자인을 공유하고,
          서로의 작품을 감상하며 응원하는 건강한 팬 문화 공간입니다.
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>창의성 존중:</strong> 모든 참여자의 창작물과 아이디어를 존중합니다.</li>
          <li><strong>건강한 경쟁:</strong> 공정한 투표와 랭킹을 통해 선의의 경쟁을 지향합니다.</li>
          <li><strong>포용적 환경:</strong> 성별, 국적, 팬덤에 관계없이 누구나 환영받는 공간을 만듭니다.</li>
          <li><strong>응원 문화:</strong> 비판보다 응원을, 경쟁보다 함께 성장하는 문화를 추구합니다.</li>
        </ul>
      </Section>

      <Section title="제2조 (허용되는 콘텐츠)">
        <ul className="list-disc pl-5 space-y-1">
          <li>AI를 활용한 K-POP 무대 의상 디자인 및 스타일 시안</li>
          <li>디자인에 대한 건설적인 피드백 및 응원 메시지</li>
          <li>패션 트렌드, 스타일링 아이디어 등 창작 관련 토론</li>
          <li>팬으로서의 응원과 지지 표현</li>
        </ul>
      </Section>

      <Section title="제3조 (금지 콘텐츠)">
        <p>다음에 해당하는 콘텐츠는 엄격히 금지됩니다:</p>
        <div className="space-y-3 mt-2">
          <div>
            <p className="font-bold text-black">혐오 및 차별</p>
            <p>인종, 성별, 성적 지향, 종교, 국적, 장애 등에 기반한 혐오 표현 및 차별적 콘텐츠</p>
          </div>
          <div>
            <p className="font-bold text-black">성적 콘텐츠</p>
            <p>성적으로 노골적이거나 선정적인 이미지 및 텍스트. 아티스트에 대한 성적 대상화</p>
          </div>
          <div>
            <p className="font-bold text-black">폭력적 콘텐츠</p>
            <p>폭력을 조장하거나 미화하는 이미지 및 표현</p>
          </div>
          <div>
            <p className="font-bold text-black">저작권 침해</p>
            <p>타인의 디자인 무단 복제, 공식 사진/로고의 무단 사용, 기획사 공식 콘텐츠의 도용</p>
          </div>
          <div>
            <p className="font-bold text-black">스팸 및 사기</p>
            <p>반복적인 홍보성 게시물, 피싱 링크, 사기성 콘텐츠, 자동화 도구를 이용한 대량 게시</p>
          </div>
        </div>
      </Section>

      <Section title="제4조 (투표/좋아요 조작 금지)">
        <p>공정한 랭킹 운영을 위해 다음 행위는 엄격히 금지됩니다:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>다중 계정을 이용한 좋아요/부스트 조작</li>
          <li>자동화 봇을 이용한 투표 조작</li>
          <li>좋아요 교환을 목적으로 한 조직적 행위</li>
          <li>금전적 대가를 통한 투표 매수</li>
        </ul>
        <p className="mt-2">
          투표 조작이 감지될 경우, 해당 투표는 무효 처리되며 관련 계정에 제재가 적용됩니다.
        </p>
      </Section>

      <Section title="제5조 (신고 및 처리 절차)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>신고 접수:</strong> 부적절한 콘텐츠 발견 시 디자인 상세 페이지의 신고 버튼 또는
            이메일(report@mystyle.ai)을 통해 신고할 수 있습니다.
          </li>
          <li>
            <strong>1차 검토:</strong> 신고 접수 후 24시간 이내에 1차 검토가 진행됩니다.
          </li>
          <li>
            <strong>조치:</strong> 가이드라인 위반이 확인된 콘텐츠는 비공개 처리되며,
            게시자에게 사유가 통보됩니다.
          </li>
          <li>
            <strong>허위 신고:</strong> 반복적인 허위 신고 역시 커뮤니티 가이드라인 위반으로 제재 대상이 됩니다.
          </li>
        </ol>
      </Section>

      <Section title="제6조 (제재 단계)">
        <table className="w-full mt-1 text-[12px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-bold">단계</th>
              <th className="text-left py-2 font-bold">조치</th>
              <th className="text-left py-2 font-bold">내용</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2">1단계</td>
              <td className="py-2">경고</td>
              <td className="py-2">해당 콘텐츠 비공개 + 경고 알림</td>
            </tr>
            <tr>
              <td className="py-2">2단계</td>
              <td className="py-2">일시 제한</td>
              <td className="py-2">7일간 게시/투표 기능 제한</td>
            </tr>
            <tr>
              <td className="py-2">3단계</td>
              <td className="py-2">장기 제한</td>
              <td className="py-2">30일간 전체 서비스 이용 제한</td>
            </tr>
            <tr>
              <td className="py-2">4단계</td>
              <td className="py-2">영구 차단</td>
              <td className="py-2">계정 영구 정지 및 모든 콘텐츠 비공개</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2">
          중대한 위반(혐오 표현, 불법 콘텐츠 등)의 경우 경고 없이 즉시 차단될 수 있습니다.
        </p>
      </Section>

      <Section title="제7조 (이의 제기)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>제재 조치에 이의가 있는 경우, 통보일로부터 14일 이내에 이의를 제기할 수 있습니다.</li>
          <li>
            이의 제기는 이메일(appeal@mystyle.ai)을 통해 접수 가능하며,
            제재 사유, 본인 주장, 관련 증빙을 포함해야 합니다.
          </li>
          <li>이의 제기 접수 후 영업일 기준 7일 이내에 검토 결과를 통보합니다.</li>
          <li>검토 결과에 따라 제재가 유지, 경감, 또는 해제될 수 있습니다.</li>
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
