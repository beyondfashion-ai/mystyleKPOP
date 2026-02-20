
export interface Archetype {
    id: string;
    label: string;
    description: string;
    keywords: string[]; // for generative prompt
    visual: string; // emoji or placeholder for now, ideally image path
    color: string;
    tags: string[];
}

export const ARCHETYPES: Archetype[] = [
    {
        id: "y2k-highteen",
        label: "LUCE",
        description: "청량한 레트로 감성과 스포티한 에너지",
        keywords: ["Y2K", "High-Teen", "Retro", "School look", "Sporty", "Fresh", "Blue", "White"],
        visual: "🐰",
        color: "from-blue-400 to-white",
        tags: ["Fresh Retro", "Sporty Chic", "School Vibe"]
    },
    {
        id: "cyber-warrior",
        label: "XENON",
        description: "광야를 누비는 메탈릭 퓨처리스틱 전사",
        keywords: ["Cyberpunk", "Metallic", "Snake", "Neon", "Future", "AI", "Virtual", "Warrior"],
        visual: "🐍",
        color: "from-purple-600 to-indigo-900",
        tags: ["Cyber Future", "Metallic Edge", "Virtual World"]
    },
    {
        id: "royal-narcissist",
        label: "REINE",
        description: "자기애 넘치는 우아하고 럭셔리한 하이틴",
        keywords: ["Luxury", "Elegant", "Princess", "Chaebol", "High-end", "Narcissism", "Tiaras", "Pearls"],
        visual: "💎",
        color: "from-rose-400 to-red-600",
        tags: ["Royal Luxury", "Elegant Chic", "High-end"]
    },
    {
        id: "pink-venom",
        label: "VIXEN",
        description: "세련되고 강렬한 걸크러쉬 힙합",
        keywords: ["Girl Crush", "Powerful", "Luxury Street", "Hip-hop", "Black", "Pink", "Bold"],
        visual: "👑",
        color: "from-pink-500 to-black",
        tags: ["Girl Crush", "Power Hip-hop", "Bold Street"]
    },
    {
        id: "global-king",
        label: "ZENITH",
        description: "전 세계를 무대로 하는 슈퍼스타의 품격",
        keywords: ["Suit", "Formal", "Sophisticated", "Global", "Pop Star", "Purple", "Microphone"],
        visual: "💜",
        color: "from-purple-500 to-violet-700",
        tags: ["Global Pop", "Formal Chic", "Superstar"]
    },
    {
        id: "energy-perf",
        label: "VOLT",
        description: "청량하고 파워풀한 칼군무 퍼포먼스",
        keywords: ["Fresh", "Energy", "Sporty", "Synchronized", "Diamond", "Uniform"],
        visual: "⚡",
        color: "from-sky-300 to-blue-500",
        tags: ["Synchronized", "Energy Bomb", "Performance"]
    },
    {
        id: "mala-flavor",
        label: "HAVOC",
        description: "강렬하고 거친 마라맛 컨스트럭션",
        keywords: ["Construction", "Rough", "Chains", "Wolf", "Intense", "Dark", "Street"],
        visual: "🌶️",
        color: "from-red-700 to-black",
        tags: ["Intense Raw", "Dark Street", "Chaos"]
    },
    {
        id: "neo-tech",
        label: "GLITCH",
        description: "무한히 확장되는 네오 테크웨어",
        keywords: ["Neo", "Techwear", "Glitch", "Neon Green", "Future", "Limitless"],
        visual: "💚",
        color: "from-green-400 to-emerald-600",
        tags: ["Neo Tech", "Neon Future", "Limitless"]
    }
];

export const STYLE_KEYWORDS = [
    { id: "dreamy", label: "몽환적인", emoji: "☁️" },
    { id: "powerful", label: "파워풀한", emoji: "💪" },
    { id: "kitsch", label: "키치한", emoji: "🎀" },
    { id: "dark", label: "다크한", emoji: "🖤" },
    { id: "refreshing", label: "청량한", emoji: "🍋" },
    { id: "elegant", label: "우아한", emoji: "🦢" },
    { id: "hip", label: "힙한", emoji: "😎" },
    { id: "minimal", label: "미니멀한", emoji: "🤍" },
    { id: "sporty", label: "스포티한", emoji: "⚡" },
    { id: "vintage", label: "빈티지한", emoji: "📼" },
    { id: "romantic", label: "로맨틱한", emoji: "💕" },
    { id: "grunge", label: "그런지한", emoji: "⛓️" },
    { id: "luxurious", label: "럭셔리한", emoji: "👜" },
    { id: "futuristic", label: "퓨처리스틱한", emoji: "🚀" },
    { id: "preppy", label: "프레피한", emoji: "🎓" },
    { id: "wild", label: "와일드한", emoji: "🐆" },
];

export const COLOR_PALETTES = [
    { id: "black-white", label: "Black & White", colors: ["#000000", "#FFFFFF"] },
    { id: "pastel", label: "Pastel Dream", colors: ["#FFB7B2", "#B5EAD7"] },
    { id: "neon", label: "Neon Cyber", colors: ["#CCFF00", "#00FFCC"] },
    { id: "royal", label: "Royal Gold", colors: ["#1A1A1A", "#FFD700"] },
    { id: "nature", label: "Earth & Forest", colors: ["#8B4513", "#228B22"] },
    { id: "marine", label: "Deep Marine", colors: ["#000080", "#E0FFFF"] },
    { id: "cherry", label: "Cherry Blossom", colors: ["#FF69B4", "#FFC0CB"] },
    { id: "lavender", label: "Lavender Haze", colors: ["#9370DB", "#E6E6FA"] },
    { id: "sunset", label: "Sunset Glow", colors: ["#FF6B35", "#FFB347"] },
    { id: "ice", label: "Ice Crystal", colors: ["#A5F3FC", "#E0F2FE"] },
    { id: "military", label: "Military Khaki", colors: ["#556B2F", "#8B8682"] },
    { id: "coral", label: "Coral Reef", colors: ["#FF7F50", "#FFE4E1"] },
];
