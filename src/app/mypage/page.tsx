"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

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
    createdAt?: { _seconds?: number; seconds?: number };
}

export default function MyPage() {
    const { user, loading: authLoading, logout, signInWithGoogle } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<UserStats>({ designCount: 0, totalLikes: 0, followerCount: 0, followingCount: 0 });
    const [myDesigns, setMyDesigns] = useState<MyDesign[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [activeTab, setActiveTab] = useState<"designs" | "liked">("designs");
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

    useEffect(() => {
        if (user?.uid) {
            fetchStats();
            fetchMyDesigns();
        } else {
            setLoadingStats(false);
        }
    }, [user?.uid, fetchStats, fetchMyDesigns]);

    const handleLogout = async () => {
        await logout();
        setShowLogoutConfirm(false);
        router.push("/");
    };

    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    // Not logged in — show login prompt
    if (!user) {
        return (
            <div className="bg-white font-display text-black min-h-screen pb-24">
                <Header pageTitle="마이페이지" />
                <main className="max-w-md mx-auto pt-[160px] px-6 flex flex-col items-center text-center gap-6">
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
                        href="/login"
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

    return (
        <div className="bg-white font-display text-black min-h-screen pb-24">
            <Header pageTitle="마이페이지" />

            <main className="max-w-md mx-auto pt-28 w-full">
                {/* Profile Section */}
                <section className="px-6 py-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                            {user.photoURL ? (
                                <Image src={user.photoURL} alt="Profile" width={80} height={80} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold tracking-tight truncate">{user.displayName || "Guest"}</h2>
                            <p className="text-[12px] text-gray-400 mt-0.5 truncate">{user.email}</p>
                            {/* TODO: editable bio field stored in Firestore users collection */}
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
                        myDesigns.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1.5">
                                {myDesigns.map((design) => {
                                    const imgSrc = design.imageUrls?.[0]?.url || design.imageUrl || "";
                                    return (
                                        <Link key={design.id} href={`/design/${design.id}`} className="block">
                                            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                                {imgSrc ? (
                                                    <Image src={imgSrc} alt="" fill className="object-cover" sizes="33vw" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-gray-300">image</span>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                                                    <span className="material-symbols-outlined text-white text-[10px]">favorite</span>
                                                    <span className="text-white text-[9px] font-bold">{design.likeCount || 0}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-16 gap-4">
                                <span className="material-symbols-outlined text-[40px] text-gray-200">palette</span>
                                <p className="text-[13px] text-gray-400">아직 게시한 디자인이 없습니다</p>
                                <Link href="/studio" className="px-5 py-2 bg-black text-white text-[12px] font-bold rounded-full">
                                    첫 디자인 만들기
                                </Link>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center py-16 gap-4">
                            <span className="material-symbols-outlined text-[40px] text-gray-200">favorite</span>
                            <p className="text-[13px] text-gray-400">좋아요한 디자인이 여기에 표시됩니다</p>
                            {/* TODO: Fetch liked designs from Firestore */}
                        </div>
                    )}
                </section>

                {/* Menu */}
                <nav className="mt-2 border-t border-gray-100">
                    <div className="flex flex-col">
                        <Link href="/ranking" className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-600 text-[22px]">emoji_events</span>
                                </div>
                                <span className="text-[15px] font-medium">랭킹</span>
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

                        {/* TODO: 공지사항 페이지 구현 */}
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

            {/* Logout Confirmation Modal */}
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
        </div>
    );
}
