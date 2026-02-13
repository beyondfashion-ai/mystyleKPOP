"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

const IDOL_TYPES = [
  { id: "girlgroup", label: "걸그룹", prompt: "K-POP girl group", icon: "👩‍🎤" },
  { id: "boygroup", label: "보이그룹", prompt: "K-POP boy group", icon: "🧑‍🎤" },
  { id: "solo", label: "솔로", prompt: "K-POP solo artist", icon: "🎤" },
];

const CONCEPT_STYLES = [
  { id: "cyber", label: "사이버펑크", color: "from-violet-600 via-purple-700 to-blue-900", prompt: "cyberpunk, futuristic, metallic textures, tech-wear", icon: "🔮", mood: "Futuristic, electric, digital" },
  { id: "y2k", label: "Y2K", color: "from-pink-400 via-fuchsia-300 to-yellow-300", prompt: "Y2K retro, glossy, playful accessories, chunky jewelry", icon: "✨", mood: "Playful, nostalgic, cute" },
  { id: "highteen", label: "하이틴", color: "from-sky-400 via-cyan-300 to-pink-200", prompt: "high teen, youthful, school-inspired, preppy style", icon: "🎀", mood: "Youthful, bright, fresh" },
  { id: "sexy", label: "섹시", color: "from-rose-600 via-red-500 to-pink-400", prompt: "sexy, alluring, body-hugging silhouette, sheer fabrics, confident", icon: "💋", mood: "Sultry, confident, glamorous" },
  { id: "suit", label: "수트", color: "from-slate-700 via-gray-600 to-slate-800", prompt: "tailored suit, sharp, formal, structured shoulders, power look", icon: "🤵", mood: "Sharp, powerful, refined" },
  { id: "street", label: "스트릿", color: "from-gray-600 via-gray-800 to-gray-950", prompt: "street fashion, urban, oversized, hip-hop inspired, casual", icon: "🧢", mood: "Urban, cool, casual" },
  { id: "girlcrush", label: "걸크러쉬", color: "from-red-800 via-rose-900 to-gray-900", prompt: "girl crush, powerful, leather, bold, edgy, fierce", icon: "🔥", mood: "Powerful, bold, fierce", girlOnly: true },
];

// 해시태그 — 갤러리 HASHTAG_FILTERS의 concept 값과 연동
const HASHTAGS = [
  { label: "#무대의상", keyword: "무대의상" },
  { label: "#Y2K패션", keyword: "Y2K" },
  { label: "#스트릿", keyword: "스트릿" },
  { label: "#시퀸드레스", keyword: "시퀸 드레스" },
  { label: "#크롭탑", keyword: "크롭탑" },
  { label: "#오버사이즈", keyword: "오버사이즈" },
  { label: "#레더재킷", keyword: "레더 재킷" },
  { label: "#네온컬러", keyword: "네온 컬러" },
  { label: "#플리츠스커트", keyword: "플리츠 스커트" },
  { label: "#하이부츠", keyword: "하이부츠" },
];

const IMAGE_COUNT_OPTIONS = [1, 2, 4];

// 생성 중 로딩 메시지
const GENERATION_LOADING_MESSAGES = [
  "실루엣과 스테이지 무드를 잡고 있어요...",
  "패브릭 텍스처, 컬러, 광택을 조합 중...",
  "퍼포먼스에 어울리는 디테일을 구성 중...",
  "악세서리를 매치하고 컨셉을 다듬는 중...",
  "마지막 터치: 더 대담하고 선명하게...",
];

