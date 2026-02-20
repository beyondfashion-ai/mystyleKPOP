"use client";

import { useState, useCallback, useEffect } from "react";
import type { StylistFeedback } from "@/lib/stylist-personas";

interface StylistFeedbackCardProps {
  feedbacks: StylistFeedback[];
  mode: "select" | "display"; // select = studio (pick one), display = detail page
  selectedPersonaId?: string;
  onSelect?: (personaId: string) => void;
  onRegenerate?: (feedback: string) => void; // Regenerate with this advice
  isRegenerating?: boolean; // Show spinner on regenerate button
  freeCount?: number; // How many feedbacks are free (default: 1 for select, all for display)
  onUnlock?: () => void; // Called after ad viewed — fetch remaining feedbacks
}

function PersonaAvatar({
  avatar,
  icon,
  stylehouse,
  size = "sm",
}: {
  avatar?: string;
  icon?: string;
  stylehouse: string;
  size?: "sm" | "lg";
}) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = size === "lg" ? "w-12 h-12" : "w-7 h-7";
  const iconSize = size === "lg" ? "text-[24px]" : "text-[18px]";

  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={`${stylehouse} avatar`}
        className={`${sizeClass} object-cover rounded-lg`}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <span
      className={`material-symbols-outlined ${iconSize} text-white`}
      style={{ fontVariationSettings: "'FILL' 1" }}
    >
      {icon || "person"}
    </span>
  );
}

// Highlight company names and key terms in bio text
const BOLD_KEYWORDS = [
  "SN", "YCC", "HIBE", "JIP",
  "SN ent", "YCC ent", "HIBE ent", "JIP ent",
  "광야", "WHO'S NEXT?", "화양연화", "도파민 스테이징",
  "크롬", "올블랙", "내러티브 드리븐", "도파민 컬러링",
];

