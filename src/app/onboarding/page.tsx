"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const USER_PERSONALIZATION_STORAGE_KEY = "mystyle_user_personalization_v1";

const IDOL_PRESETS = ["NewJeans", "aespa", "IVE", "BTS", "SEVENTEEN", "Stray Kids", "BLACKPINK", "TXT"];

const STYLE_PRESETS = [
  { id: "y2k", label: "Y2K", prompt: "Y2K retro stage styling" },
  { id: "highteen", label: "하이틴", prompt: "high teen preppy stage outfit" },
  { id: "street", label: "스트릿", prompt: "streetwear urban styling" },
  { id: "suit", label: "수트", prompt: "tailored suit performance look" },
  { id: "cyber", label: "미래지향적", prompt: "cyberpunk futuristic outfit" },
  { id: "girlcrush", label: "걸크러쉬", prompt: "girl crush edgy styling" },
  { id: "sexy", label: "섹시", prompt: "sexy glamorous stage look" },
];

const COLOR_PRESETS = [
  { id: "black-silver", label: "블랙/실버", prompt: "black and silver palette" },
  { id: "pink-white", label: "핑크/화이트", prompt: "pink and white palette" },
  { id: "red-black", label: "레드/블랙", prompt: "red and black contrast palette" },
  { id: "blue-white", label: "블루/화이트", prompt: "blue and white palette" },
  { id: "neon-mix", label: "네온 믹스", prompt: "neon mixed color palette" },
  { id: "pastel", label: "파스텔", prompt: "soft pastel tones" },
];

const VIBE_PRESETS = [
  { id: "glam", label: "화려한 콘서트", prompt: "high-energy concert spotlight atmosphere" },
  { id: "chic", label: "시크/럭셔리", prompt: "chic and luxury performance mood" },
  { id: "bright", label: "귀엽고 밝게", prompt: "bright and playful stage mood" },
  { id: "dark", label: "다크/강렬", prompt: "dark and intense performance vibe" },
];

function buildStarterPrompt(groups: string[], styles: string[], colors: string[], vibe: string | null) {
  const groupPart = groups[0] ? `${groups[0]} style` : "K-POP idol style";
  const styleParts = styles
    .map((id) => STYLE_PRESETS.find((s) => s.id === id)?.prompt)
    .filter((v): v is string => Boolean(v))
    .slice(0, 2);
  const colorParts = colors
    .map((id) => COLOR_PRESETS.find((c) => c.id === id)?.prompt)
    .filter((v): v is string => Boolean(v))
    .slice(0, 2);
  const vibePart = vibe ? VIBE_PRESETS.find((v) => v.id === vibe)?.prompt : "";

  const joined = [groupPart, ...styleParts, ...colorParts, vibePart]
    .filter(Boolean)
    .join(", ");
  return joined.slice(0, 200);
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [favoriteGroups, setFavoriteGroups] = useState<string[]>([]);
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [preferredColors, setPreferredColors] = useState<string[]>([]);
  const [preferredStageVibe, setPreferredStageVibe] = useState<string | null>(null);
  const [customGroupInput, setCustomGroupInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const nextParam = searchParams.get("next");
  const redirectTo = nextParam && nextParam.startsWith("/") ? nextParam : "/studio";

  useEffect(() => {
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent("/onboarding")}`);
    }
  }, [user, router]);

  const starterPrompt = useMemo(
    () => buildStarterPrompt(favoriteGroups, preferredStyles, preferredColors, preferredStageVibe),
    [favoriteGroups, preferredStyles, preferredColors, preferredStageVibe]
  );

  const toggleGroup = (name: string) => {
    setFavoriteGroups((prev) => {
      if (prev.includes(name)) return prev.filter((v) => v !== name);
      if (prev.length >= 3) return prev;
      return [...prev, name];
    });
  };

  const addCustomGroup = () => {
    const value = customGroupInput.trim();
    if (!value) return;
    if (value.length > 30) return;
    setFavoriteGroups((prev) => {
      if (prev.includes(value)) return prev;
      if (prev.length >= 3) return prev;
      return [...prev, value];
    });
    setCustomGroupInput("");
  };

  const toggleStyle = (id: string) => {
    setPreferredStyles((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const toggleColor = (id: string) => {
    setPreferredColors((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const savePersonalization = async (skip = false) => {
    if (!user) return;
    setError("");
    setIsSaving(true);

    try {
      const payload = {
        onboardingCompleted: !skip,
        favoriteGroups: skip ? [] : favoriteGroups,
        preferredStyles: skip ? [] : preferredStyles,
        preferredColors: skip ? [] : preferredColors,
        preferredStageVibe: skip ? null : preferredStageVibe,
        preferredConcept: skip ? null : preferredStyles[0] || null,
        starterPrompt: skip ? null : starterPrompt || null,
      };

      const token = await user.getIdToken();
      const res = await fetch("/api/user/personalization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save preferences");
      }

      try {
        localStorage.setItem(USER_PERSONALIZATION_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // ignore storage errors
      }

      router.replace(redirectTo);
    } catch (e) {
      const message = e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-korean">
      <div className="h-1 bg-gradient-to-r from-black via-gray-800 to-vibrant-cyan" />
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-black tracking-tight">취향 설정</h1>
        <p className="mt-2 text-sm text-gray-500">30초만에 메이킹룸을 내 취향으로 맞춰드릴게요.</p>

        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-bold text-gray-600">선호 아이돌/그룹 (최대 3개)</h2>
          <div className="flex flex-wrap gap-2">
            {IDOL_PRESETS.map((name) => {
              const selected = favoriteGroups.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleGroup(name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    selected
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:border-black"
                  }`}
                >
                  #{name}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              value={customGroupInput}
              onChange={(e) => setCustomGroupInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomGroup();
                }
              }}
              placeholder="직접 입력 (예: LE SSERAFIM)"
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              maxLength={30}
            />
            <button
              type="button"
              onClick={addCustomGroup}
              className="px-4 py-2.5 text-sm font-bold rounded-lg border border-gray-200 hover:border-black"
            >
              추가
            </button>
          </div>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-bold text-gray-600">선호 스타일 (최대 3개)</h2>
          <div className="flex flex-wrap gap-2">
            {STYLE_PRESETS.map((style) => {
              const selected = preferredStyles.includes(style.id);
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => toggleStyle(style.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    selected
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:border-black"
                  }`}
                >
                  {style.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-bold text-gray-600">선호 색상 (최대 2개)</h2>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((color) => {
              const selected = preferredColors.includes(color.id);
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => toggleColor(color.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    selected
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:border-black"
                  }`}
                >
                  {color.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-bold text-gray-600">선호 무대 무드</h2>
          <div className="flex flex-wrap gap-2">
            {VIBE_PRESETS.map((vibe) => {
              const selected = preferredStageVibe === vibe.id;
              return (
                <button
                  key={vibe.id}
                  type="button"
                  onClick={() => setPreferredStageVibe(selected ? null : vibe.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    selected
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:border-black"
                  }`}
                >
                  {vibe.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs font-bold text-gray-500">미리 생성되는 스타터 프롬프트</p>
          <p className="mt-1 text-sm text-black">{starterPrompt || "선택하면 자동으로 생성됩니다."}</p>
        </section>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => savePersonalization(true)}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold hover:border-black disabled:opacity-60"
          >
            건너뛰기
          </button>
          <button
            type="button"
            onClick={() => savePersonalization(false)}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-bold hover:opacity-90 disabled:opacity-60"
          >
            {isSaving ? "저장 중..." : "완료하고 시작하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
