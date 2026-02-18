// =============================================================================
// K-POP Group Name Aliases
// Canonical mapping for Korean/English/abbreviation variants
// ~40 major groups with common input variations
// =============================================================================

interface GroupEntry {
  canonical: string;   // lowercase key for dedup/search
  displayName: string; // official display form
  aliases: string[];   // all known input variants (lowercase)
}

const GROUP_DB: GroupEntry[] = [
  // -- Girl Groups --
  { canonical: "newjeans", displayName: "NewJeans", aliases: ["newjeans", "뉴진스", "nj"] },
  { canonical: "aespa", displayName: "aespa", aliases: ["aespa", "에스파"] },
  { canonical: "ive", displayName: "IVE", aliases: ["ive", "아이브"] },
  { canonical: "lesserafim", displayName: "LE SSERAFIM", aliases: ["lesserafim", "le sserafim", "르세라핌"] },
  { canonical: "gidle", displayName: "(G)I-DLE", aliases: ["gidle", "(g)i-dle", "g idle", "아이들", "여자아이들"] },
  { canonical: "itzy", displayName: "ITZY", aliases: ["itzy", "있지"] },
  { canonical: "stayc", displayName: "STAYC", aliases: ["stayc", "스테이씨"] },
  { canonical: "nmixx", displayName: "NMIXX", aliases: ["nmixx", "엔믹스"] },
  { canonical: "illit", displayName: "ILLIT", aliases: ["illit", "아일릿"] },
  { canonical: "babymonster", displayName: "BABYMONSTER", aliases: ["babymonster", "baby monster", "베이비몬스터"] },
  { canonical: "blackpink", displayName: "BLACKPINK", aliases: ["blackpink", "black pink", "블랙핑크", "블핑"] },
  { canonical: "twice", displayName: "TWICE", aliases: ["twice", "트와이스"] },
  { canonical: "redvelvet", displayName: "Red Velvet", aliases: ["redvelvet", "red velvet", "레드벨벳", "레벨"] },
  { canonical: "ohmygirl", displayName: "OH MY GIRL", aliases: ["ohmygirl", "oh my girl", "오마이걸"] },
  { canonical: "mamamoo", displayName: "MAMAMOO", aliases: ["mamamoo", "마마무"] },
  { canonical: "dreamcatcher", displayName: "Dreamcatcher", aliases: ["dreamcatcher", "드림캐쳐"] },
  { canonical: "fromis9", displayName: "fromis_9", aliases: ["fromis9", "fromis_9", "프로미스나인"] },
  { canonical: "izone", displayName: "IZ*ONE", aliases: ["izone", "iz*one", "아이즈원"] },
  { canonical: "kissoflife", displayName: "KISS OF LIFE", aliases: ["kissoflife", "kiss of life", "키스오브라이프"] },

  // -- Boy Groups --
  { canonical: "bts", displayName: "BTS", aliases: ["bts", "방탄소년단", "방탄"] },
  { canonical: "seventeen", displayName: "SEVENTEEN", aliases: ["seventeen", "세븐틴", "svt"] },
  { canonical: "straykids", displayName: "Stray Kids", aliases: ["straykids", "stray kids", "스트레이키즈", "스키즈"] },
  { canonical: "txt", displayName: "TXT", aliases: ["txt", "투모로우바이투게더", "투바투"] },
  { canonical: "enhypen", displayName: "ENHYPEN", aliases: ["enhypen", "엔하이픈"] },
  { canonical: "nct", displayName: "NCT", aliases: ["nct", "엔씨티"] },
  { canonical: "nctdream", displayName: "NCT DREAM", aliases: ["nctdream", "nct dream", "엔시티드림"] },
  { canonical: "nct127", displayName: "NCT 127", aliases: ["nct127", "nct 127", "엔시티127"] },
  { canonical: "wayv", displayName: "WayV", aliases: ["wayv", "웨이비"] },
  { canonical: "ateez", displayName: "ATEEZ", aliases: ["ateez", "에이티즈"] },
  { canonical: "theboyz", displayName: "THE BOYZ", aliases: ["theboyz", "the boyz", "더보이즈"] },
  { canonical: "riize", displayName: "RIIZE", aliases: ["riize", "라이즈"] },
  { canonical: "zerobaseone", displayName: "ZEROBASEONE", aliases: ["zerobaseone", "zero base one", "제로베이스원", "zb1"] },
  { canonical: "boynextdoor", displayName: "BOYNEXTDOOR", aliases: ["boynextdoor", "boy next door", "보이넥스트도어"] },
  { canonical: "exo", displayName: "EXO", aliases: ["exo", "엑소"] },
  { canonical: "got7", displayName: "GOT7", aliases: ["got7", "갓세븐"] },
  { canonical: "bigbang", displayName: "BIGBANG", aliases: ["bigbang", "big bang", "빅뱅"] },
  { canonical: "shinee", displayName: "SHINee", aliases: ["shinee", "샤이니"] },
  { canonical: "monsta x", displayName: "MONSTA X", aliases: ["monstax", "monsta x", "몬스타엑스"] },
  { canonical: "treasure", displayName: "TREASURE", aliases: ["treasure", "트레저"] },

  // -- Solo --
  { canonical: "iu", displayName: "IU", aliases: ["iu", "아이유"] },
  { canonical: "jungkook", displayName: "Jung Kook", aliases: ["jungkook", "jung kook", "정국"] },
  { canonical: "jennie", displayName: "JENNIE", aliases: ["jennie", "제니"] },
  { canonical: "lisa", displayName: "LISA", aliases: ["lisa", "리사"] },
  { canonical: "rose", displayName: "ROSE", aliases: ["rose", "rosé", "로제"] },
];

// Build a lookup map: alias → GroupEntry
const ALIAS_MAP = new Map<string, GroupEntry>();
for (const entry of GROUP_DB) {
  for (const alias of entry.aliases) {
    ALIAS_MAP.set(alias, entry);
  }
}

/**
 * Resolve a user-typed group name to its canonical form.
 * Returns { canonical, displayName } if matched, or a normalized fallback.
 */
export function resolveGroupName(input: string): { canonical: string; displayName: string } {
  const trimmed = input.trim().replace(/^#/, "");
  if (!trimmed) return { canonical: "", displayName: "" };

  const lower = trimmed.toLowerCase().replace(/\s+/g, "");
  const lowerWithSpaces = trimmed.toLowerCase();

  // Try exact alias match (no spaces)
  const match = ALIAS_MAP.get(lower) || ALIAS_MAP.get(lowerWithSpaces);
  if (match) {
    return { canonical: match.canonical, displayName: match.displayName };
  }

  // No match: use input as-is for display, lowercase+stripped for canonical
  return { canonical: lower, displayName: trimmed };
}
