"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { ARCHETYPES, STYLE_KEYWORDS, COLOR_PALETTES } from "@/data/onboarding-data";
import { resolveGroupName } from "@/lib/group-aliases";

// ─── Interfaces ───
interface UserStats {
    designCount: number;
    totalLikes: number;
    followerCount: number;
    followingCount: number;
}

interface MyDesign {
    id: string;
    imageUrls?: { url: string }[];
    imageUrl?: string;
    concept?: string;
    likeCount: number;
    boostCount?: number;
    createdAt?: { _seconds?: number; seconds?: number };
}

interface Personalization {
    onboardingCompleted?: boolean;
    archetypeId?: string;
    archetypeLabel?: string;
    customGroupName?: string;
    styleKeywords?: string[];
    colorPaletteId?: string;
    customColorText?: string;
    starterPrompt?: string;
}

interface CustomConcept {
    id: string;
    label: string;
    mood: string;
    prompt: string;
    icon: string;
    colorIndex: number;
    createdAt: number;
}

// ─── Constants (copied from onboarding/studio — small arrays, shared localStorage keys) ───
const USER_PERSONALIZATION_STORAGE_KEY = "mystyle_user_personalization_v1";
const CUSTOM_CONCEPTS_STORAGE_KEY = "mystyle_custom_concepts_v1";
const MAX_CUSTOM_CONCEPTS = 2;

const CUSTOM_CONCEPT_GRADIENTS = [
    "from-teal-400 via-cyan-500 to-blue-600",
    "from-orange-400 via-rose-400 to-pink-500",
    "from-emerald-400 via-green-500 to-teal-600",
    "from-indigo-400 via-violet-500 to-purple-600",
    "from-amber-400 via-orange-500 to-red-500",
    "from-sky-400 via-blue-500 to-indigo-600",
    "from-lime-400 via-emerald-500 to-green-600",
    "from-fuchsia-400 via-pink-500 to-rose-600",
];

