"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import CheeringBadge from "@/components/CheeringBadge";
import AdBanner from "@/components/ads/AdBanner";
import { useAuth } from "@/context/AuthContext";

interface Design {
    id: string;
    imageUrls?: { url: string }[];
    imageUrl?: string;
    likeCount: number;
    ownerHandle: string;
    concept: string;
    groupTag?: string | null;
    boostCount?: number;
}

interface PopularTag {
    displayName: string;
    count: number;
}

type SortType = "popular" | "newest";

const CONCEPT_FILTERS = [
    { label: "#미래지향적", concept: "미래지향적" },
    { label: "#Y2K", concept: "Y2K" },
    { label: "#하이틴", concept: "하이틴" },
    { label: "#섹시", concept: "섹시" },
    { label: "#수트", concept: "수트" },
    { label: "#스트릿", concept: "스트릿" },
    { label: "#걸크러쉬", concept: "걸크러쉬" },
];

const GALLERY_AD_FREQUENCY = 8;
const GALLERY_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_GALLERY || "demo-gallery-slot";

export default function GalleryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <GalleryContent />
        </Suspense>
    );
}

function GalleryContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeTab, setActiveTab] = useState<SortType>("popular");
    const [activeConceptFilter, setActiveConceptFilter] = useState<string | null>(null);
    const [activeGroupFilter, setActiveGroupFilter] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [isFilterReady, setIsFilterReady] = useState(false);
    const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
    const observerRef = useRef<HTMLDivElement>(null);

    // Popular group tags
    const [popularTags, setPopularTags] = useState<PopularTag[]>([]);

    // Search
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<PopularTag[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const groupTag = searchParams.get("groupTag");
        setActiveGroupFilter(groupTag || null);
        setIsFilterReady(true);
    }, [searchParams]);

    // Fetch popular group tags on mount
    useEffect(() => {
        async function fetchPopularTags() {
            try {
                const res = await fetch("/api/tags/popular?limit=10");
                const data = await res.json();
                setPopularTags(data.tags || []);
            } catch {
                // silent
            }
        }
        fetchPopularTags();
    }, []);

    // Search autocomplete
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.trim().length < 1) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/tags/search?q=${encodeURIComponent(searchQuery.trim())}&limit=7`);
                const data = await res.json();
                setSearchResults(data.tags || []);
            } catch {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchDesigns = useCallback(
        async (cursor?: string | null) => {
            const isInitial = !cursor;
            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            try {
                const params = new URLSearchParams({ sort: activeTab });
                if (activeConceptFilter) params.set("concept", activeConceptFilter);
                if (activeGroupFilter) params.set("groupTag", activeGroupFilter);
                if (cursor) params.set("cursor", cursor);

                const res = await fetch(`/api/gallery?${params}`);
                const data = await res.json();
                const fetched: Design[] = data.designs || [];

                if (isInitial) {
                    setDesigns(fetched);
                } else {
                    setDesigns((prev) => [...prev, ...fetched]);
                }
                setNextCursor(data.nextCursor || null);
                setHasMore(data.hasMore || false);
            } catch (error) {
                console.error("Failed to fetch gallery:", error);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [activeTab, activeConceptFilter, activeGroupFilter]
    );

    // Initial fetch & refetch on tab/filter change
    useEffect(() => {
        if (!isFilterReady) return;
        fetchDesigns();
    }, [fetchDesigns, isFilterReady]);

    // Infinite scroll observer
    useEffect(() => {
        if (!observerRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    fetchDesigns(nextCursor);
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, nextCursor, fetchDesigns]);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    const handleTabChange = (tab: SortType) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        setDesigns([]);
        setNextCursor(null);
        scrollToTop();
    };

    const handleConceptFilterToggle = (concept: string) => {
        setActiveConceptFilter((prev) => (prev === concept ? null : concept));
        setDesigns([]);
        setNextCursor(null);
        scrollToTop();
    };

    const handleGroupFilterToggle = (groupTag: string) => {
        setActiveGroupFilter(groupTag);
        setDesigns([]);
        setNextCursor(null);
        scrollToTop();
    };

    const handleSearchSelect = (tagName: string) => {
        setSearchQuery("");
        setShowSearch(false);
        setShowSearchResults(false);
        handleGroupFilterToggle(tagName);
    };

    const clearAllFilters = () => {
        setActiveConceptFilter(null);
        setActiveGroupFilter(null);
        setDesigns([]);
        setNextCursor(null);
    };

    const handleLike = async (e: React.MouseEvent, designId: string) => {
        e.preventDefault();
        e.stopPropagation();

        const wasLiked = likedSet.has(designId);

        // Optimistic UI update
        setLikedSet((prev) => {
            const next = new Set(prev);
            if (wasLiked) next.delete(designId);
            else next.add(designId);
            return next;
        });
        setDesigns((prev) =>
            prev.map((d) =>
                d.id === designId
                    ? { ...d, likeCount: d.likeCount + (wasLiked ? -1 : 1) }
                    : d
            )
        );

        try {
            await fetch(`/api/like/${designId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user?.uid || "" }),
            });
        } catch {
            // Revert on failure
            setLikedSet((prev) => {
                const next = new Set(prev);
                if (wasLiked) next.add(designId);
                else next.delete(designId);
                return next;
            });
            setDesigns((prev) =>
                prev.map((d) =>
                    d.id === designId
                        ? { ...d, likeCount: d.likeCount + (wasLiked ? 1 : -1) }
                        : d
                )
            );
        }
    };

    const hasActiveFilters = activeConceptFilter || activeGroupFilter;

    return (
        <div className="bg-white text-black antialiased pb-24 min-h-screen font-korean">
            <Header
                pageTitle="스타일 픽"
                subtitle="마음에 드는 스타일에 투표하고, 슈퍼스타를 선물하세요"
                tabs={
                    <div className="flex items-center justify-between">
                        <div className="flex gap-7">
                            <button
                                onClick={() => handleTabChange("popular")}
                                className={`pb-3 text-[15px] font-bold transition-colors ${activeTab === "popular" ? "text-black border-b-2 border-black" : "text-gray-400 hover:text-black"}`}
                            >
                                추천
                            </button>
                            <button
                                onClick={() => handleTabChange("newest")}
                                className={`pb-3 text-[15px] font-bold transition-colors ${activeTab === "newest" ? "text-black border-b-2 border-black" : "text-gray-400 hover:text-black"}`}
                            >
                                최신
                            </button>
                            <button
                                className="pb-3 text-[15px] font-medium text-gray-300 cursor-not-allowed"
                            >
                                팔로잉
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setShowSearch((prev) => !prev);
                                if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 100);
                            }}
                            className="flex items-center gap-1.5 text-[13px] font-medium bg-gray-50 border border-gray-100 px-3.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">search</span>
                            검색
                        </button>
                    </div>
                }
                stickyTabs
                hideSearch
            />

            <main className="max-w-md mx-auto pt-2 px-5 space-y-4">
                {/* Search bar (expandable) */}
                {showSearch && (
                    <section className="relative">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">search</span>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSearchResults(true);
                                }}
                                onFocus={() => setShowSearchResults(true)}
                                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                                placeholder="그룹 이름으로 검색..."
                                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    aria-label="검색어 지우기"
                                >
                                    <span className="material-symbols-outlined text-[18px] text-gray-400">close</span>
                                </button>
                            )}
                        </div>
                        {/* Search autocomplete dropdown */}
                        {showSearchResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                                {searchResults.map((tag) => (
                                    <button
                                        key={tag.displayName}
                                        onMouseDown={() => handleSearchSelect(tag.displayName)}
                                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-sm font-semibold text-black">#{tag.displayName}</span>
                                        <span className="text-[11px] text-gray-400">{tag.count}개 디자인</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Popular group tags */}
                {popularTags.length > 0 && (
                    <section className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-bold text-gray-400">인기 그룹</span>
                        </div>
                        <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
                            <div className="flex gap-2 w-max">
                                {popularTags.map((tag) => (
                                    <button
                                        key={tag.displayName}
                                        onClick={() => handleGroupFilterToggle(tag.displayName)}
                                        className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeGroupFilter === tag.displayName
                                            ? "bg-black text-white"
                                            : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-black"
                                            }`}
                                    >
                                        <span>#{tag.displayName}</span>
                                        <span className={`text-[10px] ${activeGroupFilter === tag.displayName ? "text-white/60" : "text-gray-400"}`}>{tag.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Concept filters */}
                <section className="overflow-x-auto no-scrollbar -mx-5 px-5">
                    <div className="flex gap-2 w-max">
                        {CONCEPT_FILTERS.map((filter) => (
                            <button
                                key={filter.concept}
                                onClick={() => handleConceptFilterToggle(filter.concept)}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${activeConceptFilter === filter.concept
                                    ? "bg-black text-white"
                                    : "bg-white border border-gray-200 text-gray-600 hover:border-black"
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Active filter indicator */}
                {hasActiveFilters && (
                    <section className="flex items-center gap-2 flex-wrap">
                        {activeGroupFilter && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[11px] font-bold rounded-full">
                                #{activeGroupFilter}
                                <button onClick={() => { setActiveGroupFilter(null); setDesigns([]); setNextCursor(null); }} aria-label="그룹 필터 해제">
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                            </span>
                        )}
                        {activeConceptFilter && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-black text-[11px] font-bold rounded-full">
                                {activeConceptFilter}
                                <button onClick={() => { setActiveConceptFilter(null); setDesigns([]); setNextCursor(null); }} aria-label="컨셉 필터 해제">
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                            </span>
                        )}
                        <button
                            onClick={clearAllFilters}
                            className="text-[11px] text-gray-400 font-medium hover:text-black transition-colors"
                        >
                            전체 해제
                        </button>
                    </section>
                )}

                {/* Design grid */}
                <section className="grid grid-cols-2 gap-4 pb-8">
                    {loading ? (
                        <div className="col-span-2 flex justify-center py-20">
                            <div className="w-5 h-5 border-2 border-gray-100 border-t-black rounded-full animate-spin"></div>
                        </div>
                    ) : designs.length > 0 ? (
                        designs.flatMap((design, index) => {
                            const imgSrc = design.imageUrls?.[0]?.url || design.imageUrl || "/images/placeholder.png";
                            const isLiked = likedSet.has(design.id);
                            const card = (
                                <Link key={design.id} href={`/design/${design.id}`} className="group relative block">
                                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                                        <Image
                                            src={imgSrc}
                                            alt={`Design by ${design.ownerHandle}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                            unoptimized
                                        />
                                        {/* Group tag badge */}
                                        {design.groupTag && (
                                            <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] font-bold">
                                                #{design.groupTag}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2.5 px-0.5">
                                        <div className="flex justify-between items-start">
                                            <div className="overflow-hidden flex-1">
                                                <h3 className="text-[13px] font-bold text-black leading-tight truncate">{design.concept || "Stage Outfit"}</h3>
                                                {design.groupTag ? (
                                                    <CheeringBadge
                                                        userName={design.ownerHandle}
                                                        idolName={design.groupTag}
                                                        variant="card"
                                                    />
                                                ) : (
                                                    <p className="text-[11px] text-gray-400 mt-1 uppercase font-display tracking-wider truncate">@{design.ownerHandle}</p>
                                                )}
                                            </div>
                                            <button
                                                className="flex items-center gap-1 shrink-0 ml-1"
                                                onClick={(e) => handleLike(e, design.id)}
                                            >
                                                <span className={`material-symbols-outlined text-[16px] transition-colors ${isLiked ? "text-red-500" : "text-gray-300"}`}
                                                    style={isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                                >
                                                    favorite
                                                </span>
                                                <span className="text-[11px] text-gray-400 font-bold">{design.likeCount || 0}</span>
                                            </button>
                                            <div className="flex items-center gap-1 shrink-0 ml-2">
                                                <span className="material-symbols-outlined text-[16px] text-superstar">star</span>
                                                <span className="text-[11px] text-gray-400 font-bold">{design.boostCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );

                            const shouldInsertAd =
                                (index + 1) % GALLERY_AD_FREQUENCY === 0 &&
                                index !== designs.length - 1;

                            if (!shouldInsertAd) return [card];

                            return [
                                card,
                                <div key={`ad-${design.id}`} className="col-span-2 py-1">
                                    <AdBanner slot={GALLERY_AD_SLOT} className="rounded-xl border border-gray-100 p-2" />
                                </div>,
                            ];
                        })
                    ) : (
                        <div className="col-span-2 flex flex-col items-center text-center py-20 gap-4">
                            <span className="material-symbols-outlined text-[48px] text-gray-200">palette</span>
                            <p className="text-gray-400 text-sm">
                                {hasActiveFilters ? "필터에 맞는 디자인이 없습니다." : "아직 디자인이 없습니다."}
                            </p>
                            {hasActiveFilters ? (
                                <button
                                    onClick={clearAllFilters}
                                    className="px-6 py-2.5 bg-black text-white text-[13px] font-bold rounded-full"
                                >
                                    필터 해제하기
                                </button>
                            ) : (
                                <Link href="/studio" className="px-6 py-2.5 bg-black text-white text-[13px] font-bold rounded-full">
                                    메이킹 룸으로 이동
                                </Link>
                            )}
                        </div>
                    )}
                </section>

                {/* Infinite scroll trigger */}
                {hasMore && (
                    <div ref={observerRef} className="flex justify-center pb-12">
                        <div className="w-5 h-5 border-2 border-gray-100 border-t-black rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Loading more indicator */}
                {loadingMore && !hasMore && (
                    <div className="flex justify-center pb-12">
                        <div className="w-5 h-5 border-2 border-gray-100 border-t-black rounded-full animate-spin"></div>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
