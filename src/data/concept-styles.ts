// Shared idol type & concept style definitions
// Used by both Studio and Simulation to prevent data drift

export interface IdolType {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

export interface ConceptStyle {
  id: string;
  label: string;
  color: string;
  prompt: string;
  icon: string;
  mood: string;
  girlOnly?: boolean;
  boyOnly?: boolean;
}

export const IDOL_TYPES: IdolType[] = [
  { id: "girlgroup", label: "걸그룹", prompt: "K-POP girl group", icon: "👩‍🎤" },
  { id: "boygroup", label: "보이그룹", prompt: "K-POP boy group", icon: "🕺" },
];

export const CONCEPT_STYLES: ConceptStyle[] = [
  { id: "cyber", label: "미래지향적", color: "from-violet-600 via-purple-700 to-blue-900", prompt: "cyberpunk futuristic", icon: "🌌", mood: "Futuristic, electric" },
  { id: "y2k", label: "Y2K", color: "from-pink-400 via-fuchsia-300 to-yellow-300", prompt: "Y2K retro", icon: "✨", mood: "Playful, nostalgic" },
  { id: "highteen", label: "하이틴", color: "from-sky-400 via-cyan-300 to-pink-200", prompt: "high teen preppy", icon: "🎀", mood: "Youthful, bright" },
  { id: "sexy", label: "섹시", color: "from-rose-600 via-red-500 to-pink-400", prompt: "sexy glamorous", icon: "💋", mood: "Sultry, confident" },
  { id: "suit", label: "수트", color: "from-slate-700 via-gray-600 to-slate-800", prompt: "tailored suit formal", icon: "🤵", mood: "Sharp, powerful" },
  { id: "street", label: "스트릿", color: "from-gray-600 via-gray-800 to-gray-950", prompt: "streetwear urban", icon: "🧢", mood: "Urban, cool" },
  { id: "girlcrush", label: "걸크러쉬", color: "from-red-800 via-rose-900 to-gray-900", prompt: "girl crush edgy", icon: "🔥", mood: "Powerful, fierce", girlOnly: true },
  { id: "balletcore", label: "발레코어", color: "from-pink-200 via-rose-100 to-amber-100", prompt: "balletcore tulle skirt satin corset ribbon lace-up pointe shoe inspired", icon: "🩰", mood: "Elegant, classical, delicate strength", girlOnly: true },
  { id: "darkromance", label: "다크 로맨스", color: "from-gray-900 via-rose-950 to-purple-950", prompt: "dark romance gothic lace velvet corset Victorian cape dramatic", icon: "🖤", mood: "Gothic romantic, dramatic, decadent beauty" },
  { id: "neohanbok", label: "네오한복", color: "from-red-800 via-amber-700 to-yellow-600", prompt: "modernized hanbok jeogori structured jacket goryeo embroidery flowing hanji-textured fabric", icon: "🏮", mood: "Traditional Korean reinvented, cultural pride, avant-garde" },
  { id: "luxesport", label: "럭스 스포츠", color: "from-blue-900 via-slate-800 to-gray-700", prompt: "luxury athletic wear tailored track jacket technical fabric silk panels premium sportswear couture", icon: "⚡", mood: "Luxury meets athletic energy, couture performance", boyOnly: true },
];
