"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

interface Design {
    id: string;
    imageUrls?: { url: string }[];
    imageUrl?: string;
    likeCount: number;
    ownerHandle: string;
    concept: string;
    boostCount?: number;
}

type SortType = "popular" | "newest";

const HASHTAG_FILTERS = [
    { label: "#아이브_스타일", concept: "아이브" },
    { label: "#Y2K패션", concept: "Y2K" },
    { label: "#무대의상", concept: "무대의상" },
    { label: "#공항패션", concept: "공항패션" },
    { label: "#스트릿", concept: "스트릿" },
];

export default function GalleryPage() {
    const { user } = useAuth();
    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeTab, setActiveTab] = useState<SortType>("popular");
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
    const observerRef = useRef<HTMLDivElement>(null);

    const fetchDesigns = useCallback(
        async (cursor?: string | null) => {
            const isInitial = !cursor;
            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            try {
                const params = new URLSearchParams({ sort: activeTab });
                if (activeFilter) params.set("concept", activeFilter);
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
        [activeTab, activeFilter]
    );

    // Initial fetch & refetch on tab/filter change
    useEffect(() => {
        fetchDesigns();
    }, [fetchDesigns]);

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

    const handleTabChange = (tab: SortType) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        setDesigns([]);
        setNextCursor(null);
    };

    const handleFilterToggle = (concept: string) => {
        setActiveFilter((prev) => (prev === concept ? null : concept));
        setDesigns([]);
        setNextCursor(null);
    };

    const handleLike = async (e: React.MouseEvent, designId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) return;

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
                body: JSON.stringify({ uid: user.uid }),
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

    return (
        <div className="bg-white text-black antialiased pb-24 min-h-screen font-korean">
            <Header
                pageTitle="갤러리"
                rightSlot={
                    <button className="flex items-center gap-1.5 text-[13px] font-medium bg-gray-50 border border-gray-100 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">tune</span>
                        필터
                    </button>
                }
                tabs={
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
                }
            />

            <main className="max-w-md mx-auto pt-[190px] px-5 space-y-6">
                {/* Hashtag filters */}
                <section className="overflow-x-auto no-scrollbar -mx-5 px-5">
                    <div className="flex gap-2 w-max">
                        {HASHTAG_FILTERS.map((filter) => (
                            <button
                                key={filter.concept}
                                onClick={() => handleFilterToggle(filter.concept)}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                                    activeFilter === filter.concept
                                        ? "bg-black text-white"
                                        : "bg-white border border-gray-200 text-gray-600 hover:border-black"
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Design grid */}
                <section className="grid grid-cols-2 gap-4 pb-8">
                    {loading ? (
                        <div className="col-span-2 flex justify-center py-20">
                            <div className="w-5 h-5 border-2 border-gray-100 border-t-black rounded-full animate-spin"></div>
                        </div>
                    ) : designs.length > 0 ? (
                        designs.map((design) => {
                            const imgSrc = design.imageUrls?.[0]?.url || design.imageUrl || "/images/placeholder.png";
                            const isLiked = likedSet.has(design.id);
                            return (
                                <Link key={design.id} href={`/design/${design.id}`} className="group relative block">
                                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                                        <Image
                                            src={imgSrc}
                                            alt={`Design by ${design.ownerHandle}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <button
                                            className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={(e) => handleLike(e, design.id)}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">favorite</span>
                                        </button>
                                    </div>
                                    <div className="mt-2.5 flex justify-between items-start px-0.5">
                                        <div className="overflow-hidden">
                                            <h3 className="text-[13px] font-bold text-black leading-tight truncate">{design.concept || "Stage Outfit"}</h3>
                                            <p className="text-[11px] text-gray-400 mt-1 uppercase font-display tracking-wider truncate">@{design.ownerHandle}</p>
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
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-2 flex flex-col items-center text-center py-20 gap-4">
                            <span className="material-symbols-outlined text-[48px] text-gray-200">palette</span>
                            <p className="text-gray-400 text-sm">아직 디자인이 없습니다.</p>
                            <Link href="/studio" className="px-6 py-2.5 bg-black text-white text-[13px] font-bold rounded-full">
                                첫 디자인 만들기
                            </Link>
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
