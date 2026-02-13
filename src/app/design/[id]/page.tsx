"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";

interface DesignDetail {
  id: string;
  ownerUid: string;
  ownerHandle: string;
  concept: string;
  imageUrls?: { url: string; index?: number }[];
  representativeIndex?: number;
  likeCount: number;
  boostCount: number;
  publishedAt?: { seconds: number };
  createdAt?: { seconds: number };
}

interface RelatedDesign {
  id: string;
  imageUrls?: { url: string }[];
}

export default function DesignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [design, setDesign] = useState<DesignDetail | null>(null);
  const [creatorDesigns, setCreatorDesigns] = useState<RelatedDesign[]>([]);
  const [recommended, setRecommended] = useState<RelatedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showSuperstarOverlay, setShowSuperstarOverlay] = useState(false);

  const designId = params.id as string;

  useEffect(() => {
    async function fetchDesign() {
      try {
        const res = await fetch(`/api/designs/${designId}`);
        if (!res.ok) {
          router.push("/gallery");
          return;
        }
        const data = await res.json();
        setDesign(data.design);
        setLikeCount(data.design.likeCount || 0);
        setCreatorDesigns(data.creatorDesigns || []);
        setRecommended(data.recommended || []);
      } catch (error) {
        console.error("Failed to fetch design:", error);
      } finally {
        setLoading(false);
      }
    }
    if (designId) fetchDesign();
  }, [designId, router]);

  const handleLike = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`/api/like/${designId}`, { method: "POST" });
      if (res.ok) {
        setLiked(!liked);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Like failed:", error);
    }
  };

  const handleSuperstar = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setShowSuperstarOverlay(true);
  };

  const getTimeAgo = (timestamp?: { seconds: number }) => {
    if (!timestamp) return "";
    const diff = Date.now() / 1000 - timestamp.seconds;
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
    return new Date(timestamp.seconds * 1000).toLocaleDateString("ko-KR");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-5 h-5 border-2 border-gray-100 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-gray-400">
        디자인을 찾을 수 없습니다.
      </div>
    );
  }

  const heroImage =
    design.imageUrls?.[design.representativeIndex || 0]?.url ||
    design.imageUrls?.[0]?.url ||
    "/images/placeholder.png";

  return (
    <div className="bg-white text-black antialiased font-display min-h-screen pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-[20px] border-b border-black/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-1 -ml-1" aria-label="뒤로">
            <span className="material-symbols-outlined text-[28px]">chevron_left</span>
          </button>
          <h1 className="text-sm font-bold tracking-[0.1em] font-display uppercase">
            MY-STYLE.AI
          </h1>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="p-2" aria-label="검색">
            <span className="material-symbols-outlined text-[24px]">search</span>
          </button>
          <button className="p-2 relative" aria-label="알림">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 ml-1 text-primary" aria-label="공유">
            <span className="material-symbols-outlined text-[24px]">ios_share</span>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto pt-14 pb-8">
        {/* Hero Image */}
        <section className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50">
          <Image src={heroImage} alt={design.concept || "Design"} fill className="object-cover" sizes="100vw" priority />
          <div className="absolute bottom-4 left-4">
            <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
              PREMIUM STUDIO
            </span>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="px-5 py-5 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex-1 h-14 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform ${
                liked ? "bg-red-500 text-white" : "bg-black text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">favorite</span>
              <span className="font-bold text-[15px]">좋아요</span>
            </button>
            <button
              onClick={handleSuperstar}
              className="flex-[1.2] h-14 border-2 border-superstar bg-white text-superstar rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform relative"
            >
              <span className="material-symbols-outlined text-[22px]">star</span>
              <span className="font-bold text-[15px]">슈퍼스타</span>
              {design.boostCount > 0 && (
                <div className="ml-1 px-2 py-0.5 bg-superstar text-white text-[10px] font-bold rounded-full shadow-[0_0_10px_rgba(157,80,255,0.4)]">
                  {design.boostCount}
                </div>
              )}
            </button>
          </div>
          <button className="w-full h-12 border border-gray-200 bg-white text-gray-700 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[20px]">ios_share</span>
            <span className="font-bold text-[14px]">공유하기</span>
          </button>
        </section>

        {/* Design Info */}
        <section className="px-5 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold tracking-tight leading-tight font-korean">
                {design.concept || "Stage Outfit"}
              </h2>
              <span className="text-[11px] text-gray-400 mt-2 font-medium whitespace-nowrap">
                {getTimeAgo(design.publishedAt || design.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                <span className="text-[10px] font-bold text-white font-display">
                  {(design.ownerHandle || "A")[0].toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">@{design.ownerHandle}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-4 pb-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px] text-gray-400">favorite</span>
              <span className="text-sm font-semibold text-gray-800">{likeCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px] text-gray-400">visibility</span>
              <span className="text-sm font-semibold text-gray-800">0</span>
            </div>
            <div className="ml-auto">
              <button className="p-1" aria-label="북마크">
                <span className="material-symbols-outlined text-[22px] text-gray-400">bookmark</span>
              </button>
            </div>
          </div>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-black font-bold text-sm">#KPOP</span>
            <span className="text-black font-bold text-sm">#스테이지수트</span>
            <span className="text-black font-bold text-sm">#아이돌패션</span>
            {design.concept && (
              <span className="text-black font-bold text-sm">#{design.concept.replace(/\s+/g, "")}</span>
            )}
          </div>
        </section>

        {/* Creator's Other Designs */}
        {creatorDesigns.length > 0 && (
          <section className="mt-12">
            <div className="px-5 flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-black uppercase tracking-wider">크리에이터의 다른 디자인</h3>
              <span className="material-symbols-outlined text-gray-400 text-sm">arrow_forward</span>
            </div>
            <div className="flex overflow-x-auto gap-3 px-5 no-scrollbar pb-4">
              {creatorDesigns.map((d) => (
                <Link key={d.id} href={`/design/${d.id}`} className="flex-none w-40 aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden relative">
                  <Image
                    src={d.imageUrls?.[0]?.url || "/images/placeholder.png"}
                    alt="Other design"
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Styles */}
        {recommended.length > 0 && (
          <section className="px-5 mt-8 pb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">추천 스타일</h3>
            <div className="grid grid-cols-3 gap-2">
              {recommended.map((d) => (
                <Link key={d.id} href={`/design/${d.id}`} className="aspect-square bg-slate-50 rounded-lg overflow-hidden border border-gray-100">
                  <Image
                    src={d.imageUrls?.[0]?.url || "/images/placeholder.png"}
                    alt="Recommended"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />

      {/* Superstar Celebration Overlay */}
      {showSuperstarOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-md">
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, rgba(157, 80, 255, 0.15) 0%, transparent 70%)" }}></div>
          <div className="relative flex flex-col items-center text-center px-8">
            <div className="w-24 h-24 bg-superstar rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(157,80,255,0.4)]">
              <span className="material-symbols-outlined text-white text-[48px]">star</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight font-korean">슈퍼스타를 보냈습니다!</h2>
            <p className="text-gray-500 text-[15px] leading-relaxed font-korean">
              @{design.ownerHandle} 님에게<br />팬심이 전달되었습니다.
            </p>
            <button
              onClick={() => setShowSuperstarOverlay(false)}
              className="mt-10 w-full max-w-[280px] py-4 bg-black text-white rounded-full font-bold text-sm tracking-wider font-korean"
            >
              확인
            </button>
            <p className="mt-4 text-[11px] text-superstar font-bold tracking-[0.2em] uppercase">MYSTYLE AI PREMIUM</p>
          </div>
        </div>
      )}
    </div>
  );
}
