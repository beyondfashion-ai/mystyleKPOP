# 💰 mystyleKPOP 수익화 전략 최종안 (v4.0)

> **"K-POP 팬덤의 본질(Privacy, Ownership)을 겨냥하여 수익을 창출한다."**
> (Updated: 2026-02-18 / Finalized by Grand Roundtable)

---

## 1. 핵심 변경 요약 (Executive Summary)

1.  **재화 (Currency):** 혼란스러웠던 '하트/슈퍼스타' 폐기 -> **'비트(Beat 🎵)'**와 **'다이아(Diamond 💎)'** 도입.
2.  **구독 (Subscription):** 사행성(Gacha) 대신 확실한 효용을 주는 **'Pro Studio (월 구독)'** 런칭.
3.  **광고 (Ad-Tech):** 로딩 화면 정책 위반 리스크 해소 -> **'Vignette (전면광고)'** 및 **'Native Banner'**로 전환.
4.  **커머스 (Affiliate):** 복잡한 이미지 스캔 기술 배제 -> **'K-POP 스타일 키워드 매칭(Deep Link)'**으로 즉시 수익화.

---

## 2. BM 구조: 3-Layer Monetization

| 구분 | 타겟 유저 | 상품명 | 핵심 가치 (Value Proposition) |
| :--- | :--- | :--- | :--- |
| **Layer 1** | **무과금 (Light)** | **무료 충전소** | 광고 보고 **비트(Beat)** 충전. (시간 <-> 재화 교환) |
| **Layer 2** | **소과금 (Core)** | **Pro Studio** | **"나만의 비공개 연습실"** (Private, High-Res, Fast). |
| **Layer 3** | **목적형 (Shopper)** | **Get Style** | "내 아이돌이 입은 옷, 쿠팡에서 최저가 찾기." |

---

## 3. 상세 기능 명세 (Feature Specs)

### A. 재화 시스템 (Currency)
- **🎵 비트 (Beat):**
    - 용도: 이미지 생성 (1회 = 1비트), 공개 갤러리 업로드.
    - 획득: 매일 5개 무료 리필, 광고 1회 시청당 +3개.
- **💎 다이아 (Diamond):**
    - 용도: **Pro Studio** 1개월권 구매, 비트 대량 구매(시간 절약).
    - 획득: 인앱 결제 (최조: 1,200원부터).

### B. Pro Studio 멤버십 (Killer Feature)
- **Concept:** "월 4,900원으로 누리는 **나만의 기획사(Private Agency).**"
- **혜택:**
    1.  **Secret Showroom:** 생성본이 공개 갤러리에 올라가지 않음. (프라이버시 보장).
    2.  **4K Upscale:** 인쇄 가능한 초고화질 다운로드 무제한.
    3.  **Priority Queue:** 대기열 없이 즉시 생성 (Fast Track).
    4.  **Style Preset:** 내 최애의 얼굴/체형(Seed) 저장 슬롯 무제한.

### C. 스타일 쇼핑 연결 (Smart Affiliate)
- **Logic:**
    - AI 프롬프트에서 패션 태그 추출 (`Pink`, `Crop Top`, `Cargo Pants`).
    - **"🔎 이 스타일 찾기"** 버튼 클릭 시.
    - `쿠팡/지그재그 검색 결과`로 새 탭 연결 (제휴 태그 포함).
- **Expansion (Phase 2):** 쿠팡 파트너스 API 연동 시, '검색 결과'가 아닌 '특정 추천 상품'으로 정교화.

### D. 광고 배치 (Ad Placement)
- **Loading:** 스피너 **하단**에 300x250 직사각형 광고 배치 (정책 준수).
- **Vignette:** 이미지 생성 완료 후 결과 페이지로 이동할 때 **전면 광고** 노출 (구글 자동 광고 설정).

---

## 4. 실행 로드맵 (Action Plan)

### [Phase 1.0] 리브랜딩 및 광고 최적화 (Priority: High)
- 재화 이름 변경 (`Heart` -> `Beat` / `Superstar` -> `Diamond`).
- 가챠(Gacha) 관련 코드 및 UI 전면 삭제.
- 애드센스 위치 수정 (로딩 하단, 결과 페이지 하단).

### [Phase 1.5] 커머스 연동 (Shopping)
- `src/lib/affiliate.ts` 구현: 키워드 추출 및 검색 URL 생성 로직.
- 결과 페이지에 "쇼핑하기" 버튼 UI 추가.

### [Phase 2.0] 결제 및 멤버십 (Payment)
- **포트원(PortOne)** 연동: 토스페이/카카오페이 결제 붙이기.
- `Pro Studio` 권한 체크 로직 구현 (`isPro` 플래그).
- '비공개 저장(Secret Showroom)' DB 스키마 업데이트.

---

## 5. 최종 승인 요청 (Approval)

이 **v4.0 전략**으로 확정하고 개발을 시작하시겠습니까?
