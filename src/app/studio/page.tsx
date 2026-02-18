"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import CheeringBadge from "@/components/CheeringBadge";
import AdBanner from "@/components/ads/AdBanner";
import StylistFeedbackCard from "@/components/StylistFeedbackCard";
import type { StylistFeedback } from "@/lib/stylist-personas";

// Extract actionable style keywords from stylist advice and reformat as prompt text
function extractStyleDirections(advice: string): string {
  const found: string[] = [];

  // Material / texture terms
  const materials = [
    "홀로그래픽 오간자", "홀로그래픽 PVC", "리퀴드 메탈", "매트 카프스킨",
    "홀로그래픽", "크롬", "메탈릭", "새틴", "시어", "메쉬", "오간자",
    "벨벳", "데님", "실크", "레더", "카프스킨", "램스킨", "PVC", "트위드",
    "시퀸", "글리터", "네오프렌", "오가닉 코튼", "리넨", "나일론",
    "워싱 데님", "로우 데님", "합성 레더",
  ];

  // Silhouette / fit
  const fits = [
    "오버사이즈 핏", "크롭 상의", "와이드 하의", "슬림 핏", "A라인",
    "오버사이즈", "크롭", "와이드", "슬림", "타이트", "루즈",
    "스트레이트", "플레어", "스키니", "박시", "드롭숄더",
    "파워 숄더", "퍼프 슬리브",
  ];

  // Accessories
  const accessories = [
    "청키 체인 벨트", "체인 벨트", "빈티지 체인 벨트",
    "초커", "부츠", "하이힐", "이어링", "뱅글", "브로치", "벨트", "글러브",
  ];

  // Color terms
  const colors = [
    "핫핑크", "라임", "네온 그린", "네온", "파스텔", "올블랙",
    "모노크롬", "톤온톤", "새틴 레드",
  ];

  // Check longer phrases first (to avoid partial matches)
  const allTerms = [...materials, ...fits, ...accessories, ...colors];
  for (const term of allTerms) {
    if (advice.includes(term) && !found.some((f) => f.includes(term) || term.includes(f))) {
      found.push(term);
    }
  }

  // Extract measurement patterns (e.g., "3cm", "1.5cm")
  const measurements = advice.match(/\d+(?:\.\d+)?cm/g) || [];

  // Extract "X 기장" patterns
  const lengthMatch = advice.match(/([가-힣]+)\s*기장/g) || [];

  // Extract proportion patterns (e.g., "8대2 비율", "1.2배")
  const proportions = advice.match(/\d+(?:대\d+)?\s*비율|\d+(?:\.\d+)?배/g) || [];

  const extras = [...measurements, ...lengthMatch, ...proportions].filter(
    (e) => !found.some((f) => f.includes(e))
  );

  const all = [...found, ...extras].slice(0, 8);
  return all.join(", ");
}

const IDOL_TYPES = [
  { id: "girlgroup", label: "걸그룹", prompt: "K-POP girl group", icon: "👩‍🎤" },
  { id: "boygroup", label: "보이그룹", prompt: "K-POP boy group", icon: "🕺" },
  // { id: "solo", label: "솔로", prompt: "K-POP solo artist", icon: "🎤" },
];

