"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";

interface Post {
    id: string;
    content: string;
    authorUid: string;
    authorName: string;
    authorPhoto: string | null;
    likeCount: number;
    isAdmin: boolean;
    createdAt: { _seconds?: number; seconds?: number } | string | null;
    sourceType?: string;
    designId?: string;
    designOwnerHandle?: string;
    designConcept?: string;
    designImageUrl?: string;
}

export default function CommunityPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [showCompose, setShowCompose] = useState(false);
    const [likedSet, setLikedSet] = useState<Set<string>>(new Set());

    const fetchPosts = useCallback(async () => {
        try {
            const res = await fetch("/api/community");
            const data = await res.json();
            setPosts(data.posts || []);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handlePost = async () => {
        if (!newPost.trim() || isPosting) return;
        setIsPosting(true);

        try {
            const res = await fetch("/api/community", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: newPost.trim(),
                    uid: user?.uid,
                    displayName: user?.displayName || "익명",
                    photoURL: user?.photoURL || null,
                }),
            });

            if (res.ok) {
                setNewPost("");
                setShowCompose(false);
                fetchPosts(); // Refresh
            }
        } catch (error) {
            console.error("Failed to post:", error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = (postId: string) => {
        const wasLiked = likedSet.has(postId);
        setLikedSet((prev) => {
            const next = new Set(prev);
            if (wasLiked) next.delete(postId);
            else next.add(postId);
            return next;
        });
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId
                    ? { ...p, likeCount: p.likeCount + (wasLiked ? -1 : 1) }
                    : p
            )
        );
        // TODO: Persist like to Firestore via API
    };

    const formatTime = (ts: Post["createdAt"]) => {
        if (!ts) return "";
        if (typeof ts === "string") {
            const date = new Date(ts);
            if (Number.isNaN(date.getTime())) return "";
            const now = new Date();
            const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diff < 60) return "방금 전";
            if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
            if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }

        const seconds = ts._seconds || ts.seconds || 0;
        if (!seconds) return "";
        const date = new Date(seconds * 1000);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 60) return "방금 전";
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    return (
        <div className="bg-white text-black antialiased pb-24 min-h-screen font-korean">
            <Header pageTitle="커뮤니티" subtitle="팬들과 자유롭게 소통하세요" />

            <main className="max-w-md mx-auto pt-4 px-5 space-y-4">
                {/* Compose Button */}
                {!showCompose ? (
                    <button
                        onClick={() => setShowCompose(true)}
                        className="w-full bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-gray-100 hover:border-gray-300 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {user?.photoURL ? (
                                <Image src={user.photoURL} alt="" width={36} height={36} className="rounded-full" />
                            ) : (
                                <span className="material-symbols-outlined text-[18px] text-gray-400">person</span>
                            )}
                        </div>
                        <span className="text-[13px] text-gray-400">무슨 생각을 하고 있나요?</span>
                    </button>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5">
                                {user?.photoURL ? (
                                    <Image src={user.photoURL} alt="" width={36} height={36} className="rounded-full" />
                                ) : (
                                    <span className="material-symbols-outlined text-[18px] text-gray-400">person</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-[12px] font-bold text-black mb-2">{user?.displayName || "익명"}</p>
                                <textarea
                                    className="w-full bg-transparent text-[14px] leading-relaxed text-black placeholder-gray-300 resize-none outline-none min-h-[80px]"
                                    placeholder="커뮤니티에 글을 남겨보세요..."
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    maxLength={500}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                                {/* TODO Phase 2: Image upload button */}
                                <button className="text-gray-300 hover:text-gray-500 transition-colors" title="준비 중">
                                    <span className="material-symbols-outlined text-[20px]">image</span>
                                </button>
                                <span className="text-[10px] text-gray-300 font-bold">{newPost.length}/500</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setShowCompose(false); setNewPost(""); }}
                                    className="px-4 py-1.5 text-[12px] font-bold text-gray-400 hover:text-black transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handlePost}
                                    disabled={!newPost.trim() || isPosting}
                                    className="px-5 py-1.5 bg-black text-white text-[12px] font-bold rounded-full disabled:opacity-40 hover:opacity-80 transition-all"
                                >
                                    {isPosting ? "게시 중..." : "게시"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Posts Feed */}
                <div className="space-y-0">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-6 h-6 border-2 border-gray-100 border-t-black rounded-full animate-spin"></div>
                        </div>
                    ) : posts.length > 0 ? (
                        posts.map((post) => {
                            const isLiked = likedSet.has(post.id);
                            return (
                                <article
                                    key={post.id}
                                    className="py-5 border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {post.authorPhoto ? (
                                                <Image src={post.authorPhoto} alt="" width={40} height={40} className="rounded-full" />
                                            ) : (
                                                <span className="material-symbols-outlined text-[20px] text-gray-300">person</span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-[13px] font-bold text-black">{post.authorName}</span>
                                                {post.isAdmin && (
                                                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-black text-white rounded">ADMIN</span>
                                                )}
                                                <span className="text-[11px] text-gray-300">· {formatTime(post.createdAt)}</span>
                                            </div>

                                            <p className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                                                {post.content}
                                            </p>
                                            {post.sourceType === "design-comment" && post.designId && (
                                                <Link
                                                    href={`/design/${post.designId}`}
                                                    className="mt-3 block border border-gray-100 rounded-xl p-2.5 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                            <Image
                                                                src={post.designImageUrl || "/images/placeholder.png"}
                                                                alt={post.designConcept || "Design preview"}
                                                                fill
                                                                className="object-cover"
                                                                sizes="56px"
                                                                unoptimized
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] text-gray-400 font-semibold">스타일픽 댓글</p>
                                                            <p className="text-[13px] font-bold text-black truncate">
                                                                {post.designConcept || "Stage Outfit"}
                                                            </p>
                                                            <p className="text-[11px] text-gray-500 truncate">
                                                                @{post.designOwnerHandle || "designer"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            )}

                                            {/* Actions */}
                                            <div className="flex items-center gap-5 mt-3">
                                                <button
                                                    onClick={() => handleLike(post.id)}
                                                    className="flex items-center gap-1.5 group"
                                                >
                                                    <span
                                                        className={`material-symbols-outlined text-[18px] transition-colors ${isLiked ? "text-red-500" : "text-gray-300 group-hover:text-gray-500"}`}
                                                        style={isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                                    >
                                                        favorite
                                                    </span>
                                                    <span className={`text-[12px] font-bold ${isLiked ? "text-red-500" : "text-gray-300"}`}>
                                                        {post.likeCount || 0}
                                                    </span>
                                                </button>

                                                {/* TODO Phase 2: Comment button */}
                                                <button className="flex items-center gap-1.5 text-gray-300 hover:text-gray-500 transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                                                    <span className="text-[12px] font-bold">0</span>
                                                </button>

                                                {/* TODO Phase 2: Share button */}
                                                <button className="flex items-center gap-1.5 text-gray-300 hover:text-gray-500 transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">share</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* TODO: Admin menu — delete/hide post */}
                                        {/* <button className="text-gray-300"><span className="material-symbols-outlined">more_vert</span></button> */}
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center py-20 gap-4">
                            <span className="material-symbols-outlined text-[48px] text-gray-200">forum</span>
                            <p className="text-[14px] text-gray-400 font-medium">아직 게시글이 없습니다</p>
                            <p className="text-[12px] text-gray-300">첫 번째 글을 작성해보세요!</p>
                        </div>
                    )}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