export default function StudioPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [idolType, setIdolType] = useState("girlgroup");
  const [conceptStyle, setConceptStyle] = useState<string | null>(null);
  const [imageCount, setImageCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; index: number }[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);

  // Fullscreen preview
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishTitle, setPublishTitle] = useState("");
  const [publishDesc, setPublishDesc] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Publish Success State
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [publishedDesignId, setPublishedDesignId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Reset girlcrush when switching away from girlgroup
  useEffect(() => {
    if (idolType !== "girlgroup" && conceptStyle === "girlcrush") {
      setConceptStyle(null);
    }
  }, [idolType, conceptStyle]);

  useEffect(() => {
    if (!isGenerating) {
      setLoadingMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) =>
        prev < GENERATION_LOADING_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const toggleHashtag = (keyword: string) => {
    const tag = `#${keyword.replace(/\s+/g, "")}`;
    if (prompt.includes(tag)) {
      // Remove tag from prompt text
      setPrompt((prev) => prev.replace(tag, "").replace(/\s{2,}/g, " ").trim());
      setSelectedHashtags((prev) => prev.filter((h) => h !== keyword));
    } else {
      // Append tag naturally to prompt text
      setPrompt((prev) => (prev.trim() ? `${prev.trim()} ${tag}` : tag));
      setSelectedHashtags((prev) => [...prev, keyword]);
    }
  };

  const fullPrompt = prompt.trim();

  const handleGenerate = async () => {
    if (!fullPrompt) return;

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
          prompt: fullPrompt,
          idolType: selectedIdol?.prompt || "K-POP idol",
          conceptStyle: selectedConcept?.mood || "Charismatic, stylish, energetic",
          conceptPrompt: selectedConcept?.prompt || "",
          imageCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      const urls: string[] = data.urls || [];
      const images = urls.map((url, index) => ({ url, index }));
      setGeneratedImages(images);
      // Auto-select first image only
      if (images.length > 0) {
        setSelectedImages([images[0].url]);
      }
    } catch (error) {
      console.error("Generate error:", error);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } finally {
      setIsGenerating(false);
    }
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
          keywords: selectedHashtags.join(","),
          ownerUid: user?.uid || "anonymous",
          ownerHandle: user?.displayName || "Guest Designer",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");

      setShowPublishModal(false);
      setPublishedDesignId(data.designId || null);
      setShowPublishSuccess(true);
    } catch (error) {
      console.error("Publish error:", error);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
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
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const visibleConcepts = CONCEPT_STYLES.filter(
    (s) => !s.girlOnly || idolType === "girlgroup"
  );

  // Publish success screen with share
  if (showPublishSuccess) {
    return (
      <div className="bg-white text-black antialiased min-h-screen pb-24 font-korean">
        <Header />
        <main className="max-w-md mx-auto pt-[80px] px-5">
          {/* Published images */}
          {selectedImages.length === 1 ? (
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-6">
              <Image
                src={selectedImages[0]}
                alt="Published design"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                공개 완료
              </div>
            </div>
          ) : selectedImages.length > 1 ? (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {selectedImages.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image src={url} alt={`Published ${i + 1}`} fill className="object-cover" sizes="200px" />
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
            <h2 className="text-xl font-black font-korean mb-2">갤러리에 공개되었어요!</h2>
            <p className="text-[13px] text-gray-500">친구에게 공유하고 투표를 받아보세요.</p>
          </div>

          {/* Share buttons */}
          <div className="space-y-3 mb-8">
            <button
              onClick={handleShareNative}
              className="w-full py-3.5 bg-black text-white text-[14px] font-bold rounded-full flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
            >
              <span className="material-symbols-outlined text-[22px]">ios_share</span>
              친구에게 공유하기
            </button>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  const url = publishedDesignId ? `${window.location.origin}/design/${publishedDesignId}` : window.location.origin;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("AI로 만든 K-POP 무대의상을 확인해보세요!")}&url=${encodeURIComponent(url)}`, "_blank");
                }}
                className="py-3 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center gap-1.5 hover:bg-gray-100 transition-colors"
              >
                <span className="text-[18px] font-bold">𝕏</span>
                <span className="text-[10px] text-gray-500 font-bold">X</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="py-3 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center gap-1.5 hover:bg-gray-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-gray-700">
                  {linkCopied ? "check" : "link"}
                </span>
                <span className="text-[10px] text-gray-500 font-bold">
                  {linkCopied ? "복사됨!" : "링크 복사"}
                </span>
              </button>
              <button
                onClick={() => {
                  const url = publishedDesignId ? `${window.location.origin}/design/${publishedDesignId}` : window.location.origin;
                  window.open(`https://story.kakao.com/share?url=${encodeURIComponent(url)}`, "_blank");
                }}
                className="py-3 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center gap-1.5 hover:bg-gray-100 transition-colors"
              >
                <span className="text-[18px]">💬</span>
                <span className="text-[10px] text-gray-500 font-bold">카카오</span>
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
      <Header />

      <main className="max-w-md mx-auto pt-[80px] px-5 space-y-6">
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
                  className={`py-4 rounded-xl text-[13px] font-bold transition-all flex flex-col items-center gap-2 ${
                    idolType === type.id
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
                  className={`relative overflow-hidden rounded-xl py-4 px-2 text-center transition-all ${
                    conceptStyle === style.id
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

          {/* Step 3: Keywords / Prompt + Hashtags */}
          <div className="space-y-3">
            <label className="text-[13px] font-bold text-gray-500 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">3</span>
              키워드 입력
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  // Sync selectedHashtags state with actual text content
                  setSelectedHashtags((prev) =>
                    prev.filter((kw) => e.target.value.includes(`#${kw.replace(/\s+/g, "")}`))
                  );
                }}
                placeholder="원하는 스타일을 자유롭게 적어주세요!"
                maxLength={500}
                rows={3}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              />
              <span className="absolute bottom-3 right-3 text-[10px] text-gray-300 font-medium">
                {prompt.length}/500
              </span>
            </div>

            {/* Hashtag suggestions */}
            <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
              <div className="flex gap-2 w-max pb-1">
                {HASHTAGS.map((tag) => (
                  <button
                    key={tag.keyword}
                    onClick={() => toggleHashtag(tag.keyword)}
                    className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-full whitespace-nowrap transition-colors ${
                      selectedHashtags.includes(tag.keyword)
                        ? "bg-black text-white"
                        : "bg-white border border-gray-200 text-gray-500 hover:border-black hover:text-black"
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4: Image Count */}
          <div className="space-y-3">
            <label className="text-[13px] font-bold text-gray-500 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">4</span>
              이미지 개수
            </label>
            <div className="flex gap-3">
              {IMAGE_COUNT_OPTIONS.map((count) => (
                <button
                  key={count}
                  onClick={() => setImageCount(count)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    imageCount === count
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
            onClick={handleGenerate}
            disabled={isGenerating || !fullPrompt}
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
          <section className="space-y-5 pt-2">
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
                    className={`relative w-full ${generatedImages.length === 1 ? "aspect-[3/4]" : "aspect-[3/4]"} rounded-xl overflow-hidden bg-gray-100 border-2 transition-all ${
                      selectedImages.includes(img.url)
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
                    />
                  </button>
                  {/* Selection checkbox — top right */}
                  {generatedImages.length > 1 && (
                    <button
                      onClick={() => toggleImageSelection(img.url)}
                      className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        selectedImages.includes(img.url)
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
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                    return;
                  }
                  setShowPublishModal(true);
                }}
                className="flex-1 py-3.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">publish</span>
                {selectedImages.length > 1 ? `${selectedImages.length}장 공개` : "갤러리에 공개"}
              </button>
            </div>
          </section>
        )}

        {/* Loading overlay */}
        {isGenerating && (
          <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center px-8">
            <div className="w-16 h-16 border-[3px] border-gray-100 border-t-black rounded-full animate-spin mb-8"></div>
            <p className="text-[15px] font-bold text-black text-center mb-2">AI가 디자인하는 중...</p>
            <p className="text-[13px] text-gray-400 text-center transition-opacity duration-500">
              {GENERATION_LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </div>
        )}

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-full text-[13px] font-bold shadow-xl">
            {generatedImages.length > 0 && selectedImages.length === 0
              ? "공개할 이미지를 선택해주세요"
              : "오류가 발생했습니다. 다시 시도해주세요."}
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
            />
          </div>
          {/* Select / deselect from fullscreen */}
          {generatedImages.length > 1 && fullscreenImage && (
            <button
              className={`absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-[13px] font-bold transition-all ${
                selectedImages.includes(fullscreenImage)
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
                <h3 className="text-lg font-black font-korean">갤러리에 공개하기</h3>
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
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image src={selectedImages[0]} alt="Publish preview" fill className="object-cover" sizes="400px" />
                </div>
              ) : selectedImages.length > 1 ? (
                <div className="grid grid-cols-2 gap-2">
                  {selectedImages.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image src={url} alt={`Preview ${i + 1}`} fill className="object-cover" sizes="200px" />
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
                {selectedHashtags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-[12px] font-bold text-black rounded-full">
                    #{tag.replace(/\s+/g, "")}
                  </span>
                ))}
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
                    갤러리에 공개하기
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
