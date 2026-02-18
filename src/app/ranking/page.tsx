"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface RankingDesign {
  rank: number;
  id: string;
  imageUrls?: { url: string; index?: number }[];
  imageUrl?: string;
  likeCount: number;
  boostCount: number;
  totalScore: number;
  ownerHandle?: string;
  concept?: string;
  groupTag?: string | null;
}

export default function RankingPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  const [designs, setDesigns] = useState<RankingDesign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/ranking?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setDesigns(data.rankings || []);
      })
      .catch(() => {
        if (!mounted) return;
        setDesigns([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [period]);

  const top1 = designs[0];
  const rest = designs.slice(1);

  return (
    <div className="bg-white text-black min-h-screen pb-24">
      <Header pageTitle="랭킹" subtitle="주간/월간 실시간 순위" />

      <main className="max-w-md mx-auto px-5 pt-2 space-y-5">
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("monthly")}
            className={`px-4 py-2 text-[13px] font-bold rounded-full transition-colors ${
              period === "monthly" ? "bg-black text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            월간
          </button>
          <button
            onClick={() => setPeriod("weekly")}
            className={`px-4 py-2 text-[13px] font-bold rounded-full transition-colors ${
              period === "weekly" ? "bg-black text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            주간
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-5 h-5 border-2 border-gray-100 border-t-black rounded-full animate-spin" />
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <span className="material-symbols-outlined text-4xl text-gray-200 mb-3 block">emoji_events</span>
            <p className="text-sm">아직 랭킹 데이터가 없습니다.</p>
          </div>
        ) : (
          <>
            {top1 && (
              <Link href={`/design/${top1.id}`} className="block relative rounded-2xl overflow-hidden bg-gray-100">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={top1.imageUrls?.[0]?.url || top1.imageUrl || "/images/placeholder.png"}
                    alt={`Rank 1 by ${top1.ownerHandle || "designer"}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 420px"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 bg-yellow-400 text-black px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1">
                    <span>👑</span> 1위
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/80 text-[11px] font-bold mb-1">@{top1.ownerHandle}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[12px] font-black text-white">점수 {top1.totalScore.toLocaleString()}</span>
                    </div>
                    {period === "monthly" && (
                      <p className="text-yellow-300 text-[11px] font-bold">이 디자인이 실제로 제작됩니다</p>
                    )}
                  </div>
                </div>
              </Link>
            )}

            <div className="space-y-1">
              {rest.map((design) => (
                <Link
                  key={design.id}
                  href={`/design/${design.id}`}
                  className="flex items-center gap-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors rounded-lg px-1"
                >
                  <div className="w-7 text-center font-black text-[14px] text-gray-300 shrink-0">{design.rank}</div>
                  <div className="relative w-14 h-[72px] rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={design.imageUrls?.[0]?.url || design.imageUrl || "/images/placeholder.png"}
                      alt={`Rank ${design.rank}`}
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-black truncate">@{design.ownerHandle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {design.groupTag && <span className="text-[10px] text-gray-400 font-bold">#{design.groupTag}</span>}
                      {design.concept && <span className="text-[10px] text-gray-400 font-medium">{design.concept}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[13px] font-black text-black">{design.totalScore.toLocaleString()}</span>
                    <p className="text-[9px] text-gray-400 font-medium">점수</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