export default function MyPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<UserStats>({ designCount: 0, totalLikes: 0, followerCount: 0, followingCount: 0 });
    const [myDesigns, setMyDesigns] = useState<MyDesign[]>([]);
    const [likedDesigns, setLikedDesigns] = useState<MyDesign[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingLiked, setLoadingLiked] = useState(false);
    const [activeTab, setActiveTab] = useState<"designs" | "liked">("designs");
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Style DNA state
    const [personalization, setPersonalization] = useState<Personalization | null>(null);
    const [customConcepts, setCustomConcepts] = useState<CustomConcept[]>([]);

    // Style settings sheet
    const [showStyleSheet, setShowStyleSheet] = useState(false);
    const [editArchetypeId, setEditArchetypeId] = useState<string | null>(null);
    const [editCustomGroupName, setEditCustomGroupName] = useState("");
    const [editGroupSuggestions, setEditGroupSuggestions] = useState<{ displayName: string; count: number }[]>([]);
    const [showEditGroupSuggestions, setShowEditGroupSuggestions] = useState(false);
    const [editKeywords, setEditKeywords] = useState<string[]>([]);
    const [editCustomKeywordInput, setEditCustomKeywordInput] = useState("");
    const [editColorId, setEditColorId] = useState<string | null>(null);
    const [editCustomColorText, setEditCustomColorText] = useState("");
    const [savingStyle, setSavingStyle] = useState(false);

    // Custom concept inline editor
    const [editingConcept, setEditingConcept] = useState<CustomConcept | null>(null);
    const [showConceptModal, setShowConceptModal] = useState(false);
    const [conceptLabel, setConceptLabel] = useState("");
    const [conceptMood, setConceptMood] = useState("");

    // ─── Data fetching ───
    const fetchStats = useCallback(async () => {
        if (!user?.uid) return;
        try {
            const res = await fetch(`/api/user/stats?uid=${user.uid}`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoadingStats(false);
        }
    }, [user?.uid]);

    const fetchMyDesigns = useCallback(async () => {
        if (!user?.uid) return;
        try {
            const res = await fetch(`/api/gallery?ownerUid=${user.uid}`);
            const data = await res.json();
            setMyDesigns(data.designs || []);
        } catch (error) {
            console.error("Failed to fetch designs:", error);
        }
    }, [user?.uid]);

    const fetchLikedDesigns = useCallback(async () => {
        if (!user?.uid) return;
        setLoadingLiked(true);
        try {
            const res = await fetch(`/api/gallery?likedBy=${user.uid}`);
            const data = await res.json();
            setLikedDesigns(data.designs || []);
        } catch (error) {
            console.error("Failed to fetch liked designs:", error);
        } finally {
            setLoadingLiked(false);
        }
    }, [user?.uid]);

    // Load personalization + custom concepts from localStorage
    const loadStyleData = useCallback(() => {
        try {
            const raw = localStorage.getItem(USER_PERSONALIZATION_STORAGE_KEY);
            if (raw) setPersonalization(JSON.parse(raw));
        } catch { /* ignore */ }
        try {
            const raw = localStorage.getItem(CUSTOM_CONCEPTS_STORAGE_KEY);
            if (raw) setCustomConcepts(JSON.parse(raw));
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        if (user?.uid) {
            fetchStats();
            fetchMyDesigns();
            loadStyleData();
        } else {
            setLoadingStats(false);
        }
    }, [user?.uid, fetchStats, fetchMyDesigns, loadStyleData]);

    // Fetch liked designs when tab switches
    useEffect(() => {
        if (activeTab === "liked" && user?.uid && likedDesigns.length === 0 && !loadingLiked) {
            fetchLikedDesigns();
        }
    }, [activeTab, user?.uid, likedDesigns.length, loadingLiked, fetchLikedDesigns]);

    // Debounced group name search for style sheet
    useEffect(() => {
        if (!editCustomGroupName.trim()) { setEditGroupSuggestions([]); return; }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/tags/search?q=${encodeURIComponent(editCustomGroupName.trim())}&limit=5`);
                const data = await res.json();
                setEditGroupSuggestions(data.tags || []);
            } catch { setEditGroupSuggestions([]); }
        }, 300);
        return () => clearTimeout(timer);
    }, [editCustomGroupName]);

    // ─── Style sheet helpers ───
    const openStyleSheet = () => {
        setEditArchetypeId(personalization?.archetypeId || null);
        setEditCustomGroupName(personalization?.customGroupName || "");
        setEditKeywords(personalization?.styleKeywords || []);
        setEditCustomKeywordInput("");
        setEditColorId(personalization?.colorPaletteId || null);
        setEditCustomColorText(personalization?.customColorText || "");
        setShowStyleSheet(true);
    };

    const toggleEditKeyword = (id: string) => {
        setEditKeywords((prev) => {
            if (prev.includes(id)) return prev.filter((v) => v !== id);
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const saveStyleSettings = async () => {
        setSavingStyle(true);

        const arch = ARCHETYPES.find(a => a.id === editArchetypeId);
        const kwLabels = editKeywords.map(id => STYLE_KEYWORDS.find(sk => sk.id === id)?.label || id).join(", ");
        const colorLabel = COLOR_PALETTES.find(c => c.id === editColorId)?.label || editCustomColorText.trim() || "";
        const archetypeKeywords = arch?.keywords.join(", ") || "";
        const promptParts = ["K-Pop Stage Outfit", archetypeKeywords, kwLabels, colorLabel ? `${colorLabel} Color Palette` : "", "High Quality", "Detailed"].filter(Boolean);
        const starterPrompt = promptParts.join(", ");

        const rawCustom = editCustomGroupName.trim();
        const resolvedCustom = rawCustom ? resolveGroupName(rawCustom).displayName : undefined;
        const trimmedColor = editCustomColorText.trim();
        const payload: Personalization = {
            onboardingCompleted: true,
            archetypeId: editArchetypeId || undefined,
            archetypeLabel: arch?.label || resolvedCustom || undefined,
            customGroupName: resolvedCustom || undefined,
            styleKeywords: editKeywords,
            colorPaletteId: editColorId || undefined,
            customColorText: trimmedColor || undefined,
            starterPrompt,
        };

        // Save to localStorage
        try {
            localStorage.setItem(USER_PERSONALIZATION_STORAGE_KEY, JSON.stringify({
                ...payload,
                createdAt: personalization?.starterPrompt ? undefined : Date.now(),
            }));
        } catch { /* ignore */ }

        // Save to server if logged in
        if (user) {
            try {
                const token = await user.getIdToken();
                await fetch("/api/user/personalization", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload),
                });
            } catch (error) {
                console.error("Failed to save personalization:", error);
            }
        }

        setPersonalization(payload);
        setSavingStyle(false);
        setShowStyleSheet(false);
    };

    // ─── Custom concept helpers (within style sheet) ───
    const openNewConcept = () => {
        if (customConcepts.length >= MAX_CUSTOM_CONCEPTS) return;
        setEditingConcept(null);
        setConceptLabel("");
        setConceptMood("");
        setShowConceptModal(true);
    };

    const openEditConcept = (c: CustomConcept) => {
        setEditingConcept(c);
        setConceptLabel(c.label);
        setConceptMood(c.mood);
        setShowConceptModal(true);
    };

    const saveConcept = () => {
        if (!conceptLabel.trim()) return;
        let updated: CustomConcept[];
        if (editingConcept) {
            updated = customConcepts.map((c) =>
                c.id === editingConcept.id
                    ? { ...c, label: conceptLabel.trim(), mood: conceptMood.trim(), prompt: conceptMood.trim() }
                    : c
            );
        } else {
            const newConcept: CustomConcept = {
                id: `custom_${Date.now()}`,
                label: conceptLabel.trim(),
                mood: conceptMood.trim(),
                prompt: conceptMood.trim(),
                icon: "🎨",
                colorIndex: customConcepts.length % CUSTOM_CONCEPT_GRADIENTS.length,
                createdAt: Date.now(),
            };
            updated = [...customConcepts, newConcept];
        }
        setCustomConcepts(updated);
        try { localStorage.setItem(CUSTOM_CONCEPTS_STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
        setShowConceptModal(false);
        setEditingConcept(null);
        setConceptLabel("");
        setConceptMood("");
    };

    const deleteConcept = (id: string) => {
        const updated = customConcepts.filter((c) => c.id !== id);
        setCustomConcepts(updated);
        try { localStorage.setItem(CUSTOM_CONCEPTS_STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
    };

    // ─── Logout ───
    const handleLogout = async () => {
        await logout();
        setShowLogoutConfirm(false);
        router.push("/");
    };

    // ─── Helpers ───
    const hasPersonalization = personalization?.onboardingCompleted && (
        !!personalization.archetypeId ||
        !!personalization.customGroupName ||
        (personalization.styleKeywords?.length ?? 0) > 0 ||
        !!personalization.colorPaletteId ||
        !!personalization.customColorText
    );

    // ─── Loading ───
    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    // ─── Not logged in ───
    if (!user) {
        return (
            <div className="bg-white font-display text-black min-h-screen pb-24">
                <Header pageTitle="룩북" subtitle="나의 디자인과 활동을 기록하세요" />
                <main className="max-w-md mx-auto pt-4 px-6 flex flex-col items-center text-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[40px] text-gray-300">person</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-2 font-korean">로그인이 필요합니다</h2>
                        <p className="text-[13px] text-gray-400 leading-relaxed">
                            로그인하고 나만의 디자인을 관리하고<br />커뮤니티에 참여해보세요.
                        </p>
                    </div>
                    <Link
                        href="/login?next=/mypage"
                        className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-xl text-[14px] font-bold hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">login</span>
                        로그인하기
                    </Link>
                </main>
                <BottomNav />
            </div>
        );
    }

    // ─── Design grid renderer (shared for both tabs) ───
    const renderDesignGrid = (designs: MyDesign[], emptyIcon: string, emptyText: string, emptyAction?: React.ReactNode) => {
        if (designs.length > 0) {
            return (
                <div className="grid grid-cols-3 gap-1.5">
                    {designs.map((design) => {
                        const imgSrc = design.imageUrls?.[0]?.url || design.imageUrl || "";
                        return (
                            <Link key={design.id} href={`/design/${design.id}`} className="block">
                                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                                    {imgSrc ? (
                                        <Image src={imgSrc} alt="" fill className="object-cover" sizes="33vw" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-gray-300">image</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                                        <span className="material-symbols-outlined text-white text-[10px]">favorite</span>
                                        <span className="text-white text-[9px] font-bold">{design.likeCount || 0}</span>
                                        <span className="material-symbols-outlined text-white text-[10px]">star</span>
                                        <span className="text-white text-[9px] font-bold">{design.boostCount || 0}</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            );
        }
        return (
            <div className="flex flex-col items-center py-16 gap-4">
                <span className="material-symbols-outlined text-[40px] text-gray-200">{emptyIcon}</span>
                <p className="text-[13px] text-gray-400">{emptyText}</p>
                {emptyAction}
            </div>
        );
    };

    return (
        <div className="bg-white font-display text-black min-h-screen pb-24">
            <Header pageTitle="룩북" subtitle="나의 디자인과 활동을 기록하세요" />

            <main className="max-w-md mx-auto w-full">
                {/* Profile Section */}
                <section className="px-6 py-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                            {user.photoURL ? (
                                <Image src={user.photoURL} alt="Profile" width={80} height={80} className="w-full h-full object-cover rounded-full" unoptimized />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold tracking-tight truncate">{user.displayName || "Guest"}</h2>
                            <p className="text-[12px] text-gray-400 mt-0.5 truncate">{user.email}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-0 mt-8 border border-gray-100 rounded-2xl py-4">
                        <div className="text-center border-r border-gray-100">
                            <p className="text-[17px] font-bold">{loadingStats ? "–" : stats.designCount}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">디자인</p>
                        </div>
                        <div className="text-center border-r border-gray-100">
                            <p className="text-[17px] font-bold">{loadingStats ? "–" : stats.totalLikes}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">받은 좋아요</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[17px] font-bold">{loadingStats ? "–" : stats.followerCount}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">팔로워</p>
                        </div>
                    </div>
                </section>

                {/* ─── Style DNA Section ─── */}
                <section className="px-6 pb-6">
                    <div className="border border-gray-100 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[15px] font-bold font-korean">나의 스타일 DNA</h3>
                            {hasPersonalization ? (
                                <button
                                    onClick={openStyleSheet}
                                    className="text-[12px] text-gray-400 hover:text-black transition-colors flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                    편집
                                </button>
                            ) : null}
                        </div>

                        {hasPersonalization ? (
                            <div className="space-y-4">
                                {/* Preferred Idol */}
                                {(personalization?.archetypeId || personalization?.customGroupName) && (() => {
                                    const arch = ARCHETYPES.find(a => a.id === personalization?.archetypeId);
                                    const displayName = personalization?.customGroupName || (arch ? `${arch.visual} ${arch.label}` : null);
                                    return displayName ? (
                                        <div>
                                            <p className="text-[11px] text-gray-400 font-bold mb-1.5">선호 아이돌</p>
                                            <span className="px-2.5 py-1 bg-gray-50 rounded-full text-[12px] font-bold text-gray-700">
                                                {displayName}
                                            </span>
                                        </div>
                                    ) : null;
                                })()}

                                {/* Style Keywords */}
                                {(personalization?.styleKeywords?.length ?? 0) > 0 && (
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-bold mb-1.5">스타일 키워드</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {personalization!.styleKeywords!.map((id) => {
                                                const kw = STYLE_KEYWORDS.find(sk => sk.id === id);
                                                return (
                                                    <span key={id} className="px-2.5 py-1 bg-gray-50 rounded-full text-[12px] font-bold text-gray-700">
                                                        {kw ? `${kw.emoji} ${kw.label}` : id}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Color Palette */}
                                {(personalization?.colorPaletteId || personalization?.customColorText) && (() => {
                                    const cp = COLOR_PALETTES.find(c => c.id === personalization?.colorPaletteId);
                                    if (cp) return (
                                        <div>
                                            <p className="text-[11px] text-gray-400 font-bold mb-1.5">컬러 팔레트</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-0.5 rounded-full overflow-hidden">
                                                    {cp.colors.map((c, i) => (
                                                        <div key={i} className="w-5 h-5" style={{ backgroundColor: c }} />
                                                    ))}
                                                </div>
                                                <span className="text-[12px] font-bold text-gray-700">{cp.label}</span>
                                            </div>
                                        </div>
                                    );
                                    if (personalization?.customColorText) return (
                                        <div>
                                            <p className="text-[11px] text-gray-400 font-bold mb-1.5">컬러 팔레트</p>
                                            <span className="px-2.5 py-1 bg-gray-50 rounded-full text-[12px] font-bold text-gray-700">
                                                🎨 {personalization.customColorText}
                                            </span>
                                        </div>
                                    );
                                    return null;
                                })()}

                                {/* Custom Concepts */}
                                {customConcepts.length > 0 && (
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-bold mb-1.5">커스텀 컨셉</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {customConcepts.map((cc) => (
                                                <span key={cc.id} className="px-2.5 py-1 bg-gray-50 rounded-full text-[12px] font-bold text-gray-700">
                                                    {cc.icon}{cc.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Onboarding not completed — show CTA */
                            <div className="flex flex-col items-center py-4 gap-3">
                                <span className="material-symbols-outlined text-[32px] text-gray-200">palette</span>
                                <p className="text-[13px] text-gray-400 text-center">아직 취향 설정을 하지 않았어요</p>
                                <button
                                    onClick={openStyleSheet}
                                    className="px-5 py-2.5 bg-black text-white text-[12px] font-bold rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
                                >
                                    취향 설정하러 가기
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Tabs */}
                <div className="px-6 border-b border-gray-100">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab("designs")}
                            className={`pb-3 text-[13px] font-bold transition-colors ${activeTab === "designs" ? "text-black border-b-2 border-black" : "text-gray-300"}`}
                        >
                            내 디자인
                        </button>
                        <button
                            onClick={() => setActiveTab("liked")}
                            className={`pb-3 text-[13px] font-bold transition-colors ${activeTab === "liked" ? "text-black border-b-2 border-black" : "text-gray-300"}`}
                        >
                            좋아요
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <section className="px-6 py-6">
                    {activeTab === "designs" ? (
                        renderDesignGrid(
                            myDesigns,
                            "palette",
                            "아직 게시한 디자인이 없습니다",
                            <Link href="/studio" className="px-5 py-2 bg-black text-white text-[12px] font-bold rounded-full">
                                메이킹 룸으로 이동
                            </Link>
                        )
                    ) : (
                        loadingLiked ? (
                            <div className="flex justify-center py-16">
                                <div className="w-5 h-5 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            renderDesignGrid(
                                likedDesigns,
                                "favorite",
                                "스타일 픽에서 마음에 드는 디자인에 좋아요를 눌러보세요",
                                <Link href="/gallery" className="px-5 py-2 bg-black text-white text-[12px] font-bold rounded-full">
                                    스타일 픽 둘러보기
                                </Link>
                            )
                        )
                    )}
                </section>

                {/* Menu */}
                <nav className="mt-2 border-t border-gray-100">
                    <div className="flex flex-col">
                        {/* Style Settings */}
                        <button
                            onClick={openStyleSheet}
                            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group w-full text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-600 text-[22px]">palette</span>
                                </div>
                                <span className="text-[15px] font-medium">스타일 설정</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </button>
                        <div className="h-[1px] bg-gray-50 mx-6"></div>

                        <Link href="/ranking" className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-600 text-[22px]">emoji_events</span>
                                </div>
                                <span className="text-[15px] font-medium">명예의 전당</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </Link>
                        <div className="h-[1px] bg-gray-50 mx-6"></div>

                        <Link href="/community" className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-600 text-[22px]">forum</span>
                                </div>
                                <span className="text-[15px] font-medium">커뮤니티</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </Link>
                        <div className="h-[1px] bg-gray-50 mx-6"></div>

                        <button className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group w-full text-left">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-600 text-[22px]">campaign</span>
                                </div>
                                <span className="text-[15px] font-medium">공지사항</span>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-400 rounded">준비중</span>
                        </button>
                        <div className="h-[1px] bg-gray-50 mx-6"></div>

                        {/* Logout */}
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="flex items-center justify-between px-6 py-5 hover:bg-red-50 transition-colors group w-full text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-red-400 text-[22px]">logout</span>
                                </div>
                                <span className="text-[15px] font-medium text-red-500">로그아웃</span>
                            </div>
                        </button>
                    </div>
                </nav>
            </main>

            <BottomNav />

            {/* ─── Logout Confirmation Modal ─── */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[1px] px-8">
                    <div className="bg-white rounded-2xl p-6 max-w-[320px] w-full shadow-2xl text-center">
                        <span className="material-symbols-outlined text-[40px] text-gray-300 mb-3">logout</span>
                        <h3 className="text-[16px] font-bold mb-2 font-korean">로그아웃 하시겠습니까?</h3>
                        <p className="text-[13px] text-gray-400 mb-6">다시 로그인하면 모든 데이터를 복원할 수 있습니다.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-3 text-[13px] font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-3 text-[13px] font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Style Settings Bottom Sheet ─── */}
            {showStyleSheet && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={() => setShowStyleSheet(false)}>
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-gray-200 rounded-full"></div>
                        </div>

                        <div className="px-6 pb-32">
                            <div className="flex items-center justify-between py-4">
                                <h2 className="text-lg font-bold font-korean">스타일 설정</h2>
                                <button
                                    onClick={() => setShowStyleSheet(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                                >
                                    <span className="material-symbols-outlined text-[20px] text-gray-400">close</span>
                                </button>
                            </div>

                            {/* 1. Preferred Idol */}
                            <section className="mt-4 space-y-3">
                                <h3 className="text-sm font-bold text-gray-600">선호 아이돌</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {ARCHETYPES.map((arch) => {
                                        const selected = editArchetypeId === arch.id;
                                        return (
                                            <button
                                                key={arch.id}
                                                type="button"
                                                onClick={() => { setEditArchetypeId(selected ? null : arch.id); setEditCustomGroupName(""); }}
                                                className={`p-3 rounded-xl text-left border transition-colors ${
                                                    selected
                                                        ? "bg-black text-white border-black"
                                                        : "bg-white text-gray-700 border-gray-200 hover:border-black"
                                                }`}
                                            >
                                                <span className="text-lg">{arch.visual}</span>
                                                <p className="text-xs font-bold mt-1">{arch.label}</p>
                                                <p className={`text-[10px] mt-0.5 line-clamp-1 ${selected ? "text-gray-300" : "text-gray-400"}`}>{arch.description}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1.5">또는 직접 입력</p>
                                    <div className="relative">
                                        <input
                                            value={editCustomGroupName}
                                            onChange={(e) => { setEditCustomGroupName(e.target.value); if (e.target.value.trim()) setEditArchetypeId(null); setShowEditGroupSuggestions(true); }}
                                            onFocus={() => setShowEditGroupSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowEditGroupSuggestions(false), 200)}
                                            placeholder="응원하는 그룹 이름을 입력하세요 (예: BTS, 뉴진스)"
                                            maxLength={30}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                                        />
                                        {editCustomGroupName.trim() && (
                                            <button
                                                onClick={() => { setEditCustomGroupName(""); setEditGroupSuggestions([]); }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                            >
                                                <span className="material-symbols-outlined text-[16px] text-gray-400">close</span>
                                            </button>
                                        )}
                                        {showEditGroupSuggestions && editGroupSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                                                {editGroupSuggestions.map((tag) => (
                                                    <button
                                                        key={tag.displayName}
                                                        onMouseDown={() => { setEditCustomGroupName(tag.displayName); setEditArchetypeId(null); setShowEditGroupSuggestions(false); }}
                                                        className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                    >
                                                        <span className="text-sm font-semibold text-black">#{tag.displayName}</span>
                                                        <span className="text-[11px] text-gray-400">{tag.count}개 디자인</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* 2. Style Keywords */}
                            <section className="mt-6 space-y-3">
                                <h3 className="text-sm font-bold text-gray-600">스타일 키워드 (최대 3개)</h3>
                                <div className="flex flex-wrap gap-2">
                                    {STYLE_KEYWORDS.map((kw) => {
                                        const selected = editKeywords.includes(kw.id);
                                        return (
                                            <button
                                                key={kw.id}
                                                type="button"
                                                onClick={() => toggleEditKeyword(kw.id)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                                                    selected
                                                        ? "bg-black text-white border-black"
                                                        : "bg-white text-gray-700 border-gray-200 hover:border-black"
                                                }`}
                                            >
                                                {kw.emoji} {kw.label}
                                            </button>
                                        );
                                    })}
                                    {/* Custom keywords as removable chips */}
                                    {editKeywords.filter(k => !STYLE_KEYWORDS.some(sk => sk.id === k)).map((ck) => (
                                        <button
                                            key={ck}
                                            type="button"
                                            onClick={() => setEditKeywords(prev => prev.filter(k => k !== ck))}
                                            className="px-3 py-1.5 rounded-full text-xs font-bold border bg-black text-white border-black"
                                        >
                                            ✕ {ck}
                                        </button>
                                    ))}
                                </div>
                                {/* Custom keyword input (max 2 custom) */}
                                {editKeywords.filter(k => !STYLE_KEYWORDS.some(sk => sk.id === k)).length < 2 && editKeywords.length < 3 && (
                                    <div className="flex gap-2">
                                        <input
                                            value={editCustomKeywordInput}
                                            onChange={(e) => setEditCustomKeywordInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    const v = editCustomKeywordInput.trim();
                                                    if (v && !editKeywords.includes(v) && editKeywords.length < 3) {
                                                        setEditKeywords(prev => [...prev, v]);
                                                        setEditCustomKeywordInput("");
                                                    }
                                                }
                                            }}
                                            placeholder="직접 입력 (예: 글래머러스한)"
                                            maxLength={20}
                                            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const v = editCustomKeywordInput.trim();
                                                if (v && !editKeywords.includes(v) && editKeywords.length < 3) {
                                                    setEditKeywords(prev => [...prev, v]);
                                                    setEditCustomKeywordInput("");
                                                }
                                            }}
                                            className="px-4 py-2.5 text-sm font-bold rounded-lg border border-gray-200 hover:border-black"
                                        >
                                            추가
                                        </button>
                                    </div>
                                )}
                            </section>

                            {/* 3. Color Palette */}
                            <section className="mt-6 space-y-3">
                                <h3 className="text-sm font-bold text-gray-600">컬러 팔레트</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {COLOR_PALETTES.map((pal) => {
                                        const selected = editColorId === pal.id;
                                        return (
                                            <button
                                                key={pal.id}
                                                type="button"
                                                onClick={() => { setEditColorId(selected ? null : pal.id); setEditCustomColorText(""); }}
                                                className={`p-3 rounded-xl border transition-colors ${
                                                    selected
                                                        ? "bg-gray-50 border-black ring-1 ring-black"
                                                        : "bg-white border-gray-200 hover:border-black"
                                                }`}
                                            >
                                                <div className="flex gap-1 mb-2 h-6 rounded overflow-hidden">
                                                    {pal.colors.map((c, i) => (
                                                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                                                    ))}
                                                </div>
                                                <p className="text-xs font-bold text-gray-700">{pal.label}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1.5">또는 직접 입력</p>
                                    <input
                                        value={editCustomColorText}
                                        onChange={(e) => { setEditCustomColorText(e.target.value); if (e.target.value.trim()) setEditColorId(null); }}
                                        placeholder="원하는 컬러 느낌 (예: 코랄 핑크)"
                                        maxLength={30}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                                    />
                                </div>
                            </section>

                            {/* 4. Custom Concepts */}
                            <section className="mt-6 space-y-3">
                                <h3 className="text-sm font-bold text-gray-600">커스텀 컨셉 (최대 {MAX_CUSTOM_CONCEPTS}개)</h3>
                                <div className="space-y-2">
                                    {customConcepts.map((cc) => {
                                        const grad = CUSTOM_CONCEPT_GRADIENTS[cc.colorIndex % CUSTOM_CONCEPT_GRADIENTS.length];
                                        return (
                                            <div key={cc.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center text-white text-sm`}>
                                                    {cc.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-bold truncate">{cc.label}</p>
                                                    {cc.mood && <p className="text-[11px] text-gray-400 truncate">{cc.mood}</p>}
                                                </div>
                                                <button
                                                    onClick={() => openEditConcept(cc)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"
                                                >
                                                    <span className="material-symbols-outlined text-[16px] text-gray-400">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => deleteConcept(cc.id)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50"
                                                >
                                                    <span className="material-symbols-outlined text-[16px] text-red-400">delete</span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {customConcepts.length < MAX_CUSTOM_CONCEPTS && (
                                        <button
                                            onClick={openNewConcept}
                                            className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-gray-200 rounded-xl text-[13px] text-gray-400 hover:border-black hover:text-black transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">add</span>
                                            새 컨셉 만들기
                                        </button>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Fixed bottom save button */}
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-[61]">
                            <button
                                onClick={saveStyleSettings}
                                disabled={savingStyle}
                                className="w-full py-3.5 bg-black text-white text-[14px] font-bold rounded-xl hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60"
                            >
                                {savingStyle ? "저장 중..." : "저장하기"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Custom Concept Inline Modal (inside style sheet) ─── */}
            {showConceptModal && (
                <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={() => { setShowConceptModal(false); setEditingConcept(null); }}>
                    <div className="bg-white rounded-t-3xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-[16px] font-bold font-korean">
                                {editingConcept ? "컨셉 수정" : "새 컨셉 만들기"}
                            </h3>
                            <button
                                onClick={() => { setShowConceptModal(false); setEditingConcept(null); }}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            >
                                <span className="material-symbols-outlined text-[20px] text-gray-400">close</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[12px] font-bold text-gray-500 mb-1 block">컨셉 이름 (최대 10자)</label>
                                <input
                                    value={conceptLabel}
                                    onChange={(e) => setConceptLabel(e.target.value.slice(0, 10))}
                                    placeholder="예: 인어공주"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                                />
                            </div>
                            <div>
                                <label className="text-[12px] font-bold text-gray-500 mb-1 block">무드/키워드 (최대 100자)</label>
                                <input
                                    value={conceptMood}
                                    onChange={(e) => setConceptMood(e.target.value.slice(0, 100))}
                                    placeholder="예: 파란색 비늘, 진주 장식, 물결 느낌"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                                />
                            </div>
                        </div>
                        <button
                            onClick={saveConcept}
                            disabled={!conceptLabel.trim()}
                            className="w-full mt-5 py-3 bg-black text-white text-[14px] font-bold rounded-xl hover:opacity-90 disabled:opacity-40"
                        >
                            {editingConcept ? "수정 완료" : "저장"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
