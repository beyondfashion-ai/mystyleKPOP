"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import CheeringBadge from "@/components/CheeringBadge";
import { useAuth } from "@/context/AuthContext";
import StylistFeedbackCard from "@/components/StylistFeedbackCard";
import type { StylistFeedback } from "@/lib/stylist-personas";

interface DesignDetail {
  id: string;
  ownerUid: string;
  ownerHandle: string;
  concept: string;
  groupTag?: string | null;
  imageUrls?: { url: string; index?: number }[];
  representativeIndex?: number;
  likeCount: number;
  boostCount: number;
  publishedAt?: { seconds: number };
  createdAt?: { seconds: number };
  stylistFeedbacks?: StylistFeedback[];
  selectedStylistId?: string | null;
}

interface RelatedDesign {
  id: string;
  imageUrls?: { url: string }[];
  likeCount?: number;
  boostCount?: number;
}

interface DesignComment {
  id: string;
  designId: string;
  content: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string | null;
  isAdmin: boolean;
  createdAt?: { _seconds?: number; seconds?: number };
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
  const [boosted, setBoosted] = useState(false);
  const [boostCount, setBoostCount] = useState(0);
  const [myBoostCount, setMyBoostCount] = useState(0);
  const [canBoost, setCanBoost] = useState(true);
  const [nextBoostAt, setNextBoostAt] = useState<string | null>(null);
  const [isBoostSubmitting, setIsBoostSubmitting] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showSuperstarOverlay, setShowSuperstarOverlay] = useState(false);
  const [showSuperstarInfo, setShowSuperstarInfo] = useState(false);
  const [showBoostCooldownModal, setShowBoostCooldownModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [comments, setComments] = useState<DesignComment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const designId = params.id as string;

  // Fetch design data
  useEffect(() => {
    async function fetchDesign() {
      try {
        const [designRes, commentRes] = await Promise.all([
          fetch(`/api/designs/${designId}`),
          fetch(`/api/designs/${designId}/comments`),
        ]);

        if (!designRes.ok) {
          router.push("/gallery");
          return;
        }

        const data = await designRes.json();
        setDesign(data.design);
        setLikeCount(data.design.likeCount || 0);
        setBoostCount(data.design.boostCount || 0);
        setCreatorDesigns(data.creatorDesigns || []);
        setRecommended(data.recommended || []);

        if (commentRes.ok) {
          const commentData = await commentRes.json();
          setComments(commentData.comments || []);
          setCommentCount(commentData.commentCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch design:", error);
      } finally {
        setLoading(false);
      }
    }
    if (designId) fetchDesign();
  }, [designId, router]);

  // Check initial like & boost status (like works with IP fallback, boost needs auth)
  useEffect(() => {
    if (!designId) return;
    // Like: always check (server uses IP if no uid)
    const likeParams = user?.uid ? `?uid=${user.uid}` : "";
    fetch(`/api/like/${designId}${likeParams}`)
      .then((r) => r.json())
      .then((d) => setLiked(d.liked))
      .catch(() => {});
    // Boost: only check if logged in
    if (user?.uid) {
      fetch(`/api/boost/${designId}?uid=${user.uid}`)
        .then((r) => r.json())
        .then((d) => {
          setBoosted(Boolean(d.boosted));
          setMyBoostCount(Number(d.userBoostCount || 0));
          setCanBoost(Boolean(d.canBoost));
          setNextBoostAt(d.nextAvailableAt || null);
        })
        .catch(() => {});
    }
  }, [user?.uid, designId]);

  const toast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((prev) => prev + (wasLiked ? -1 : 1));
    try {
      const res = await fetch(`/api/like/${designId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user?.uid || "" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      setLiked(wasLiked);
      setLikeCount((prev) => prev + (wasLiked ? 1 : -1));
    }
  };

  const handleSuperstar = async () => {
    if (!user) {
      setShowSuperstarInfo(true);
      return;
    }
    if (isBoostSubmitting) return;
    if (!canBoost) {
      setShowBoostCooldownModal(true);
      return;
    }

    setIsBoostSubmitting(true);
    try {
      const res = await fetch(`/api/boost/${designId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "BOOST_COOLDOWN") {
          setCanBoost(false);
          setNextBoostAt(data.nextAvailableAt || null);
          toast("슈퍼스타는 계정당 주 1회만 가능해요");
          return;
        }
        throw new Error();
      }
      setBoosted(Boolean(data.boosted));
      setBoostCount(Number(data.boostCount || 0));
      setMyBoostCount(Number(data.userBoostCount || 0));
      setCanBoost(Boolean(data.canBoost));
      setNextBoostAt(data.nextAvailableAt || null);
      setShowSuperstarOverlay(true);
    } catch {
      toast("슈퍼스타 전송에 실패했어요");
    } finally {
      setIsBoostSubmitting(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/design/${designId}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShareX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent("이 K-POP 무대의상 어때요? 👀 #MyStyleAI")}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const handleShareKakao = () => {
    window.open(
      `https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const handleBookmark = () => {
    setBookmarked((prev) => !prev);
    toast(bookmarked ? "북마크 해제됨" : "북마크에 저장됨");
  };

  const getTimeAgo = (timestamp?: { seconds: number }) => {
    if (!timestamp) return "";
    const seconds = timestamp.seconds;
    const diff = Date.now() / 1000 - seconds;
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
    return new Date(seconds * 1000).toLocaleDateString("ko-KR");
  };

  const getCommentTimeAgo = (timestamp?: { _seconds?: number; seconds?: number }) => {
    if (!timestamp) return "";
    const seconds = timestamp._seconds || timestamp.seconds || 0;
    if (!seconds) return "";
    return getTimeAgo({ seconds });
  };

  const formatNextBoostAt = (value: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("ko-KR", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);

    try {
      const res = await fetch(`/api/designs/${designId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
          uid: user?.uid,
          displayName: user?.displayName || "익명",
          photoURL: user?.photoURL || null,
        }),
      });

      if (!res.ok) throw new Error("댓글 등록 실패");

      const refreshRes = await fetch(`/api/designs/${designId}/comments`);
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setComments(refreshData.comments || []);
        setCommentCount(refreshData.commentCount || 0);
      }

      setNewComment("");
      toast("댓글이 등록되었어요");
    } catch (error) {
      console.error(error);
      toast("댓글 등록에 실패했어요");
    } finally {
      setIsSubmittingComment(false);
    }
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
      {/* Header — matches shared Header style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl">
        <div className="max-w-md mx-auto px-4 pt-safe-top">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button onClick={() => router.back()} className="p-1 -ml-1" aria-label="뒤로">
                <span className="material-symbols-outlined text-[26px] text-gray-900 font-light">chevron_left</span>
              </button>
              <Link href="/" className="text-sm font-extrabold tracking-tighter font-display uppercase">
                MY-STYLE.AI
              </Link>
            </div>
            <div className="flex items-center gap-5">
              <button className="flex items-center justify-center" aria-label="검색">
                <span className="material-symbols-outlined text-[22px] text-gray-900 font-light">search</span>
              </button>
              <button className="flex items-center justify-center relative" aria-label="알림">
                <span className="material-symbols-outlined text-[22px] text-gray-900 font-light">notifications</span>
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto pt-14 pb-8">
        {/* Hero Image — card/frame style */}
        <section className="px-4 pt-4 pb-2">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <Image src={heroImage} alt={design.concept || "Design"} fill className="object-cover" sizes="100vw" priority unoptimized />
            <div className="absolute bottom-4 left-4">
              <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                PREMIUM STUDIO
              </span>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="px-5 py-5 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex-[0.92] h-[52px] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all border ${liked
                ? "border-red-200 bg-red-50 text-red-500"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                favorite
              </span>
              <span className="font-bold text-[14px]">{likeCount > 0 ? likeCount.toLocaleString() : "좋아요"}</span>
            </button>
            <button
              onClick={handleSuperstar}
              disabled={isBoostSubmitting}
              className={`relative flex-[1.45] h-14 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all border ${boosted
                ? "border-transparent bg-gradient-to-r from-[#7b3cff] via-[#9d50ff] to-[#c26dff] text-white shadow-[0_10px_24px_rgba(157,80,255,0.45)]"
                : "border-[#9d50ff] bg-gradient-to-r from-[#f7f1ff] to-[#f2e7ff] text-[#7e3af2] shadow-[0_8px_20px_rgba(157,80,255,0.22)] hover:shadow-[0_10px_24px_rgba(157,80,255,0.28)]"
                } ${!canBoost ? "opacity-60" : ""} disabled:opacity-60`}
            >
              {!boosted && (
                <span className="absolute right-2 top-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white/80 text-[#7e3af2] border border-[#e9d8ff]">
                  PICK
                </span>
              )}
              <span
                className="material-symbols-outlined text-[22px]"
                style={boosted ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                star
              </span>
              <span className="font-bold text-[15px]">
                {isBoostSubmitting
                  ? "전송 중..."
                  : canBoost
                    ? "주간 슈퍼스타 보내기"
                    : "이번 주 사용 완료"}
              </span>
            </button>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="w-full h-12 rounded-xl flex items-center justify-center gap-2 bg-gray-100 text-gray-700 active:scale-[0.98] transition-all hover:bg-gray-200"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
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
              <span className="material-symbols-outlined text-[20px] text-gray-400" style={liked ? { fontVariationSettings: "'FILL' 1", color: "#ef4444" } : undefined}>favorite</span>
              <span className="text-sm font-semibold text-gray-800">{likeCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px] text-gray-400" style={boosted ? { fontVariationSettings: "'FILL' 1", color: "#9D50FF" } : undefined}>star</span>
              <span className="text-sm font-semibold text-gray-800">{boostCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px] text-gray-400">chat_bubble</span>
              <span className="text-sm font-semibold text-gray-800">{commentCount.toLocaleString()}</span>
            </div>
            <div className="ml-auto">
              <button onClick={handleBookmark} className="p-1" aria-label="북마크">
                <span
                  className={`material-symbols-outlined text-[22px] transition-colors ${bookmarked ? "text-black" : "text-gray-400"}`}
                  style={bookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  bookmark
                </span>
              </button>
            </div>
          </div>

          {/* Group tag fan declaration */}
          {design.groupTag && (
            <div className="pt-2">
              <Link href={`/gallery?groupTag=${encodeURIComponent(design.groupTag)}`}>
                <CheeringBadge
                  userName={design.ownerHandle}
                  idolName={design.groupTag}
                  variant="detail"
                />
              </Link>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {design.groupTag && (
              <Link
                href={`/gallery?groupTag=${encodeURIComponent(design.groupTag)}`}
                className="text-black font-bold text-sm hover:underline"
              >
                #{design.groupTag}
              </Link>
            )}
            {design.concept && (
              <span className="text-gray-500 font-semibold text-sm">#{design.concept.replace(/\s+/g, "")}</span>
            )}
            <span className="text-gray-500 font-semibold text-sm">#KPOP</span>
            <span className="text-gray-500 font-semibold text-sm">#무대의상</span>
          </div>
        </section>

        {/* Stylist Feedback — display mode with user's selection */}
        {design.stylistFeedbacks && design.stylistFeedbacks.length > 0 && (
          <section className="px-5 mt-8">
            <StylistFeedbackCard
              feedbacks={design.stylistFeedbacks}
              mode="display"
              selectedPersonaId={design.selectedStylistId || undefined}
            />
          </section>
        )}

        {/* Comments */}
        <section className="px-5 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-black">댓글 {commentCount}</h3>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="이 스타일에 대한 생각을 남겨보세요"
              maxLength={300}
              className="w-full bg-transparent text-[14px] text-black placeholder-gray-400 resize-none outline-none min-h-[72px]"
            />
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-gray-400">{newComment.length}/300</span>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmittingComment}
                className="px-4 py-1.5 bg-black text-white text-[12px] font-bold rounded-full disabled:opacity-40"
              >
                {isSubmittingComment ? "등록 중..." : "댓글 등록"}
              </button>
            </div>
          </div>

          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <article key={comment.id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-bold text-black">{comment.authorName}</span>
                    <span className="text-[11px] text-gray-400">{getCommentTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-gray-400 py-4">첫 댓글을 남겨보세요.</p>
          )}
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
                    unoptimized
                  />
                  <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/55 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="flex items-center gap-0.5 text-white text-[10px] font-bold">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      {d.likeCount || 0}
                    </span>
                    <span className="flex items-center gap-0.5 text-white text-[10px] font-bold">
                      <span className="material-symbols-outlined text-[12px]">star</span>
                      {d.boostCount || 0}
                    </span>
                  </div>
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
                <Link key={d.id} href={`/design/${d.id}`} className="aspect-[3/4] bg-slate-50 rounded-lg overflow-hidden border border-gray-100 relative">
                  <Image
                    src={d.imageUrls?.[0]?.url || "/images/placeholder.png"}
                    alt="Recommended"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                    <span className="flex items-center gap-0.5 text-white text-[9px] font-bold">
                      <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      {d.likeCount || 0}
                    </span>
                    <span className="flex items-center gap-0.5 text-white text-[9px] font-bold">
                      <span className="material-symbols-outlined text-[10px]">star</span>
                      {d.boostCount || 0}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[110] bg-gray-900 text-white px-5 py-3 rounded-full text-[13px] font-bold shadow-xl">
          {toastMessage}
        </div>
      )}

      {/* Superstar Celebration Overlay */}
      {showSuperstarOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-[320px] w-full text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"></div>

            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-fuchsia-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="material-symbols-outlined text-[40px] text-superstar" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>

            <h2 className="text-xl font-bold mb-2 text-black font-korean">슈퍼스타를 보냈습니다!</h2>
            <p className="text-gray-500 text-[13px] leading-relaxed mb-8 font-korean">
              @{design?.ownerHandle} 님에게<br />당신의 특별한 팬심이 전달되었습니다.
            </p>

            <button
              onClick={() => setShowSuperstarOverlay(false)}
              className="w-full py-3.5 bg-black text-white rounded-xl font-bold text-[14px] active:scale-[0.98] transition-transform"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={() => setShowShareModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-white rounded-t-3xl px-6 pt-6 pb-10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-bold text-black mb-5 font-korean">공유하기</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => { handleShareX(); setShowShareModal(false); }}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-transform">
                  <span className="text-white text-[20px] font-bold">𝕏</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-600">트위터</span>
              </button>
              <button
                onClick={() => { handleShareKakao(); setShowShareModal(false); }}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#fae100] flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-[24px] text-[#3c1e1e]" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-600">카카오톡</span>
              </button>
              <button
                onClick={() => { handleCopyLink(); setTimeout(() => setShowShareModal(false), 800); }}
                className="group flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-transform ${linkCopied ? "bg-green-100" : "bg-gray-100"}`}>
                  <span className={`material-symbols-outlined text-[24px] ${linkCopied ? "text-green-600" : "text-gray-700"}`}>
                    {linkCopied ? "check" : "link"}
                  </span>
                </div>
                <span className={`text-[11px] font-semibold ${linkCopied ? "text-green-600" : "text-gray-600"}`}>
                  {linkCopied ? "복사완료!" : "링크복사"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Superstar Login Prompt */}
      {showSuperstarInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-[320px] w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3 shadow-sm border border-gray-100">
              <span className="material-symbols-outlined text-[32px] text-superstar" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>

            <h2 className="text-lg font-black mb-3 text-black font-korean break-keep">이 디자인이 마음에 드시나요?</h2>
            <p className="text-gray-500 text-[13px] leading-relaxed mb-8 break-keep font-korean">
              로그인하고 <span className="text-superstar font-bold">&apos;슈퍼스타&apos;</span>를 보내보세요.<br />
              베스트 픽 선정 확률이 올라갑니다!
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => router.push(`/login?next=${encodeURIComponent(`/design/${designId}`)}`)}
                className="w-full py-3.5 bg-black text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                로그인하고 응원하기
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
              <button
                onClick={() => setShowSuperstarInfo(false)}
                className="w-full py-3 text-gray-400 text-[12px] font-bold hover:text-gray-600 transition-colors"
              >
                다음에 할게요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boost Cooldown Modal */}
      {showBoostCooldownModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-[320px] w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-gray-100">
              <span className="material-symbols-outlined text-[32px] text-superstar" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>

            <h2 className="text-lg font-black mb-3 text-black font-korean">이번 주 사용 완료</h2>
            <p className="text-gray-500 text-[13px] leading-relaxed mb-6 font-korean">
              슈퍼스타는 계정당 주 1회만 사용할 수 있어요.
            </p>
            {nextBoostAt && (
              <p className="text-[12px] text-superstar font-bold mb-6">
                다음 사용 가능: {formatNextBoostAt(nextBoostAt)}
              </p>
            )}

            <button
              onClick={() => setShowBoostCooldownModal(false)}
              className="w-full py-3.5 bg-black text-white rounded-xl font-bold text-[14px] active:scale-[0.98] transition-transform"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
