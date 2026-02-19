"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Sparkles, Music, Palette, Star, ArrowRight } from "lucide-react";
import { ARCHETYPES, STYLE_KEYWORDS, COLOR_PALETTES, Archetype } from "@/data/onboarding-data";
import { resolveGroupName } from "@/lib/group-aliases";

const USER_PERSONALIZATION_STORAGE_KEY = "mystyle_user_personalization_v1";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Steps: 1=Idol, 2=Style/Keywords, 3=Color, 4=Loading/Contract
  const [step, setStep] = useState(1);
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string | null>(null);
  const [customGroupName, setCustomGroupName] = useState("");
  const [groupSuggestions, setGroupSuggestions] = useState<{ displayName: string; count: number }[]>([]);
  const [showGroupSuggestions, setShowGroupSuggestions] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [customKeywordInput, setCustomKeywordInput] = useState("");
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [customColorText, setCustomColorText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Auth check
  useEffect(() => {
    if (!user) {
      // Just redirect to login if not auth, keeping next param if needed
      // For now simple redirect
      // router.replace("/login"); 
    }
  }, [user, router]);

  const selectedArchetype = useMemo(() =>
    ARCHETYPES.find(a => a.id === selectedArchetypeId),
    [selectedArchetypeId]
  );

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleComplete();
  };

  // Debounced group name search
  useEffect(() => {
    if (!customGroupName.trim()) { setGroupSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tags/search?q=${encodeURIComponent(customGroupName.trim())}&limit=5`);
        const data = await res.json();
        setGroupSuggestions(data.tags || []);
      } catch { setGroupSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [customGroupName]);

  const hasStep1Selection = !!selectedArchetypeId || customGroupName.trim().length > 0;

  const handleComplete = async () => {
    setIsSaving(true);
    setStep(4); // Show loading/contract animation

    // Construct prompt
    const archetypeKeywords = selectedArchetype?.keywords.join(", ") || "";
    const styleKwLabels = selectedKeywords.map(k => STYLE_KEYWORDS.find(sk => sk.id === k)?.label || k).join(", ");
    const colorPalette = COLOR_PALETTES.find(c => c.id === selectedColorId)?.label || customColorText.trim() || "";

    const promptParts = ["K-Pop Stage Outfit", archetypeKeywords, styleKwLabels, colorPalette ? `${colorPalette} Color Palette` : "", "High Quality", "Detailed"].filter(Boolean);
    const starterPrompt = promptParts.join(", ");

    const rawCustom = customGroupName.trim();
    const resolvedCustom = rawCustom ? resolveGroupName(rawCustom).displayName : null;
    const trimmedColor = customColorText.trim();
    const payload = {
      onboardingCompleted: true,
      archetypeId: selectedArchetypeId,
      archetypeLabel: selectedArchetype?.label || resolvedCustom || null,
      customGroupName: resolvedCustom || null,
      styleKeywords: selectedKeywords,
      colorPaletteId: selectedColorId,
      customColorText: trimmedColor || null,
      starterPrompt,
      createdAt: Date.now()
    };

    // Save to API (mocked for now as per previous code structure, or assuming API exists)
    try {
      if (user) {
        const token = await user.getIdToken();
        await fetch("/api/user/personalization", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      // Save local for immediate use
      localStorage.setItem(USER_PERSONALIZATION_STORAGE_KEY, JSON.stringify(payload));

      // Delay for effect
      setTimeout(() => {
        router.replace("/studio");
      }, 2500);
    } catch (e) {
      console.error("Failed to save", e);
      // Fallback
      localStorage.setItem(USER_PERSONALIZATION_STORAGE_KEY, JSON.stringify(payload));
      setTimeout(() => {
        router.replace("/studio");
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 flex flex-col min-h-screen">

        {/* Header / Progress */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold text-xl font-serif">M</div>
            <span className="font-bold tracking-wider text-sm">MYSTYLE <span className="text-cyan-400">AGENCY</span></span>
          </div>
          {step < 4 && (
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-8 rounded-full transition-all duration-300 ${s <= step ? "bg-cyan-400" : "bg-gray-800"}`}
                />
              ))}
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-black mb-2">당신의 뮤즈를 찾아보세요</h1>
                <p className="text-gray-400">어떤 스타일의 그룹을 프로듀싱 하시겠습니까?</p>
              </div>

              <div className="grid grid-cols-2 gap-4 content-start">
                {ARCHETYPES.map((arch) => (
                  <button
                    key={arch.id}
                    onClick={() => { setSelectedArchetypeId(arch.id); setCustomGroupName(""); }}
                    className={`relative group p-4 rounded-2xl border transition-all duration-300 text-left hover:scale-[1.02] ${selectedArchetypeId === arch.id
                        ? "bg-gray-800 border-cyan-400 ring-1 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                        : "bg-gray-900/50 border-gray-800 hover:border-gray-600"
                      }`}
                  >
                    <div className="text-3xl mb-3">{arch.visual}</div>
                    <h3 className="font-bold text-sm mb-1">{arch.label}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{arch.description}</p>

                    {selectedArchetypeId === arch.id && (
                      <div className="absolute top-3 right-3 text-cyan-400">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom group name input with autocomplete */}
              <div className="mt-5">
                <p className="text-xs text-gray-500 mb-2">또는 직접 입력</p>
                <div className="relative">
                  <input
                    value={customGroupName}
                    onChange={(e) => { setCustomGroupName(e.target.value); if (e.target.value.trim()) setSelectedArchetypeId(null); setShowGroupSuggestions(true); }}
                    onFocus={() => setShowGroupSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowGroupSuggestions(false), 200)}
                    placeholder="응원하는 그룹 이름을 입력하세요 (예: BTS, 뉴진스)"
                    maxLength={30}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  {customGroupName.trim() && (
                    <button
                      onClick={() => { setCustomGroupName(""); setGroupSuggestions([]); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                    >
                      <span className="text-gray-500 text-sm">✕</span>
                    </button>
                  )}
                  {showGroupSuggestions && groupSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden">
                      {groupSuggestions.map((tag) => (
                        <button
                          key={tag.displayName}
                          onMouseDown={() => { setCustomGroupName(tag.displayName); setSelectedArchetypeId(null); setShowGroupSuggestions(false); }}
                          className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-gray-800 transition-colors"
                        >
                          <span className="text-sm font-semibold text-white">#{tag.displayName}</span>
                          <span className="text-[11px] text-gray-500">{tag.count}개 디자인</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!hasStep1Selection}
                  className="px-8 py-4 bg-white text-black font-bold rounded-full flex items-center gap-2 hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:hover:bg-white"
                >
                  다음 단계 <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <div className="text-cyan-400 text-sm font-bold mb-2 uppercase tracking-wider">{selectedArchetype?.label}</div>
                <h1 className="text-3xl font-black mb-2">컨셉 키워드 정의</h1>
                <p className="text-gray-400">그룹의 비주얼 아이덴티티를 3가지 선택해주세요.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {STYLE_KEYWORDS.map((kw) => {
                  const isSelected = selectedKeywords.includes(kw.id);
                  return (
                    <button
                      key={kw.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedKeywords(prev => prev.filter(k => k !== kw.id));
                        } else {
                          if (selectedKeywords.length < 3) {
                            setSelectedKeywords(prev => [...prev, kw.id]);
                          }
                        }
                      }}
                      className={`px-5 py-3 rounded-full border text-sm font-bold transition-all ${isSelected
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-400"
                          : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
                        }`}
                    >
                      <span className="mr-2">{kw.emoji}</span>
                      {kw.label}
                    </button>
                  );
                })}
                {/* Custom keywords as chips */}
                {selectedKeywords.filter(k => !STYLE_KEYWORDS.some(sk => sk.id === k)).map((ck) => (
                  <button
                    key={ck}
                    onClick={() => setSelectedKeywords(prev => prev.filter(k => k !== ck))}
                    className="px-5 py-3 rounded-full border text-sm font-bold bg-cyan-500/20 border-cyan-400 text-cyan-400"
                  >
                    ✕ {ck}
                  </button>
                ))}
              </div>

              {/* Custom keyword input (max 2) */}
              {selectedKeywords.filter(k => !STYLE_KEYWORDS.some(sk => sk.id === k)).length < 2 && selectedKeywords.length < 3 && (
                <div className="mt-4 flex gap-2">
                  <input
                    value={customKeywordInput}
                    onChange={(e) => setCustomKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const v = customKeywordInput.trim();
                        if (v && !selectedKeywords.includes(v) && selectedKeywords.length < 3) {
                          setSelectedKeywords(prev => [...prev, v]);
                          setCustomKeywordInput("");
                        }
                      }
                    }}
                    placeholder="직접 입력 (예: 글래머러스한)"
                    maxLength={20}
                    className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const v = customKeywordInput.trim();
                      if (v && !selectedKeywords.includes(v) && selectedKeywords.length < 3) {
                        setSelectedKeywords(prev => [...prev, v]);
                        setCustomKeywordInput("");
                      }
                    }}
                    className="px-5 py-3 border border-gray-700 rounded-xl text-sm font-bold text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                  >
                    추가
                  </button>
                </div>
              )}

              <div className="mt-auto flex justify-between pt-12">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 text-gray-500 font-bold hover:text-white transition-colors"
                >
                  이전
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedKeywords.length === 0}
                  className="px-8 py-4 bg-white text-black font-bold rounded-full flex items-center gap-2 hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:hover:bg-white"
                >
                  다음 단계 <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <div className="flex gap-2 mb-2">
                  <span className="text-cyan-400 text-sm font-bold">{selectedArchetype?.label}</span>
                  <span className="text-gray-600 text-sm">•</span>
                  <span className="text-gray-400 text-sm font-medium">{selectedKeywords.length}개 키워드</span>
                </div>
                <h1 className="text-3xl font-black mb-2">시그니처 컬러</h1>
                <p className="text-gray-400">그룹을 대표할 비주얼 컬러를 정해주세요.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    onClick={() => { setSelectedColorId(pal.id); setCustomColorText(""); }}
                    className={`relative p-4 rounded-xl border transition-all ${selectedColorId === pal.id
                        ? "bg-gray-800 border-cyan-400"
                        : "bg-gray-900/50 border-gray-800 hover:border-gray-600"
                      }`}
                  >
                    <div className="flex gap-2 mb-3 h-12 rounded-lg overflow-hidden w-full">
                      {pal.colors.map((c, i) => (
                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{pal.label}</span>
                      {selectedColorId === pal.id && <Check size={16} className="text-cyan-400" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom color input */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">또는 직접 입력</p>
                <input
                  value={customColorText}
                  onChange={(e) => { setCustomColorText(e.target.value); if (e.target.value.trim()) setSelectedColorId(null); }}
                  placeholder="원하는 컬러 느낌 (예: 코랄 핑크, 네이비 골드)"
                  maxLength={30}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="mt-auto flex justify-between pt-12">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-4 text-gray-500 font-bold hover:text-white transition-colors"
                >
                  이전
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedColorId && !customColorText.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold rounded-full flex items-center gap-2 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  <Sparkles size={18} fill="currentColor" />
                  계약 및 데뷔하기
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center pb-20"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(34,211,238,0.3)]"
              >
                <Music size={40} className="text-white" />
              </motion.div>

              <h2 className="text-2xl font-black mb-2">계약서 등록 중...</h2>
              <p className="text-gray-400 mb-8 max-w-xs">
                프로듀서님의 전용 스튜디오를 생성하고 있습니다.
                <br />
                K-POP 역사를 새로 쓸 준비를 하세요.
              </p>

              <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                  className="h-full bg-cyan-400"
                />
              </div>

              <div className="mt-8 flex gap-2 text-xs text-gray-600 font-mono">
                <span>ID: {user?.uid?.slice(0, 8) || "PRODUCER"}</span>
                <span>•</span>
                <span>ACCESS: GRANTED</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
