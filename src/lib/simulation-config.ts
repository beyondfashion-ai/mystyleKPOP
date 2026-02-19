// Simulation agent personas — Korean tags that flow through the real /api/generate pipeline
// Tags are translated by the server-side tagsToEnglish() in /api/generate

export interface AgentPersona {
  name: string;
  groupTag: string;
  idolType: "girlgroup" | "boygroup";
  conceptId: string;
  tags: string[];
  comment: string | null;
}

export const AGENT_PERSONAS: AgentPersona[] = [
  // ── cyber (3) ──
  {
    name: "Aespa_Winter",
    groupTag: "aespa",
    idolType: "girlgroup",
    conceptId: "cyber",
    tags: ["홀로그래픽 소재", "크롬 메탈릭", "사이버 고글", "네온 라이팅", "글리치 패턴"],
    comment: "광야 컨셉 도전해봤어요!",
  },
  {
    name: "StayWithSkz",
    groupTag: "Stray Kids",
    idolType: "boygroup",
    conceptId: "cyber",
    tags: ["PVC 하네스", "네온 그린", "LED 악세서리", "메탈 메쉬", "컴뱃 부츠"],
    comment: "스키즈 미래지향적 컨셉 🔥",
  },
  {
    name: "NCTzen_Green",
    groupTag: "NCT",
    idolType: "boygroup",
    conceptId: "cyber",
    tags: ["리퀴드 메탈", "크롬 초커", "와이어 프레임", "네온 액센트", "플랫폼 부츠"],
    comment: "네오하다 네오해...",
  },

  // ── y2k (3) ──
  {
    name: "Moa_Txt",
    groupTag: "TXT",
    idolType: "boygroup",
    conceptId: "y2k",
    tags: ["타이다이 프린트", "청키 스니커즈", "베이비 핑크", "체리 모티프", "비니"],
    comment: "투바투 Y2K 감성 너무 좋아요 ㅠㅠ",
  },
  {
    name: "Luvies_Wendy",
    groupTag: "Red Velvet",
    idolType: "girlgroup",
    conceptId: "y2k",
    tags: ["핫핑크", "플리츠 스커트", "젤리 슈즈", "버터플라이 클립", "소프트 글리터"],
    comment: "레드벨벳 키치한 느낌 넘 좋아",
  },
  {
    name: "KissOfLife_Natty",
    groupTag: "KISS OF LIFE",
    idolType: "girlgroup",
    conceptId: "y2k",
    tags: ["로우라이즈 팬츠", "크롭탑", "폼폼 이어링", "파스텔 컬러", "디스코 볼"],
    comment: "키오프 핫걸 그 자체 🔥",
  },

  // ── highteen (3) ──
  {
    name: "Minji_Lover",
    groupTag: "NewJeans",
    idolType: "girlgroup",
    conceptId: "highteen",
    tags: ["오버사이즈 블레이저", "테니스 스커트", "캔버스 스니커즈", "체크 패턴", "리본 타이"],
    comment: "뉴진스 하이틴 룩 최고!",
  },
  {
    name: "Dive_Into_IVE",
    groupTag: "IVE",
    idolType: "girlgroup",
    conceptId: "highteen",
    tags: ["크리스탈 티아라", "베이비 블루", "새틴 리본", "카디건 레이어", "로퍼 슈즈"],
    comment: "아이브 공주님들 스타일 ✨",
  },
  {
    name: "Zerose_Hanbin",
    groupTag: "ZEROBASEONE",
    idolType: "boygroup",
    conceptId: "highteen",
    tags: ["슬림 타이", "레터맨 재킷", "하이탑 스니커즈", "베이비 블루", "체크 패턴"],
    comment: "제로베이스원 청량 컨셉 🌿",
  },

  // ── sexy (2) ──
  {
    name: "ReVeluv_Joy",
    groupTag: "Red Velvet",
    idolType: "girlgroup",
    conceptId: "sexy",
    tags: ["코르셋 탑", "슬릿 드레스", "스틸레토 힐", "레드 립스틱 무드", "벨벳 쵸커"],
    comment: null,
  },
  {
    name: "Engine_Heeseung",
    groupTag: "ENHYPEN",
    idolType: "boygroup",
    conceptId: "sexy",
    tags: ["벨벳 수트", "딥 브이넥", "골드 체인", "스모키 아이", "블러디 레드"],
    comment: "엔하이픈 다크문 컨셉 🧛‍♂️",
  },

  // ── suit (2) ──
  {
    name: "ArmyForever",
    groupTag: "BTS",
    idolType: "boygroup",
    conceptId: "suit",
    tags: ["더블 브레스트", "핀스트라이프", "커프스 버튼", "슬림 핏", "골드 커프링크"],
    comment: "방탄 무대 의상 피드백 부탁드려요!",
  },
  {
    name: "Sone_Taeyeon",
    groupTag: "Girls Generation",
    idolType: "girlgroup",
    conceptId: "suit",
    tags: ["테일러드 핏", "파워 숄더", "모노크롬 블랙", "나비 브로치", "스틸레토 힐"],
    comment: "소녀시대 수트 컨셉 기억하시는 분?",
  },

  // ── street (3) ──
  {
    name: "Carat_17",
    groupTag: "SEVENTEEN",
    idolType: "boygroup",
    conceptId: "street",
    tags: ["오버사이즈 후디", "카고 팬츠", "청키 스니커즈", "그래피티 프린트", "버킷햇"],
    comment: "세븐틴 스트릿 컨셉 해봤어요 ㅎㅎ",
  },
  {
    name: "Midzy_Yeji",
    groupTag: "ITZY",
    idolType: "girlgroup",
    conceptId: "street",
    tags: ["크롭 재킷", "와이드 팬츠", "플랫폼 슈즈", "스트릿 로고", "체인 벨트"],
    comment: null,
  },
  {
    name: "Fearless_Sakura",
    groupTag: "LE SSERAFIM",
    idolType: "girlgroup",
    conceptId: "street",
    tags: ["소프트 데님", "크롭탑", "워크 부츠", "카키 컬러", "크로스바디 백"],
    comment: "르세라핌 건강미 스타일 도전!",
  },

  // ── girlcrush (2) ──
  {
    name: "Blink_Jennie",
    groupTag: "BLACKPINK",
    idolType: "girlgroup",
    conceptId: "girlcrush",
    tags: ["레더 재킷", "블랙 하네스", "스터드 부츠", "올블랙", "스모키 아이"],
    comment: null,
  },
  {
    name: "Neverland_Idle",
    groupTag: "(G)I-DLE",
    idolType: "girlgroup",
    conceptId: "girlcrush",
    tags: ["레더 미니스커트", "메탈 스파이크", "컴뱃 부츠", "블러디 레드", "버클 하네스"],
    comment: "퀸카 그 자체...",
  },

  // ── balletcore (3) ──
  {
    name: "Kep1ian_Chaehyun",
    groupTag: "Kep1er",
    idolType: "girlgroup",
    conceptId: "balletcore",
    tags: ["튤 스커트", "새틴 코르셋", "리본 레이스업", "발레리나 번", "파스텔 그라데이션"],
    comment: null,
  },
  {
    name: "Wizone_Forever",
    groupTag: "IZ*ONE",
    idolType: "girlgroup",
    conceptId: "balletcore",
    tags: ["레오타드 탑", "실크 슬리퍼", "튤 케이프", "스완레이크 모티프", "펄 장식"],
    comment: "아이즈원 영원히 🌸",
  },
  {
    name: "Nswer_Kyujin",
    groupTag: "NMIXX",
    idolType: "girlgroup",
    conceptId: "balletcore",
    tags: ["발레 랩스커트", "새틴 리본", "토슈즈 앵클릿", "베이비 핑크", "시폰 레이어"],
    comment: "엔믹스 발레코어 도전!",
  },

  // ── darkromance (3) ──
  {
    name: "Insomnia_Dream",
    groupTag: "Dreamcatcher",
    idolType: "girlgroup",
    conceptId: "darkromance",
    tags: ["고딕 레이스", "블랙 케이프", "고딕 초커", "블랙 로즈", "캔들라이트 무드"],
    comment: null,
  },
  {
    name: "Monbebe_X",
    groupTag: "MONSTA X",
    idolType: "boygroup",
    conceptId: "darkromance",
    tags: ["벨벳 케이프", "와인 새틴", "십자가 펜던트", "레이스업 부츠", "문라이트 실루엣"],
    comment: "몬엑 다크 로맨스 도전",
  },
  {
    name: "Orbit_Loona",
    groupTag: "LOONA",
    idolType: "girlgroup",
    conceptId: "darkromance",
    tags: ["오간자 베일", "블랙 레이스 베일", "로즈 자수", "뱀파이어 칼라", "퍼플 포이즌"],
    comment: "이달소 감성은 대체불가 🌙",
  },

  // ── neohanbok (3) ──
  {
    name: "Exo_L",
    groupTag: "EXO",
    idolType: "boygroup",
    conceptId: "neohanbok",
    tags: ["모던 저고리", "금박 자수", "비단 원단", "고름 디테일", "옥색 팔레트"],
    comment: "엑소 한복 컨셉 상상해봤어요",
  },
  {
    name: "Shawol_Key",
    groupTag: "SHINee",
    idolType: "boygroup",
    conceptId: "neohanbok",
    tags: ["한복 리본", "실크 치마", "전통 문양", "자개 장식", "금사 자수"],
    comment: "샤이니는 트렌드 그 자체",
  },
  {
    name: "Atiny_San",
    groupTag: "ATEEZ",
    idolType: "boygroup",
    conceptId: "neohanbok",
    tags: ["두루마기 실루엣", "매듭 장식", "오방색 컬러", "배자 레이어", "노리개 악세서리"],
    comment: "에이티즈 네오한복 상상 🏮",
  },

  // ── luxesport (3) ──
  {
    name: "Treasure_Maker",
    groupTag: "TREASURE",
    idolType: "boygroup",
    conceptId: "luxesport",
    tags: ["테일러드 트랙재킷", "프리미엄 스니커즈", "로고 테이프", "카본 텍스처", "슬림 조거"],
    comment: null,
  },
  {
    name: "TheB_Sunwoo",
    groupTag: "THE BOYZ",
    idolType: "boygroup",
    conceptId: "luxesport",
    tags: ["테크니컬 패브릭", "실크 패널", "스포츠 선글라스", "야광 파이핑", "에어로 핏"],
    comment: null,
  },
  {
    name: "Plave_Fan",
    groupTag: "PLAVE",
    idolType: "boygroup",
    conceptId: "luxesport",
    tags: ["테크웨어 고글", "퍼포먼스 니트", "나일론 윈드브레이커", "유틸리티 벨트", "청키 스니커즈"],
    comment: "플레이브 럭스 스포츠 입어줬으면!",
  },
];
