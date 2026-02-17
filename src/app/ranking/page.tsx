"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

interface Design {
    id: string;
    imageUrls?: { url: string }[];
    imageUrl?: string;
    likeCount: number;
    ownerHandle: string;
    concept: string;
    boostCount?: number;
    totalScore?: number;
    rank?: number;
}

export default function RankingPage() {
    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRanking() {
            try {
                const res = await fetch("/api/ranking");
                const data = await res.json();
                setDesigns(data.rankings || []);
            } catch (error) {
                console.error("Failed to fetch ranking:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchRanking();
    }, []);

    return (
        <div className="bg-white text-black font-display min-h-screen pb-24 relative">
            <Header
                pageTitle="명예의 전당"
                tabs={
                    <div className="flex gap-6 overflow-x-auto no-scrollbar">
                        <button className="pb-3 text-[15px] font-bold text-black border-b-2 border-black whitespace-nowrap">주간 베스트</button>
                        <button className="pb-3 text-[15px] font-medium text-gray-400 whitespace-nowrap">월간 베스트</button>
                        <button className="pb-3 text-[15px] font-medium text-gray-400 whitespace-nowrap">명예의 전당</button>
                    </div>
                }
            />

            <main className="max-w-md mx-auto pt-2 px-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-5 h-5 border-2 border-gray-100 border-t-black rounded-full animate-spin"></div>
                    </div>
                ) : designs.length > 0 ? (
                    <div className="space-y-6">
                        {designs.map((design, index) => {
                            const imgSrc = design.imageUrls?.[0]?.url || design.imageUrl || "/images/placeholder.png";
                            return (
                                <Link key={design.id} href={`/design/${design.id}`} className="flex items-center gap-4 group">
                                    <div className={`w-6 text-center font-black text-lg ${index < 3 ? 'text-primary' : 'text-gray-300'}`}>
                                        {index + 1}
                                    </div>
                                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <Image src={imgSrc} alt={`Design by ${design.ownerHandle}`} fill className="object-cover" unoptimized />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[14px] font-bold text-black truncate group-hover:text-primary transition-colors">{design.concept || "Stage Outfit"}</h3>
                                        <p className="text-[12px] text-gray-400 mt-0.5">@{design.ownerHandle}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px] text-red-500 fill-current">favorite</span>
                                                <span className="text-[12px] font-bold text-gray-600">{design.likeCount || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px] text-superstar">star</span>
                                                <span className="text-[12px] font-bold text-gray-600">{design.boostCount || 0}</span>
                                            </div>
                                            <span className="text-[11px] font-black text-black">
                                                점수 {(design.totalScore || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-20">
                        <span className="material-symbols-outlined text-4xl text-gray-200 mb-4 block">emoji_events</span>
                        아직 랭킹 데이터가 없습니다.
                    </div>
                )}

                <footer className="mt-12 border-t border-gray-100 pt-6 pb-8 text-center">
                    <p className="text-[11px] text-gray-400 font-medium">랭킹 점수 = 좋아요 + (슈퍼스타 × 10)</p>
                    <p className="text-[10px] text-gray-300 mt-1">슈퍼스타는 계정당 주 1회 사용 가능합니다.</p>
                </footer>
            </main>

            <BottomNav />
        </div>
    );
}