const CONCEPT_STYLES: { id: string; label: string; color: string; prompt: string; icon: string; mood: string; girlOnly?: boolean; boyOnly?: boolean }[] = [
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

const POSE_STYLES = [
  { id: "standing", label: "스탠딩", icon: "🧍", prompt: "standing naturally facing the camera in a relaxed full-body pose with arms at sides" },
  { id: "runway", label: "런웨이", icon: "🚶", prompt: "walking confidently toward the camera on a runway, one foot forward, full-body front view" },
  { id: "hand-on-hip", label: "손 허리", icon: "💃", prompt: "standing with one hand on hip, confident front-facing full-body pose" },
  { id: "pocket", label: "포켓", icon: "🧥", prompt: "standing casually with one hand in pocket, relaxed front-facing full-body pose" },
  { id: "one-hand-up", label: "원핸드 업", icon: "🙋", prompt: "standing with one arm raised above head, showing sleeve and top silhouette, front-facing full-body" },
];

// Map onboarding style preset IDs → Korean labels for favorite tags
const FAVORITE_STYLE_MAP: Record<string, string> = {
  y2k: "Y2K",
  highteen: "하이틴",
  street: "스트릿",
  suit: "수트",
  cyber: "미래지향적",
  girlcrush: "걸크러쉬",
  sexy: "섹시",
  balletcore: "발레코어",
  darkromance: "다크 로맨스",
  neohanbok: "네오한복",
  luxesport: "럭스 스포츠",
};

const MAX_SELECTED_TAGS = 15;

const IMAGE_COUNT_OPTIONS = [1, 2, 4];
const STUDIO_LOADING_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_STUDIO_LOADING || "demo-studio-loading-slot";
const AD_DWELL_STORAGE_KEY = "studio_ad_dwell_count";
const STUDIO_ENTRY_INTRO_STORAGE_KEY = "studio_entry_intro_seen_v1";
const STUDIO_ENTRY_INTRO_MS = 3150;
const STUDIO_ENTRY_INTRO_EXIT_MS = 720;
const ONBOARDING_GENERATIONS = 3;
const BASE_MIN_AD_DWELL_MS = 7000;
const SHORT_MIN_AD_DWELL_MS = 2500;
const EXTRA_DWELL_EVERY_N = 3;
const EXTRA_DWELL_MS = 3000;

// 생성 중 로딩 메시지 + 아이콘
const GENERATION_LOADING_STEPS = [
  { msg: "실루엣과 스테이지 무드를 잡고 있어요...", icon: "checkroom" },
  { msg: "패브릭 텍스처, 컬러, 광택을 조합 중...", icon: "palette" },
  { msg: "퍼포먼스에 어울리는 디테일을 구성 중...", icon: "design_services" },
  { msg: "악세서리를 매치하고 컨셉을 다듬는 중...", icon: "diamond" },
  { msg: "마지막 터치: 더 대담하고 선명하게...", icon: "auto_awesome" },
];

function getAdDwellTargetMs(generationCount: number) {
  const base =
    generationCount <= ONBOARDING_GENERATIONS
      ? BASE_MIN_AD_DWELL_MS
      : SHORT_MIN_AD_DWELL_MS;
  const bonus = generationCount % EXTRA_DWELL_EVERY_N === 0 ? EXTRA_DWELL_MS : 0;
  return base + bonus;
}

export default function StudioPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [idolType, setIdolType] = useState("girlgroup");
  const [conceptStyle, setConceptStyle] = useState<string | null>(null);
  const [selectedPose, setSelectedPose] = useState<string | null>(null);
  const [imageCount, setImageCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; index: number }[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Tag-centric state (replaces prompt + selectedHashtags)
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeInputText, setFreeInputText] = useState("");
  const [conceptTags, setConceptTags] = useState<string[]>([]);
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [popularKeywords, setPopularKeywords] = useState<string[]>([]);
  const [favoriteTags, setFavoriteTags] = useState<string[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const tagCacheRef = useRef<Map<string, { conceptTags: string[]; recommendedTags: string[] }>>(new Map());

  // Preview section ref for auto-scroll
  const previewRef = useRef<HTMLDivElement>(null);

  // Fullscreen preview
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishTitle, setPublishTitle] = useState("");
  const [publishDesc, setPublishDesc] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Group Tag State
  const [groupTag, setGroupTag] = useState("");
  const [groupTagSuggestions, setGroupTagSuggestions] = useState<{ displayName: string; count: number }[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Stylist Feedback State
  const [stylistFeedbacks, setStylistFeedbacks] = useState<StylistFeedback[]>([]);
  const [selectedStylistId, setSelectedStylistId] = useState<string | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  // Advice Regeneration State
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [adviceModalPrompt, setAdviceModalPrompt] = useState("");
  const [adviceModalFeedback, setAdviceModalFeedback] = useState("");
  const [adviceModalStylist, setAdviceModalStylist] = useState("");
  const autoPublishRef = useRef(false);

  // Publish Success State
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [publishedDesignId, setPublishedDesignId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showEntryIntro, setShowEntryIntro] = useState(false);
  const [entryIntroPhase, setEntryIntroPhase] = useState<"enter" | "exit">("enter");
  const entryIntroExitTimerRef = useRef<number | null>(null);
  const entryIntroHideTimerRef = useRef<number | null>(null);

  const closeEntryIntro = (exitMs = STUDIO_ENTRY_INTRO_EXIT_MS) => {
    setEntryIntroPhase("exit");
    if (entryIntroHideTimerRef.current !== null) {
      window.clearTimeout(entryIntroHideTimerRef.current);
    }
    entryIntroHideTimerRef.current = window.setTimeout(() => {
      setShowEntryIntro(false);
    }, exitMs);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    let alreadySeen = false;
    try {
      alreadySeen = localStorage.getItem(STUDIO_ENTRY_INTRO_STORAGE_KEY) === "1";
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen) return;

    setShowEntryIntro(true);
    setEntryIntroPhase("enter");
    try {
      localStorage.setItem(STUDIO_ENTRY_INTRO_STORAGE_KEY, "1");
    } catch {
      // Ignore storage write failures and still show once per mount.
    }

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const introDuration = prefersReducedMotion ? 700 : STUDIO_ENTRY_INTRO_MS;
    const exitDuration = prefersReducedMotion ? 180 : STUDIO_ENTRY_INTRO_EXIT_MS;

    entryIntroExitTimerRef.current = window.setTimeout(() => {
      setEntryIntroPhase("exit");
      entryIntroHideTimerRef.current = window.setTimeout(() => {
        setShowEntryIntro(false);
      }, exitDuration);
    }, Math.max(0, introDuration - exitDuration));

    return () => {
      if (entryIntroExitTimerRef.current !== null) {
        window.clearTimeout(entryIntroExitTimerRef.current);
      }
      if (entryIntroHideTimerRef.current !== null) {
        window.clearTimeout(entryIntroHideTimerRef.current);
      }
    };
  }, []);

  // Fetch tag suggestions when typing group tag
  useEffect(() => {
    if (!groupTag.trim() || groupTag.trim().length < 1) {
      setGroupTagSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tags/search?q=${encodeURIComponent(groupTag.trim())}&limit=5`);
        const data = await res.json();
        setGroupTagSuggestions(data.tags || []);
      } catch {
        setGroupTagSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [groupTag]);

  // Fetch popular keywords on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tags/popular?type=keywords&limit=5&period=week");
        const data = await res.json();
        if (data.tags?.length) {
          setPopularKeywords(data.tags.map((t: { displayName: string }) => t.displayName));
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Load favorite tags from onboarding preferences
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mystyle_user_personalization_v1");
      if (!raw) return;
      const data = JSON.parse(raw);
      const styles: string[] = data.preferredStyles || [];
      const labels = styles
        .map((id: string) => FAVORITE_STYLE_MAP[id])
        .filter(Boolean) as string[];
      if (labels.length > 0) setFavoriteTags(labels);
    } catch {
      // ignore
    }
  }, []);

  // Fetch AI tags when concept changes
  useEffect(() => {
    if (!conceptStyle) {
      setConceptTags([]);
      setRecommendedTags([]);
      return;
    }

    const cacheKey = `${idolType}_${conceptStyle}`;
    const cached = tagCacheRef.current.get(cacheKey);
    if (cached) {
      setConceptTags(cached.conceptTags);
      setRecommendedTags(cached.recommendedTags);
      // Reset concept/recommended tag selections on concept change
      setSelectedTags((prev) => prev.filter((t) => popularKeywords.includes(t)));
      return;
    }

    setIsTagsLoading(true);
    // Reset concept/recommended tag selections on concept change
    setSelectedTags((prev) => prev.filter((t) => popularKeywords.includes(t)));

    (async () => {
      try {
        const res = await fetch("/api/tags/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idolType, conceptStyle }),
        });
        const data = await res.json();
        const ct = data.conceptTags || [];
        const rt = data.recommendedTags || [];
        setConceptTags(ct);
        setRecommendedTags(rt);
        tagCacheRef.current.set(cacheKey, { conceptTags: ct, recommendedTags: rt });
      } catch {
        // fallback handled by API
        setConceptTags([]);
        setRecommendedTags([]);
      } finally {
        setIsTagsLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idolType, conceptStyle]);

  // Reset gender-specific concepts when switching idol type
  useEffect(() => {
    const current = CONCEPT_STYLES.find((s) => s.id === conceptStyle);
    if (current?.girlOnly && idolType !== "girlgroup") setConceptStyle(null);
    if (current?.boyOnly && idolType !== "boygroup") setConceptStyle(null);
  }, [idolType, conceptStyle]);

  useEffect(() => {
    if (!isGenerating) {
      setLoadingMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) =>
        prev < GENERATION_LOADING_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      if (selectedTags.length >= MAX_SELECTED_TAGS) {
        setToastMessage(`태그는 최대 ${MAX_SELECTED_TAGS}개까지 선택 가능합니다`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const showToastMsg = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchStylistFeedback = async (firstImageUrl?: string) => {
    setIsFeedbackLoading(true);
    setStylistFeedbacks([]);
    setSelectedStylistId(null);

    const selectedIdol = IDOL_TYPES.find((t) => t.id === idolType);
    const selectedConcept = CONCEPT_STYLES.find((c) => c.id === conceptStyle);

    try {
      const res = await fetch("/api/stylist/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idolType: selectedIdol?.label || idolType,
          concept: selectedConcept?.label || conceptStyle || "general",
          keywords: selectedTags.join(", "),
          imageUrl: firstImageUrl || undefined,
        }),
      });
      const data = await res.json();
      if (data.feedbacks?.length) {
        setStylistFeedbacks(data.feedbacks);
        // Auto-select the first persona
        setSelectedStylistId(data.feedbacks[0].personaId);
      }
    } catch (err) {
      console.error("Stylist feedback error:", err);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const fullPrompt = [...selectedTags, freeInputText.trim()].filter(Boolean).join(", ");

  const handleGenerate = async (stylistAdvice?: string, overridePrompt?: string) => {
    const effectivePrompt = (overridePrompt || fullPrompt).trim();
    if (!effectivePrompt) return;
    const generateStartedAt = Date.now();
    const isAdviceRegen = autoPublishRef.current;

    setIsGenerating(true);
    setGeneratedImages([]);
    setSelectedImages([]);
    setShowToast(false);

    const selectedIdol = IDOL_TYPES.find((t) => t.id === idolType);
    const selectedConcept = CONCEPT_STYLES.find((c) => c.id === conceptStyle);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: effectivePrompt,
          idolType: selectedIdol?.prompt || "K-POP idol",
          conceptStyle: selectedConcept?.mood || "Charismatic, stylish, energetic",
          conceptPrompt: selectedConcept?.prompt || "",
          imageCount,
          ...(selectedPose ? { posePrompt: POSE_STYLES.find((p) => p.id === selectedPose)?.prompt } : {}),
          ...(stylistAdvice ? { stylistAdvice } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      const urls: string[] = data.urls || [];
      const images = urls.map((url, index) => ({ url, index }));
      setGeneratedImages(images);

      if (isAdviceRegen && images.length > 0) {
        // Advice regeneration: auto-select first image, skip feedback fetch
        setSelectedImages([images[0].url]);
      } else {
        // Normal flow
        if (images.length === 1) {
          setSelectedImages([images[0].url]);
        }

        if (images.length > 0) {
          setTimeout(() => {
            previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);

          // 1장이면 자동 피드백, 2장 이상이면 유저 선택 후 버튼으로
          if (images.length === 1) {
            fetchStylistFeedback(images[0].url);
          }
        }
      }
    } catch (error) {
      console.error("Generate error:", error);
      showToastMsg("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      let generationCount = 1;
      if (typeof window !== "undefined") {
        const prevRaw = sessionStorage.getItem(AD_DWELL_STORAGE_KEY) || "0";
        const prev = Number(prevRaw);
        generationCount = Number.isFinite(prev) && prev > 0 ? prev + 1 : 1;
        sessionStorage.setItem(AD_DWELL_STORAGE_KEY, String(generationCount));
      }

      const targetMs = getAdDwellTargetMs(generationCount);
      const elapsedMs = Date.now() - generateStartedAt;
      const remainMs = targetMs - elapsedMs;
      if (remainMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainMs));
      }
      setIsGenerating(false);

      // After advice-based regeneration, auto-open publish modal
      if (autoPublishRef.current) {
        autoPublishRef.current = false;
        setShowPublishModal(true);
      }
    }
  };

  const handleAdviceRegenerate = (feedback: string) => {
    const stylist = stylistFeedbacks.find((f) => f.feedback === feedback);
    const styleDirections = extractStyleDirections(feedback);
    const currentPrompt = fullPrompt;
    const enhanced = styleDirections
      ? `${currentPrompt}, ${styleDirections}`
      : currentPrompt;
    setAdviceModalPrompt(enhanced);
    setAdviceModalFeedback(feedback);
    setAdviceModalStylist(stylist?.fullName || "");
    setShowAdviceModal(true);
  };

  const handleConfirmAdviceGenerate = () => {
    const editedPrompt = adviceModalPrompt.trim();
    if (!editedPrompt) return;
    setShowAdviceModal(false);
    autoPublishRef.current = true;
    handleGenerate(undefined, editedPrompt);
  };

  const toggleImageSelection = (url: string) => {
    setSelectedImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handlePublish = async () => {
    if (selectedImages.length === 0) return;

    setIsPublishing(true);
    const selectedConcept = CONCEPT_STYLES.find((c) => c.id === conceptStyle);

    try {
      const token = user ? await user.getIdToken() : null;
      const res = await fetch("/api/designs/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          imageUrl: selectedImages[0],
          imageUrls: selectedImages,
          prompt: fullPrompt,
          concept: selectedConcept?.label || "general",
          keywords: selectedTags.join(","),
          groupTag: groupTag.trim() || null,
          ownerUid: user?.uid || "anonymous",
          ownerHandle: user?.displayName || "Guest Designer",
          stylistFeedbacks: stylistFeedbacks.length > 0 ? stylistFeedbacks : undefined,
          selectedStylistId: selectedStylistId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");

      setShowPublishModal(false);
      setPublishedDesignId(data.designId || null);
      setShowPublishSuccess(true);
    } catch (error) {
      console.error("Publish error:", error);
      showToastMsg("업로드 중 오류가 발생했습니다.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReset = () => {
    setGeneratedImages([]);
    setSelectedImages([]);
    setFullscreenImage(null);
    setShowPublishSuccess(false);
    setPublishedDesignId(null);
    setLinkCopied(false);
    setPublishTitle("");
    setPublishDesc("");
    setGroupTag("");
    setGroupTagSuggestions([]);
    setStylistFeedbacks([]);
    setSelectedStylistId(null);
    setSelectedTags([]);
    setSelectedPose(null);
    setFreeInputText("");
  };

  const handleCopyLink = () => {
    const url = publishedDesignId
      ? `${window.location.origin}/design/${publishedDesignId}`
      : window.location.origin;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShareNative = () => {
    const url = publishedDesignId
      ? `${window.location.origin}/design/${publishedDesignId}`
      : window.location.origin;
    if (navigator.share) {
      navigator.share({
        title: "내가 디자인한 K-POP 무대의상",
        text: "AI로 만든 K-POP 무대의상을 확인해보세요!",
        url,
      }).catch(() => { });
    } else {
      handleCopyLink();
    }
  };

  const visibleConcepts = CONCEPT_STYLES.filter(
    (s) => (!s.girlOnly || idolType === "girlgroup") && (!s.boyOnly || idolType === "boygroup")
  );

  // Publish success screen with share
  if (showPublishSuccess) {
    return (
      <div className="bg-white text-black antialiased min-h-screen pb-24 font-korean">
        <Header />
        <main className="max-w-md mx-auto pt-4 px-5">
          {/* Published images */}
          {selectedImages.length === 1 ? (
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-6">
              <Image
                src={selectedImages[0]}
                alt="Published design"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                unoptimized
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                공개 완료
              </div>
            </div>
          ) : selectedImages.length > 1 ? (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {selectedImages.map((url, i) => (
                <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                  <Image src={url} alt={`Published ${i + 1}`} fill className="object-cover" sizes="200px" unoptimized />
                  {i === 0 && (
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      공개 완료
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {/* Success message */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-black font-korean mb-2">스타일 픽에 공개되었어요!</h2>
            {groupTag && (
              <div className="flex justify-center my-4">
                <CheeringBadge
                  userName={user?.displayName || "Guest Designer"}
                  idolName={groupTag}
                  variant="modal"
                />
              </div>
            )}
            <p className="text-[13px] text-gray-500">친구에게 공유하고 투표를 받아보세요.</p>
          </div>


          {/* Share Section */}
          <div className="mb-10">
            <h3 className="text-[13px] font-bold text-gray-400 text-center mb-4 uppercase tracking-widest">친구에게 자랑하기</h3>

            <div className="grid grid-cols-3 gap-3">
              {/* X (Twitter) */}
              <button
                onClick={() => {
                  const url = publishedDesignId ? `${window.location.origin}/design/${publishedDesignId}` : window.location.origin;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("내가 만든 K-POP 무대의상, 어때요? 👀 #MyStyleAI")}&url=${encodeURIComponent(url)}`, "_blank");
                }}
                className="group relative flex flex-col items-center justify-center py-4 bg-black text-white rounded-2xl hover:bg-gray-900 transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <span className="text-[18px] font-bold">𝕏</span>
                </div>
                <span className="text-[11px] font-bold">트위터</span>
              </button>

              {/* KakaoTalk */}
              <button
                onClick={() => {
                  const url = publishedDesignId ? `${window.location.origin}/design/${publishedDesignId}` : window.location.origin;
                  window.open(`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(url)}`, "_blank");
                }}
                className="group relative flex flex-col items-center justify-center py-4 bg-[#fff3e0] text-black border border-[#ffe0b2] rounded-2xl hover:bg-[#ffe0b2]/50 transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-full bg-[#fae100] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                </div>
                <span className="text-[11px] font-bold">카카오톡</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="group relative flex flex-col items-center justify-center py-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 transition-all active:scale-[0.98]"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${linkCopied ? "bg-green-100 text-green-600" : "bg-white border border-gray-200 text-black"}`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {linkCopied ? "check" : "link"}
                  </span>
                </div>
                <span className={`text-[11px] font-bold ${linkCopied ? "text-green-600" : "text-gray-500"}`}>
                  {linkCopied ? "복사완료" : "링크복사"}
                </span>
              </button>
            </div>
          </div>


          {/* Navigation buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => publishedDesignId ? router.push(`/design/${publishedDesignId}`) : router.push("/gallery")}
              className="flex-1 py-3.5 border border-gray-200 text-[14px] font-bold rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">visibility</span>
              디자인 보기
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-3.5 bg-black text-white text-[14px] font-bold rounded-full hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              새로 만들기
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-white text-black antialiased pb-24 min-h-screen font-korean">
      <Header pageTitle="메이킹 룸" subtitle="AI로 무대 의상을 디자인하세요" />

      <main className="max-w-md mx-auto pt-2 px-5 space-y-6">
        {/* ────── Input Form (always visible) ────── */}
        <section className="space-y-8">
          {/* Step 1: Idol Type */}
          <div className="space-y-3">
            <label className="text-[13px] font-bold text-gray-500 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">1</span>
              아이돌 타입
            </label>
            <div className="grid grid-cols-3 gap-3">
              {IDOL_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setIdolType(type.id)}
                  className={`py-4 rounded-xl text-[13px] font-bold transition-all flex flex-col items-center gap-2 ${idolType === type.id
                    ? "bg-black text-white shadow-lg"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-black"
                    }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Concept Style */}
          <div className="space-y-3">
            <label className="text-[13px] font-bold text-gray-500 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">2</span>
              컨셉 스타일
            </label>
            <div className="grid grid-cols-3 gap-3">
              {visibleConcepts.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setConceptStyle(conceptStyle === style.id ? null : style.id)}
                  className={`relative overflow-hidden rounded-xl py-4 px-2 text-center transition-all ${conceptStyle === style.id
                    ? "ring-2 ring-black shadow-lg scale-[1.02]"
                    : "bg-white border border-gray-200 hover:border-black"
                    }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${style.color} ${conceptStyle === style.id ? "opacity-25" : "opacity-[0.07]"}`}></div>
                  <div className="relative flex flex-col items-center gap-1.5">
                    <span className="text-2xl">{style.icon}</span>
                    <p className="text-[12px] font-bold leading-tight">{style.label}</p>
                  </div>
                  {conceptStyle === style.id && (
                    <div className="absolute top-1.5 right-1.5">
                      <span className="material-symbols-outlined text-black text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Pose Selection */}
          <div className="space-y-3">
            <label className="text-[13px] font-bold text-gray-500 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">3</span>
              포즈 선택
              <span className="text-[11px] text-gray-300 font-medium">(선택사항)</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {POSE_STYLES.map((pose) => (
                <button
                  key={pose.id}
                  onClick={() => setSelectedPose(selectedPose === pose.id ? null : pose.id)}
                  className={`relative overflow-hidden rounded-xl py-3.5 px-2 text-center transition-all ${
                    selectedPose === pose.id
                      ? "ring-2 ring-black shadow-lg scale-[1.02] bg-gray-50"
                      : "bg-white border border-gray-200 hover:border-black"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xl">{pose.icon}</span>
                    <p className="text-[12px] font-bold leading-tight">{pose.label}</p>
                  </div>
                  {selectedPose === pose.id && (
                    <div className="absolute top-1.5 right-1.5">
                      <span className="material-symbols-outlined text-black text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {!selectedPose && (
              <p className="text-[11px] text-gray-300 text-center">선택하지 않으면 이미지마다 랜덤 포즈가 적용됩니다</p>
            )}
          </div>

          {/* Step 4: AI Style Tags */}
          <div className="space-y-4">
            <label className="text-[13px] font-bold text-gray-500 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">4</span>
              <span className="flex items-center gap-1">
                스타일 태그
                <span className="material-symbols-outlined text-[14px] text-gray-400">auto_awesome</span>
              </span>
              {selectedTags.length > 0 && (
                <span className="text-[11px] text-gray-400 font-medium ml-auto">
                  {selectedTags.length}/{MAX_SELECTED_TAGS}
                </span>
              )}
            </label>

            {!conceptStyle && (
              <p className="text-[12px] text-gray-400 py-4 text-center">
                컨셉을 선택하면 AI가 스타일 태그를 추천합니다
              </p>
            )}

            {/* AI Concept Tags */}
            {conceptStyle && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  AI추천 컨셉태그
                  {isTagsLoading && (
                    <span className="text-[11px] text-gray-400 font-medium ml-1 animate-pulse">AI가 추천태그를 찾고 있어요...</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {conceptTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-[12px] font-semibold rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-black text-white"
                          : "bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Tags */}
            {conceptStyle && recommendedTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">music_note</span>
                  AI추천 스타일 리프
                </p>
                <div className="flex flex-wrap gap-2">
                  {recommendedTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-[12px] font-semibold rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-black text-white"
                          : "bg-gray-50 border border-gray-200 text-gray-500 hover:border-black hover:text-black"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Refresh tag suggestions — appends new tags */}
            {conceptStyle && !isTagsLoading && (
              <button
                onClick={() => {
                  setIsTagsLoading(true);
                  (async () => {
                    try {
                      const res = await fetch("/api/tags/suggest", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ idolType, conceptStyle }),
                      });
                      const data = await res.json();
                      const newCt: string[] = data.conceptTags || [];
                      const newRt: string[] = data.recommendedTags || [];
                      // Append unique new tags (no duplicates)
                      setConceptTags((prev) => [...prev, ...newCt.filter((t) => !prev.includes(t))]);
                      setRecommendedTags((prev) => [...prev, ...newRt.filter((t) => !prev.includes(t))]);
                    } catch {
                      // silent
                    } finally {
                      setIsTagsLoading(false);
                    }
                  })();
                }}
                className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl text-[13px] font-bold text-gray-500 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                태그 추천 더받기
              </button>
            )}

            {/* Popular Keywords */}
            {popularKeywords.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  인기 태그
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularKeywords.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-[12px] font-semibold rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-black text-white"
                          : "bg-orange-50 border border-orange-200 text-orange-600 hover:border-orange-400"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* My Favorite Tags (from onboarding) */}
            {favoriteTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  내 페이버릿 태그
                </p>
                <div className="flex flex-wrap gap-2">
                  {favoriteTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-[12px] font-semibold rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-black text-white"
                          : "bg-purple-50 border border-purple-200 text-purple-600 hover:border-purple-400"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Free Input (always visible) */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">edit_note</span>
                자유 입력
              </p>
              <div className="relative">
                <textarea
                  value={freeInputText}
                  onChange={(e) => setFreeInputText(e.target.value)}
                  placeholder="태그 외에 추가하고 싶은 스타일을 자유롭게 적어주세요"
                  maxLength={300}
                  rows={2}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                />
                <span className="absolute bottom-3 right-3 text-[10px] text-gray-300 font-medium">
                  {freeInputText.length}/300
                </span>
              </div>
            </div>
          </div>

          {/* Step 5: Image Count */}
          <div className="space-y-3">
            <label className="text-[13px] font-bold text-gray-500 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">5</span>
              이미지 개수
            </label>
            <div className="flex gap-3">
              {IMAGE_COUNT_OPTIONS.map((count) => (
                <button
                  key={count}
                  onClick={() => setImageCount(count)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${imageCount === count
                    ? "bg-black text-white shadow-lg"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-black"
                    }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {count === 1 ? "image" : count === 2 ? "photo_library" : "grid_view"}
                  </span>
                  {count}장
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || (selectedTags.length === 0 && !freeInputText.trim())}
            className="w-full py-4 bg-black text-white text-[15px] font-bold rounded-full hover:bg-gray-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                생성 중...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
                {generatedImages.length > 0 ? `${imageCount}장 다시 생성하기` : `${imageCount}장 디자인 생성하기`}
              </>
            )}
          </button>
        </section>

        {/* ────── Preview Section (appears below form after generation) ────── */}
        {generatedImages.length > 0 && (
          <section ref={previewRef} className="space-y-5 pt-2">
            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-[12px] font-bold text-gray-400">프리뷰</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Selection hint */}
            {generatedImages.length > 1 && (
              <p className="text-center text-[12px] text-gray-400">
                공개할 이미지를 선택하세요 ({selectedImages.length}/{generatedImages.length})
              </p>
            )}

            {/* Image grid — tap to fullscreen, checkbox to select */}
            <div className={`grid gap-3 ${generatedImages.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {generatedImages.map((img) => (
                <div key={img.index} className="relative">
                  {/* Image — tap opens fullscreen */}
                  <button
                    onClick={() => setFullscreenImage(img.url)}
                    className={`relative w-full ${generatedImages.length === 1 ? "aspect-[3/4]" : "aspect-[3/4]"} rounded-xl overflow-hidden bg-gray-100 border-2 transition-all ${selectedImages.includes(img.url)
                      ? "border-black ring-2 ring-black/10"
                      : "border-gray-200"
                      }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Option ${img.index + 1}`}
                      fill
                      className="object-cover"
                      sizes={generatedImages.length === 1 ? "(max-width: 768px) 100vw, 400px" : "(max-width: 768px) 50vw, 200px"}
                      unoptimized
                    />
                  </button>
                  {/* Selection checkbox — top right */}
                  {generatedImages.length > 1 && (
                    <button
                      onClick={() => toggleImageSelection(img.url)}
                      className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all ${selectedImages.includes(img.url)
                        ? "bg-black text-white"
                        : "bg-white/80 backdrop-blur-sm border border-gray-300 text-transparent"
                        }`}
                      aria-label={selectedImages.includes(img.url) ? "선택 해제" : "선택"}
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Stylist Feedback */}
            {isFeedbackLoading && (
              <div className="flex items-center gap-3 px-4 py-4 bg-gray-50 rounded-2xl">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                <p className="text-[12px] text-gray-400 font-medium">엔터사 출신 AI스타일리스트가 분석 중...</p>
              </div>
            )}

            {/* Multi-image: show feedback request button if no feedback yet */}
            {generatedImages.length > 1 && stylistFeedbacks.length === 0 && !isFeedbackLoading && (
              <button
                onClick={() => {
                  const targetUrl = selectedImages[0] || generatedImages[0]?.url;
                  fetchStylistFeedback(targetUrl);
                }}
                disabled={selectedImages.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-[13px] font-bold rounded-xl hover:from-black hover:to-gray-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>rate_review</span>
                {selectedImages.length === 0
                  ? "이미지를 선택하면 스타일리스트 평가를 받을 수 있어요"
                  : "선택한 이미지로 스타일리스트 평가 받기"}
              </button>
            )}

            {stylistFeedbacks.length > 0 && !isFeedbackLoading && (
              <StylistFeedbackCard
                feedbacks={stylistFeedbacks}
                mode="select"
                selectedPersonaId={selectedStylistId || undefined}
                onSelect={(id) => setSelectedStylistId(id)}
                onRegenerate={handleAdviceRegenerate}
              />
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3.5 border border-gray-200 text-sm font-bold rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
                결과 지우기
              </button>
              <button
                onClick={() => {
                  if (selectedImages.length === 0) {
                    showToastMsg("공개할 이미지를 선택해주세요");
                    return;
                  }
                  setShowPublishModal(true);
                }}
                className="flex-1 py-3.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">publish</span>
                {selectedImages.length > 1 ? `${selectedImages.length}장 공개` : "스타일 픽에 공개"}
              </button>
            </div>
          </section>
        )}

        {/* Loading overlay */}
        {isGenerating && (
          <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center px-8">
            {/* Animated fashion loader */}
            <div className="relative w-24 h-24 mb-6">
              {/* Outer pulsing gradient ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-200 via-pink-200 to-amber-200 animate-pulse opacity-60" />
              {/* Middle dashed ring — slow spin */}
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-gray-200 animate-[spin_8s_linear_infinite]" />
              {/* Center icon area */}
              <div className="absolute inset-4 rounded-full bg-white shadow-sm flex items-center justify-center">
                <span
                  key={loadingMessageIndex}
                  className="material-symbols-outlined text-[28px] text-gray-800 animate-[fadeInUp_0.4s_ease-out]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {GENERATION_LOADING_STEPS[loadingMessageIndex].icon}
                </span>
              </div>
            </div>

            <p className="text-[15px] font-bold text-black text-center mb-1.5">패션 전문 AI가 디자인하는 중...</p>
            <p
              key={loadingMessageIndex}
              className="text-[13px] text-gray-400 text-center animate-[fadeInUp_0.4s_ease-out]"
            >
              {GENERATION_LOADING_STEPS[loadingMessageIndex].msg}
            </p>

            {/* Progress dots */}
            <div className="flex gap-2.5 mt-5">
              {GENERATION_LOADING_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-700 ${
                    i <= loadingMessageIndex
                      ? "w-6 bg-black"
                      : "w-1.5 bg-gray-200"
                  }`}
                />
              ))}
            </div>

            <div className="w-full max-w-[320px] mt-8">
              <p className="text-[10px] text-gray-300 font-bold text-center uppercase tracking-widest mb-2">Advertisement</p>
              <AdBanner slot={STUDIO_LOADING_AD_SLOT} className="rounded-xl border border-gray-100 p-2" />
            </div>
          </div>
        )}

        {/* Entry intro overlay (first visit only) */}
        {showEntryIntro && (
          <div
            className={`studio-intro-overlay fixed inset-0 z-[80] overflow-hidden backdrop-blur-[2px] text-white flex items-center justify-center px-7 ${entryIntroPhase === "exit" ? "studio-intro-overlay-exit" : ""}`}
            role="dialog"
            aria-label="Studio entry intro"
            onClick={() => closeEntryIntro(220)}
          >
            <div className="studio-intro-glow absolute -top-14 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
            <div className="studio-intro-shine absolute left-1/2 top-1/2 h-[62vh] w-[62vh] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
            <div className="relative text-center">
              <p className="studio-intro-title text-[26px] leading-tight font-black font-korean tracking-tight">
                심장이 반짝이는 순간,
                <br />
                오늘의 무대가 피어납니다
              </p>
              <p className="studio-intro-sub mt-4 text-[12px] text-white/70 font-semibold tracking-wide">
                가볍게 터치하면 바로 시작돼요
              </p>
            </div>
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="studio-intro-star absolute block h-1.5 w-1.5 rounded-full bg-white/90"
                style={{
                  left: `${8 + ((i * 7) % 84)}%`,
                  top: `${10 + ((i * 13) % 76)}%`,
                  animationDelay: `${(i % 6) * 0.17}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-full text-[13px] font-bold shadow-xl">
            {toastMessage || (generatedImages.length > 0 && selectedImages.length === 0
              ? "공개할 이미지를 선택해주세요"
              : "오류가 발생했습니다. 다시 시도해주세요.")}
          </div>
        )}
      </main>

      {/* ────── Fullscreen Image Popup ────── */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            className="absolute top-5 right-5 z-10 bg-white/10 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/20 transition-colors"
            onClick={() => setFullscreenImage(null)}
            aria-label="닫기"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
          <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden">
            <Image
              src={fullscreenImage}
              alt="Preview"
              fill
              className="object-contain"
              sizes="100vw"
              priority
              unoptimized
            />
          </div>
          {/* Select / deselect from fullscreen */}
          {generatedImages.length > 1 && fullscreenImage && (
            <button
              className={`absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-[13px] font-bold transition-all ${selectedImages.includes(fullscreenImage)
                ? "bg-white text-black"
                : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleImageSelection(fullscreenImage);
              }}
            >
              {selectedImages.includes(fullscreenImage) ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  선택됨
                </span>
              ) : (
                "공개 목록에 추가"
              )}
            </button>
          )}
        </div>
      )}

      {/* ────── Advice Prompt Edit Modal ────── */}
      {showAdviceModal && (
        <div className="fixed inset-0 z-[65] bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowAdviceModal(false)}>
          <div
            className="bg-white w-full max-w-md rounded-t-3xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 pt-3 pb-2 px-6">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black font-korean">조언 반영하기</h3>
                <button onClick={() => setShowAdviceModal(false)} className="p-1" aria-label="닫기">
                  <span className="material-symbols-outlined text-[24px] text-gray-400">close</span>
                </button>
              </div>
            </div>

            <div className="px-6 pt-2 pb-4 space-y-3 overflow-y-auto flex-1 min-h-0">
              <p className="text-[12px] text-gray-500 font-korean leading-relaxed">
                스타일리스트 추천 키워드가 반영된 프롬프트예요. 자유롭게 수정해보세요.
              </p>
              <div className="relative">
                <textarea
                  value={adviceModalPrompt}
                  onChange={(e) => setAdviceModalPrompt(e.target.value)}
                  rows={5}
                  maxLength={800}
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black resize-none font-korean leading-relaxed"
                  placeholder="프롬프트를 입력하세요"
                />
                <span className="absolute bottom-3 right-3 text-[10px] text-gray-300 font-medium">
                  {adviceModalPrompt.length}/800
                </span>
              </div>

              {/* Collapsible original advice for reference */}
              {adviceModalFeedback && (
                <details className="group">
                  <summary className="text-[11px] text-gray-400 cursor-pointer flex items-center gap-1 select-none">
                    <span className="material-symbols-outlined text-[14px] transition-transform group-open:rotate-90">chevron_right</span>
                    {adviceModalStylist} 원본 조언 보기
                  </summary>
                  <p className="mt-2 px-3 py-2.5 bg-gray-50 rounded-lg text-[12px] text-gray-500 leading-relaxed font-korean">
                    {adviceModalFeedback}
                  </p>
                </details>
              )}
            </div>

            <div className="shrink-0 px-6 pt-3 pb-6 border-t border-gray-100 bg-white">
              <button
                onClick={handleConfirmAdviceGenerate}
                disabled={!adviceModalPrompt.trim()}
                className="w-full py-4 bg-black text-white text-[15px] font-bold rounded-full hover:bg-gray-900 transition-all disabled:opacity-40 flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                조언 반영하여 디자인하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────── Publish Modal ────── */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowPublishModal(false)}>
          <div
            className="bg-white w-full max-w-md rounded-t-3xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle + header */}
            <div className="shrink-0 pt-3 pb-2 px-6">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black font-korean">스타일 픽에 공개하기</h3>
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="p-1"
                  aria-label="닫기"
                >
                  <span className="material-symbols-outlined text-[24px] text-gray-400">close</span>
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="px-6 pt-2 pb-4 space-y-5 overflow-y-auto overscroll-contain flex-1 min-h-0">
              {/* Image preview */}
              {selectedImages.length === 1 ? (
                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                  <Image src={selectedImages[0]} alt="Publish preview" fill className="object-cover" sizes="400px" unoptimized />
                </div>
              ) : selectedImages.length > 1 ? (
                <div className="grid grid-cols-2 gap-2">
                  {selectedImages.map((url, i) => (
                    <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                      <Image src={url} alt={`Preview ${i + 1}`} fill className="object-cover" sizes="200px" unoptimized />
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Concept & hashtags summary */}
              <div className="flex flex-wrap gap-2">
                {conceptStyle && (
                  <span className="px-3 py-1 bg-gray-100 text-[12px] font-bold text-black rounded-full">
                    {CONCEPT_STYLES.find((s) => s.id === conceptStyle)?.label}
                  </span>
                )}
                {selectedTags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-[12px] font-bold text-black rounded-full">
                    #{tag.replace(/\s+/g, "")}
                  </span>
                ))}
              </div>

              {/* Group Tag Input with autocomplete */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">favorite</span>
                  어떤 그룹을 위한 디자인인가요?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={groupTag}
                    onChange={(e) => {
                      setGroupTag(e.target.value);
                      setShowTagSuggestions(true);
                    }}
                    onFocus={() => setShowTagSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                    placeholder="예: NewJeans, aespa, BTS"
                    maxLength={30}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
                  />
                  {groupTag.trim() && (
                    <button
                      onClick={() => { setGroupTag(""); setGroupTagSuggestions([]); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                      aria-label="태그 지우기"
                    >
                      <span className="material-symbols-outlined text-[18px] text-gray-400">close</span>
                    </button>
                  )}
                  {/* Autocomplete dropdown */}
                  {showTagSuggestions && groupTagSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                      {groupTagSuggestions.map((tag) => (
                        <button
                          key={tag.displayName}
                          onMouseDown={() => {
                            setGroupTag(tag.displayName);
                            setShowTagSuggestions(false);
                          }}
                          className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-semibold text-black">#{tag.displayName}</span>
                          <span className="text-[11px] text-gray-400">{tag.count}개 디자인</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {groupTag.trim() && (
                  <p className="text-[11px] text-gray-400">
                    @{user?.displayName || "Guest Designer"}님이 <span className="font-bold text-black">{groupTag.trim()}</span>를 응원합니다
                  </p>
                )}
              </div>

              <input
                type="text"
                value={publishTitle}
                onChange={(e) => setPublishTitle(e.target.value)}
                placeholder="디자인 제목 (선택사항)"
                maxLength={50}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              />

              <textarea
                value={publishDesc}
                onChange={(e) => setPublishDesc(e.target.value)}
                placeholder="간단한 설명을 추가해보세요 (선택사항)"
                maxLength={200}
                rows={2}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>

            {/* Fixed bottom button */}
            <div className="shrink-0 px-6 pt-3 pb-6 border-t border-gray-100 bg-white">
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full py-4 bg-black text-white text-[15px] font-bold rounded-full hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    업로드 중...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">publish</span>
                    스타일 픽에 공개하기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

