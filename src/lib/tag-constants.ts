// =============================================================================
// Concept-based Tag Definitions
// 컨셉별 스타일 태그 (AI 추천 실패 시 폴백 + 기본 데이터)
// 7 concepts × 15 tags (10 conceptTags + 5 recommendedTags)
// =============================================================================

export interface ConceptTagSet {
  conceptTags: string[];      // 10 core tags (material, silhouette, color, accessory, mood)
  recommendedTags: string[];  // 5 complementary / unexpected tags
}

export const CONCEPT_TAG_MAP: Record<string, ConceptTagSet> = {
  cyber: {
    conceptTags: [
      "홀로그래픽 소재", "크롬 메탈릭", "네온 라이팅", "PVC 하네스",
      "LED 악세서리", "미러 텍스처", "구조적 숄더", "사이버 고글",
      "글리치 패턴", "실버 부츠",
    ],
    recommendedTags: [
      "투명 레이어드", "로봇 아머", "UV 반응 원단", "와이어 프레임", "3D 프린팅 주얼리",
    ],
  },

  y2k: {
    conceptTags: [
      "로우라이즈 팬츠", "크롭탑", "버터플라이 클립", "글리터 아이섀도",
      "미니스커트", "플랫폼 슈즈", "비즈 목걸이", "타이다이 프린트",
      "벨벳 트랙수트", "핑크 퍼 트림",
    ],
    recommendedTags: [
      "홀로그램 백", "메쉬 레이어", "체리 모티프", "사이버 선글라스", "진주 초커",
    ],
  },

  highteen: {
    conceptTags: [
      "테니스 스커트", "니트 조끼", "리본 타이", "체크 패턴",
      "플리츠 스커트", "파스텔 컬러", "새틴 리본", "레이스 칼라",
      "캔버스 스니커즈", "카디건 레이어",
    ],
    recommendedTags: [
      "블루밍 플라워", "스트로베리 프린트", "글로시 립", "펄 버튼", "소프트 데님",
    ],
  },

  sexy: {
    conceptTags: [
      "코르셋 탑", "시어 패브릭", "슬릿 드레스", "레이스 보디수트",
      "새틴 슬립", "스틸레토 힐", "골드 체인", "딥 브이넥",
      "벨벳 쵸커", "시퀸 드레스",
    ],
    recommendedTags: [
      "레드 립스틱 무드", "블랙 레더 글러브", "메탈릭 네일", "백리스 디자인", "실크 로브",
    ],
  },

  suit: {
    conceptTags: [
      "더블 브레스트", "오버사이즈 블레이저", "와이드 팬츠", "핀스트라이프",
      "새틴 라펠", "타이 넥", "테일러드 핏", "커프스 버튼",
      "로퍼 슈즈", "모노크롬 블랙",
    ],
    recommendedTags: [
      "크롭 재킷", "파워 숄더", "벨벳 수트", "컬러 블로킹 슈트", "체인 브로치",
    ],
  },

  street: {
    conceptTags: [
      "오버사이즈 후디", "카고 팬츠", "청키 스니커즈", "그래피티 프린트",
      "레이어드 룩", "비니", "크로스바디 백", "워싱 데님",
      "나일론 윈드브레이커", "스트릿 로고",
    ],
    recommendedTags: [
      "밀리터리 디테일", "패치워크", "네온 액센트", "메쉬 패널", "유틸리티 벨트",
    ],
  },

  girlcrush: {
    conceptTags: [
      "레더 재킷", "스터드 디테일", "블랙 하네스", "플랫폼 부츠",
      "체인 벨트", "크롭 코르셋", "핫팬츠", "스모키 아이",
      "피셔넷 스타킹", "시퀸 브라탑",
    ],
    recommendedTags: [
      "불꽃 모티프", "메탈 스파이크", "블러디 레드", "파워 글러브", "컴뱃 부츠",
    ],
  },
};

/** Get tags for a given concept with fallback to empty */
export function getConceptTags(conceptId: string): ConceptTagSet {
  return CONCEPT_TAG_MAP[conceptId] || { conceptTags: [], recommendedTags: [] };
}
