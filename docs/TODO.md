# TODO

## ✅ AI Virtual Stylist — 가상 CD 프로필 전환 완료 (2026-02-15)

> **전환 완료:** 기획사 대리인 → 가상 인물(전직 CD) 프로필로 전환
> **변경 파일:** `stylist-personas.ts`, `api/stylist/feedback/route.ts`, `StylistFeedbackCard.tsx`

### 완료된 조치
- [x] 페르소나 전환: SN→NOVA(차하은), YCC→ONYX(윤시혁), HIBE→LORE(서유진), JIP→PRISM(한도윤)
- [x] systemPrompt에서 "회사의 디렉터" 프레이밍 → "전직 CD, 독립 스타일하우스 운영" 전환
- [x] systemPrompt에서 실제 아티스트명(aespa, BTS 등) 전면 제거
- [x] AI 출력 필터(filterArtistNames) 추가 — 실명 아티스트/그룹명 자동 치환
- [x] "SBS 케이팝스타 심사위원" 프레이밍 제거
- [x] 면책 고지문(Disclaimer) UI에 추가: "AI 버추얼 스타일리스트 · 특정 기획사와 공식 관계 없음"
- [x] Gemini 2.0 Flash + Google Search Grounding 적용 (실시간 트렌드 반영)
- [x] 회사별 아이코닉 프로젝트 바이오 반영 (광야, WHO'S NEXT?, 화양연화, 도파민 스테이징)

### 남은 조치
- [ ] 각 스타일리스트 아바타 이미지 생성 (`/images/stylists/nova|onyx|lore|prism.png`)
- [ ] 이용약관에 AI 생성 콘텐츠 면책 조항 추가
- [ ] 서비스 공개 전 법률 전문가 최종 검토 (회사명 경력 배경 허용 범위)

### 장기 전략 (Phase 2 파트너십)
- [ ] Style House 캐릭터(NOVA/ONYX/LORE/PRISM)를 독자 IP로 발전
- [ ] 팬 UGC 데이터 축적 후 기획사에 공식 파트너십 제안
- [ ] 파트너십 성사 시 NOVA → "SM Verified Stylist" 등으로 공식 전환
- [ ] 시즌 게스트 스타일리스트 시스템 도입
- [ ] 캐릭터 기반 수익화 (스타일리스트 선택권, 피드백 컬렉션 등)

> 상세 검토 내용: 2026-02-15 LEGAL/IP_STRATEGY/KPOP_EXPERT/PRODUCT_MD 4개 에이전트 합동 검토

---

## 스타일리스트 조언 반영 재생성 — Image-to-Image (I2I) 전환

- [ ] 현재 "조언 반영하여 디자인하기"는 텍스트 프롬프트 기반 (T2I)
- [ ] fal.ai I2I 모델로 전환 — 기존 생성 이미지를 input으로 + 조언 키워드를 prompt로
- [ ] I2I API 엔드포인트 조사 (fal-ai/flux 계열 img2img 또는 inpainting)
- [ ] strength/denoising 파라미터 조정 (원본 유지 vs 변형 정도 밸런스)
- [ ] Studio UI: 기존 이미지 선택 → 조언 키워드 반영 → I2I 생성 플로우

---

## Admin Console

- Add ad dwell-time controls for Studio loading ads.
- Move current hardcoded values in `src/app/studio/page.tsx` to admin-configurable settings.
- Support toggles for:
  - onboarding minimum dwell time
  - post-onboarding minimum dwell time
  - extra dwell cadence and duration

---

## Onboarding Reboot (2026-02-17)

- [ ] Restart onboarding flow planning from scratch.
- [ ] Draft signup journey inspired by shopcider-style low-friction flow.
- [ ] Define initial preset set (target: 6 presets) and copy for each.
- [ ] Create screen-by-screen onboarding script (buttons, helper text, error text).
- [ ] Prepare A/B test plan for flow order (`survey-first` vs `preset-first`).
