"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

interface GalleryDesign {
    id: string;
    imageUrls?: { url: string; index: number }[];
    imageUrl?: string;
    ownerHandle?: string;
    likeCount?: number;
    concept?: string;
}

export default function LandingPage() {
    const [bestPicks, setBestPicks] = useState<GalleryDesign[]>([]);

    useEffect(() => {
        fetch("/api/gallery?sort=popular")
            .then((res) => res.json())
            .then((data) => {
                if (data.designs) setBestPicks(data.designs.slice(0, 5));
            })
            .catch(() => {});
    }, []);

    const getImageUrl = (design: GalleryDesign) => {
        if (design.imageUrls && design.imageUrls.length > 0) return design.imageUrls[0].url;
        return design.imageUrl || "";
    };

    const formatCount = (n: number) => {
        if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
        return String(n);
    };

    const top1 = bestPicks[0];
    const runners = bestPicks.slice(1, 5);

    return (
        <div className="min-h-screen flex flex-col pb-24 bg-white font-display text-black">
            <Header />

            <main className="max-w-md mx-auto w-full pt-14">
                <section className="px-6 py-16 text-center bg-white relative">
                    <div className="relative z-10">
                        <div className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-[10px] font-black mb-6 tracking-widest uppercase">
                            ● Season 4 Active
                        </div>
                        <h1 className="text-4xl font-black tracking-tight mb-4 leading-tight font-display text-black">
                            당신의 <span className="text-primary">팬심</span>이<br />현실이 되는 곳
                        </h1>
                        <p className="text-sm text-gray-600 mb-10 max-w-[280px] mx-auto leading-relaxed">
                            내 최애를 위한 무대 의상을 디자인해보세요.<br />이번 달 투표 1위 디자인은 실제로 제작됩니다!
                        </p>
                        <Link href="/studio" className="w-full bg-black text-white py-4 px-6 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95">
                            <span className="material-symbols-outlined text-lg">edit</span>
                            지금 바로 디자인하기
                        </Link>
                    </div>
                </section>

                <section className="py-12 bg-white border-y border-gray-50">
                    <div className="px-6 flex justify-between items-end mb-6">
                        <h2 className="text-xl font-black font-display flex items-center gap-2 uppercase">
                            BEST PICKS
                        </h2>
                        <Link href="/gallery" className="text-xs text-gray-400 font-bold border-b border-gray-200">View All</Link>
                    </div>
                    <div className="px-6">
                        {/* 1st place */}
                        <Link
                            href={top1 ? `/design/${top1.id}` : "/gallery"}
                            className="relative w-full aspect-[4/3] bg-white rounded-xl overflow-hidden mb-6 border border-gray-100 shadow-sm block"
                        >
                            {top1 && getImageUrl(top1) ? (
                                <Image
                                    src={getImageUrl(top1)}
                                    alt="Best pick #1"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                    <span className="material-symbols-outlined text-4xl">image</span>
                                </div>
                            )}
                            <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 text-[11px] font-black rounded-full">1st</div>
                            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent text-white">
                                <h3 className="font-bold text-lg">{top1?.concept || "Best Design"}</h3>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-300 font-medium">By @{top1?.ownerHandle || "—"}</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm text-white" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                        <span className="text-xs font-bold">{top1 ? formatCount(top1.likeCount || 0) : "0"}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Runners up */}
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                            {runners.length > 0 ? runners.map((design, i) => (
                                <Link key={design.id} href={`/design/${design.id}`} className="min-w-[140px] flex-shrink-0">
                                    <div className="relative aspect-square bg-white rounded-lg overflow-hidden border border-gray-100 mb-2">
                                        {getImageUrl(design) ? (
                                            <Image
                                                src={getImageUrl(design)}
                                                alt={`Pick #${i + 2}`}
                                                fill
                                                className="object-cover"
                                                sizes="160px"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100"></div>
                                        )}
                                        <div className="absolute top-2 left-2 bg-gray-100 text-black px-2 py-0.5 text-[10px] font-bold rounded-full">
                                            {i === 0 ? "2nd" : i === 1 ? "3rd" : `${i + 2}th`}
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold truncate">{design.concept || "Design"}</p>
                                    <p className="text-[10px] text-gray-500">@{design.ownerHandle || "—"}</p>
                                </Link>
                            )) : (
                                <>
                                    <div className="min-w-[140px] flex-shrink-0">
                                        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-100 mb-2 flex items-center justify-center text-gray-300">
                                            <span className="material-symbols-outlined text-2xl">image</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-300">아직 디자인이 없어요</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <section className="py-20 px-6 bg-white">
                    <h2 className="text-2xl font-black mb-14 text-center font-display uppercase tracking-wider">어떻게 진행되나요?</h2>
                    <div className="max-w-[360px] mx-auto flex flex-col items-center">
                        {/* Step 1 */}
                        <div className="w-full bg-gray-50 rounded-2xl p-6 flex items-center gap-5 border border-gray-100">
                            <div className="w-14 h-14 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[28px]">edit_note</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-[15px] text-black leading-tight font-korean">프롬프트 입력</h3>
                                <p className="text-[12px] text-gray-400 leading-relaxed mt-1.5">원하는 스타일을 자유롭게 설명해주세요.</p>
                            </div>
                        </div>
                        {/* Arrow */}
                        <div className="py-3 text-gray-300">
                            <span className="material-symbols-outlined text-[22px]">arrow_downward</span>
                        </div>
                        {/* Step 2 */}
                        <div className="w-full bg-gray-50 rounded-2xl p-6 flex items-center gap-5 border border-gray-100">
                            <div className="w-14 h-14 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[28px]">auto_awesome</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-[15px] text-black leading-tight font-korean">AI 의상 생성</h3>
                                <p className="text-[12px] text-gray-400 leading-relaxed mt-1.5">패션 전문 AI가 10초만에 의상을 제안합니다.</p>
                            </div>
                        </div>
                        {/* Arrow */}
                        <div className="py-3 text-gray-300">
                            <span className="material-symbols-outlined text-[22px]">arrow_downward</span>
                        </div>
                        {/* Step 3 */}
                        <div className="w-full bg-gray-50 rounded-2xl p-6 flex items-center gap-5 border border-gray-100">
                            <div className="w-14 h-14 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[28px]">how_to_vote</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-[15px] text-black leading-tight font-korean">커뮤니티 투표</h3>
                                <p className="text-[12px] text-gray-400 leading-relaxed mt-1.5">최고의 룩을 공유하고 팬 투표로 랭킹이 결정됩니다.</p>
                            </div>
                        </div>
                        {/* Arrow */}
                        <div className="py-3 text-vibrant-cyan">
                            <span className="material-symbols-outlined text-[22px]">arrow_downward</span>
                        </div>
                        {/* Step 4 - Highlighted */}
                        <div className="w-full bg-gradient-to-br from-vibrant-cyan/10 to-vibrant-cyan/5 rounded-2xl p-6 flex items-center gap-5 border border-vibrant-cyan/20">
                            <div className="w-14 h-14 rounded-xl bg-vibrant-cyan text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,229,255,0.3)]">
                                <span className="material-symbols-outlined text-[28px]">emoji_events</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-[15px] text-vibrant-cyan leading-tight font-korean">실제 의상 제작</h3>
                                <p className="text-[12px] text-gray-400 leading-relaxed mt-1.5">1위 디자인은 실제로 제작되어 전달됩니다.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="py-12 px-6 border-t border-gray-100 text-center bg-white mb-10">
                    <p className="text-xs text-black mb-6 font-display font-black uppercase tracking-[0.3em] italic">MY-STYLE.AI</p>
                    <div className="flex justify-center gap-6 mb-8">
                        <Link href="#" className="text-[10px] text-gray-400 font-bold uppercase hover:text-black">About</Link>
                        <Link href="/gallery" className="text-[10px] text-gray-400 font-bold uppercase hover:text-black">Gallery</Link>
                        <Link href="#" className="text-[10px] text-gray-400 font-bold uppercase hover:text-black">Social</Link>
                    </div>
                    <p className="text-[9px] text-gray-300 font-medium">© 2024 MY-STYLE.AI. All rights reserved.</p>
                </footer>
            </main>

            <BottomNav />
        </div>
    );
}