function HighlightedInline({ text }: { text: string }) {
  const regex = new RegExp(`(${BOLD_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        BOLD_KEYWORDS.includes(part) ? (
          <span key={i} className="font-bold text-gray-600">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function HighlightedBio({ text }: { text: string }) {
  return (
    <p className="text-[11px] text-gray-400 leading-relaxed mt-2 whitespace-pre-wrap">
      <HighlightedInline text={text} />
    </p>
  );
}

// Placeholder rewarded ad — replace with real SDK (AdSense/AdMob) later
function useRewardedAd() {
  const [adState, setAdState] = useState<"idle" | "loading" | "done">("idle");

  const showAd = useCallback((): Promise<boolean> => {
    setAdState("loading");
    return new Promise((resolve) => {
      // TODO: Replace with actual rewarded ad SDK
      // For now, simulate a 2-second ad view
      setTimeout(() => {
        setAdState("done");
        resolve(true);
      }, 2000);
    });
  }, []);

  const resetAd = useCallback(() => setAdState("idle"), []);

  return { adState, showAd, resetAd };
}

export default function StylistFeedbackCard({
  feedbacks,
  mode,
  selectedPersonaId,
  onSelect,
  onRegenerate,
  isRegenerating,
  freeCount,
  onUnlock,
}: StylistFeedbackCardProps) {
  // Default: display mode = all free, select mode = 1 free
  const effectiveFreeCount = freeCount ?? (mode === "display" ? feedbacks.length : 1);

  const [activeIndex, setActiveIndex] = useState(0);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [freePersonaIds, setFreePersonaIds] = useState<Set<string>>(new Set());
  const [adTargetId, setAdTargetId] = useState<string | null>(null);
  const { adState, showAd, resetAd } = useRewardedAd();

  // Determine free personas: those with loaded feedback content
  useEffect(() => {
    if (feedbacks.length > 0) {
      let freeIds: Set<string>;
      if (effectiveFreeCount >= feedbacks.length) {
        // Display mode: all free
        freeIds = new Set(feedbacks.map((f) => f.personaId));
      } else {
        // Select mode: personas with loaded feedback are free
        const loaded = feedbacks.filter((f) => f.feedback);
        if (loaded.length > 0) {
          freeIds = new Set(loaded.slice(0, effectiveFreeCount).map((f) => f.personaId));
        } else {
          // Fallback: pick first one
          freeIds = new Set([feedbacks[0].personaId]);
        }
      }
      setUnlockedIds((prev) => {
        const merged = new Set(prev);
        freeIds.forEach((id) => merged.add(id));
        return merged;
      });
      setFreePersonaIds(freeIds);

      // Set active tab to the first free persona (only on initial load)
      if (freePersonaIds.size === 0) {
        const freeIndex = feedbacks.findIndex((f) => freeIds.has(f.personaId));
        if (freeIndex >= 0) setActiveIndex(freeIndex);
      }
    }
  }, [feedbacks, effectiveFreeCount]);

  if (!feedbacks || feedbacks.length === 0) return null;

  const activeFb = feedbacks[activeIndex];
  const isUnlocked = (personaId: string) => unlockedIds.has(personaId);
  const isSelected = (personaId: string) => selectedPersonaId === personaId;
  const isFree = (personaId: string) => freePersonaIds.has(personaId);

  const handleTabClick = (i: number) => {
    setActiveIndex(i);
    const fb = feedbacks[i];
    if (isUnlocked(fb.personaId) && mode === "select" && onSelect) {
      onSelect(fb.personaId);
    }
  };

  const handleUnlock = async (personaId: string) => {
    setAdTargetId(personaId);
    // Start fetching remaining feedbacks AND showing ad simultaneously
    onUnlock?.();
    const success = await showAd();
    if (success) {
      setUnlockedIds(new Set(feedbacks.map((f) => f.personaId)));
      if (mode === "select" && onSelect) {
        onSelect(personaId);
      }
    }
    setAdTargetId(null);
    resetAd();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">
        AI Stylist Feedback
      </h3>

      {/* Persona tabs */}
      <div className="flex gap-2">
        {feedbacks.map((fb, i) => {
          const unlocked = isUnlocked(fb.personaId);
          const free = isFree(fb.personaId);

          return (
            <button
              key={fb.personaId}
              onClick={() => handleTabClick(i)}
              className={`relative flex-1 py-2.5 px-1 rounded-xl text-center transition-all ${activeIndex === i
                  ? "bg-black text-white shadow-md"
                  : "bg-gray-50 text-gray-500 border border-gray-100 hover:border-gray-300"
                }`}
            >
              {/* FREE badge */}
              {free && effectiveFreeCount < feedbacks.length && (
                <div className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 bg-green-500 rounded-full z-10">
                  <span className="text-[8px] font-black text-white">FREE</span>
                </div>
              )}

              {/* Lock icon for locked tabs */}
              {!unlocked && !free && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center shadow-sm z-10">
                  <span
                    className="material-symbols-outlined text-[10px] text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock
                  </span>
                </div>
              )}

              {/* Selection checkmark */}
              {mode === "select" && isSelected(fb.personaId) && unlocked && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm z-10">
                  <span
                    className="material-symbols-outlined text-[12px] text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                </div>
              )}

              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-lg ${activeIndex === i ? "bg-white/20" : "bg-gray-100"
                    } flex items-center justify-center overflow-hidden ${!unlocked && !free ? "opacity-50" : ""
                    }`}
                >
                  <PersonaAvatar
                    avatar={fb.avatar}
                    icon={fb.icon}
                    stylehouse={fb.stylehouse}
                  />
                </div>
                <span className={`text-[10px] font-bold ${!unlocked && !free ? "opacity-50" : ""}`}>
                  {fb.fullName}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active feedback card */}
      {activeFb && (
        <div
          className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${mode === "select" && isSelected(activeFb.personaId)
              ? "border-green-300 ring-1 ring-green-200"
              : "border-gray-100"
            } bg-white`}
        >
          {/* Gradient bar */}
          <div className={`h-1 bg-gradient-to-r ${activeFb.color}`} />

          {/* Profile header — always visible */}
          <div className="px-4 py-3 flex items-start gap-3 border-b border-gray-50">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeFb.color} flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0`}
            >
              <PersonaAvatar
                avatar={activeFb.avatar}
                icon={activeFb.icon}
                stylehouse={activeFb.stylehouse}
                size="lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-black text-black tracking-tight">
                {activeFb.fullName}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {activeFb.stylehouse} · <HighlightedInline text={activeFb.title} />
              </p>
            </div>
            {mode === "select" && isUnlocked(activeFb.personaId) && (
              <button
                onClick={() => onSelect?.(activeFb.personaId)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex-shrink-0 ${isSelected(activeFb.personaId)
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
              >
                {isSelected(activeFb.personaId) ? "선택됨" : "선택"}
              </button>
            )}
          </div>

          {/* Philosophy + Bio — always visible */}
          <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
            {activeFb.philosophy && (
              <p className="text-[12px] text-gray-500 italic leading-relaxed">
                &ldquo;{activeFb.philosophy}&rdquo;
              </p>
            )}
            <HighlightedBio text={activeFb.bio} />
          </div>

          {/* Feedback area — locked or unlocked */}
          {isUnlocked(activeFb.personaId) ? (
            /* Unlocked: show feedback */
            <div className="px-4 py-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Style Advice
              </p>
              {activeFb.feedback ? (
                <p className="text-[14px] text-gray-700 leading-relaxed font-korean">
                  {activeFb.feedback}
                </p>
              ) : (
                <div className="flex items-center gap-2 py-3">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
                  <span className="text-[13px] text-gray-400">피드백 로딩 중...</span>
                </div>
              )}
              {mode === "select" && onRegenerate && (
                <button
                  onClick={() => onRegenerate(activeFb.feedback)}
                  disabled={isRegenerating}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-[13px] font-bold rounded-xl hover:from-black hover:to-gray-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isRegenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      AI가 조언을 반영하는 중...
                    </>
                  ) : (
                    <>
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        refresh
                      </span>
                      이 조언 반영해서 다시 만들기
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            /* Locked: show ad prompt */
            <div className="px-4 py-6 flex flex-col items-center gap-3">
              {adTargetId === activeFb.personaId && adState === "loading" ? (
                /* Ad is playing */
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                  <p className="text-[12px] text-gray-400 font-medium">
                    광고 로딩 중...
                  </p>
                </div>
              ) : (
                /* Show unlock button */
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-[24px] text-gray-300"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      lock
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500 font-medium text-center">
                    {activeFb.fullName} 스타일리스트의 어드바이스가 잠겨있어요
                  </p>
                  <button
                    onClick={() => handleUnlock(activeFb.personaId)}
                    className="px-5 py-2.5 bg-black text-white text-[13px] font-bold rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      play_circle
                    </span>
                    광고 보고 전체 어드바이스 받기
                  </button>
                  <p className="text-[10px] text-gray-300">
                    약 15초 · 모든 스타일리스트 잠금 해제
                  </p>
                </>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="px-4 pb-3">
            <p className="text-[10px] text-gray-300">
              AI 버추얼 스타일리스트 · 특정 기획사와 공식 관계 없음
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
