"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

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
    const [isAdmin, setIsAdmin] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetch("/api/gallery?sort=popular")
            .then((res) => res.json())
            .then((data) => {
                if (data.designs) setBestPicks(data.designs.slice(0, 5));
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadAdminClaim = async () => {
            if (!user) {
                if (mounted) setIsAdmin(false);
                return;
            }

            try {
                const tokenResult = await user.getIdTokenResult();
                if (mounted) setIsAdmin(Boolean(tokenResult.claims.admin));
            } catch {
                if (mounted) setIsAdmin(false);
            }
        };

        loadAdminClaim();
        return () => {
            mounted = false;
        };
    }, [user]);

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
                {/* Hero */}
                <section className="px-6 py-16 text-center bg-white relative">
                    <div className="relative z-10">
                        <div className="inline-block px-4 py-1.5 bg-black text-white rounded-full text-[10px] font-black mb-6 tracking-widest uppercase">
                            ● Season 4 Active
                        </div>
                        <h1 className="text-4xl font-black tracking-tight mb-4 leading-tight font-display text-black">
                            {"\uB2F9\uC2E0\uC758 "}<span className="text-primary">{"\uD32C\uC2EC"}</span>{"\uC774"}<br />{"\uD604\uC2E4\uC774 \uB418\uB294 \uACF3"}
                        </h1>
                        <p className="text-sm text-gray-600 mb-10 max-w-[280px] mx-auto leading-relaxed">
                            {"\uB0B4 \uCD5C\uC560\uB97C \uC704\uD55C \uBB34\uB300 \uC758\uC0C1\uC744 \uB514\uC790\uC778\uD574\uBCF4\uC138\uC694."}<br />
                            {"\uC774\uBC88 \uB2EC \uD22C\uD45C 1\uC704 \uB514\uC790\uC778\uC740 \uC2E4\uC81C\uB85C \uC81C\uC791\uB429\uB2C8\uB2E4!"}
                        </p>
                        <Link href="/studio" className="w-full bg-black text-white py-4 px-6 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95">
                            <span className="material-symbols-outlined text-lg">edit</span>
                            {"\uC9C0\uAE08 \uBC14\uB85C \uB514\uC790\uC778\uD558\uAE30"}
                        </Link>
                    </div>
                </section>
                {/* Best Picks */}
                <section className="py-12 bg-white border-y border-gray-50">
                    <div className="px-6 flex justify-between items-end mb-6">
                        <h2 className="text-xl font-black font-display flex items-center gap-2 uppercase">
                            BEST PICKS
                        </h2>
                        <Link href="/gallery" className="text-xs text-gray-400 font-bold border-b border-gray-200">View All</Link>
                    </div>
                    <div className="px-6">
                        {/* 1st place ??portrait 3:4 to match generated images */}
                        <Link
                            href={top1 ? `/design/${top1.id}` : "/gallery"}
                            className="relative w-full aspect-[3/4] bg-white rounded-xl overflow-hidden mb-6 border border-gray-100 shadow-sm block"
                        >
                            {top1 && getImageUrl(top1) ? (
                                <Image
                                    src={getImageUrl(top1)}
                                    alt="Best pick #1"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    unoptimized
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
                                    <span className="text-xs text-gray-300 font-medium">By @{top1?.ownerHandle || "\u2014"}</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm text-white" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                        <span className="text-xs font-bold">{top1 ? formatCount(top1.likeCount || 0) : "0"}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Runners up ??portrait 3:4 */}
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
                            {runners.length > 0 ? runners.map((design, i) => (
                                <Link key={design.id} href={`/design/${design.id}`} className="min-w-[130px] flex-shrink-0">
                                    <div className="relative aspect-[3/4] bg-white rounded-lg overflow-hidden border border-gray-100 mb-2">
                                        {getImageUrl(design) ? (
                                            <Image
                                                src={getImageUrl(design)}
                                                alt={`Pick #${i + 2}`}
                                                fill
                                                className="object-cover"
                                                sizes="140px"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100"></div>
                                        )}
                                        <div className="absolute top-2 left-2 bg-gray-100 text-black px-2 py-0.5 text-[10px] font-bold rounded-full">
                                            {i === 0 ? "2nd" : i === 1 ? "3rd" : `${i + 2}th`}
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold truncate">{design.concept || "Design"}</p>
                                    <p className="text-[10px] text-gray-500">@{design.ownerHandle || "\u2014"}</p>
                                </Link>
                            )) : (
                                <>
                                    <div className="min-w-[130px] flex-shrink-0">
                                        <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-100 mb-2 flex items-center justify-center text-gray-300">
                                            <span className="material-symbols-outlined text-2xl">image</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-300">{"\uC544\uC9C1 \uB514\uC790\uC778\uC774 \uC5C6\uC5B4\uC694"}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Journey Timeline */}
                <section className="py-20 px-6 bg-white">
                    <div className="max-w-[380px] mx-auto">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.22em] text-center mb-3">Journey</p>
                        <h2 className="text-2xl font-black mb-12 text-center font-korean leading-snug">
                            {"\uD32C\uC758 \uC544\uC774\uB514\uC5B4\uAC00"}<br />{"\uBB34\uB300\uAC00 \uB418\uB294 4\uB2E8\uACC4"}
                        </h2>

                        <div className="relative pl-3">
                            <div className="absolute left-[22px] top-4 bottom-4 w-px bg-gradient-to-b from-gray-200 via-gray-200 to-vibrant-cyan/40" />
                            <div className="space-y-5">
                                <article className="relative flex gap-4">
                                    <div className="relative z-10 w-11 h-11 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center shrink-0 border-4 border-white">01</div>
                                    <div className="flex-1 rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-transform duration-200 hover:-translate-y-0.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-bold text-[15px] text-black font-korean">{"\uC544\uC774\uB514\uC5B4 \uC785\uB825"}</h3>
                                            <span className="material-symbols-outlined text-[19px] text-black">edit_note</span>
                                        </div>
                                        <p className="text-[12px] text-gray-500 leading-relaxed mt-2 font-korean">{"\uC6D0\uD558\uB294 \uBB34\uB4DC, \uCEEC\uB7EC, \uB514\uD14C\uC77C\uC744 \uC801\uC73C\uBA74 \uC900\uBE44 \uC644\uB8CC"}</p>
                                    </div>
                                </article>

                                <article className="relative flex gap-4">
                                    <div className="relative z-10 w-11 h-11 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center shrink-0 border-4 border-white">02</div>
                                    <div className="flex-1 rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-transform duration-200 hover:-translate-y-0.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-bold text-[15px] text-black font-korean">{"AI \uC2A4\uD0C0\uC77C \uC0DD\uC131"}</h3>
                                            <span className="material-symbols-outlined text-[19px] text-black">auto_awesome</span>
                                        </div>
                                        <p className="text-[12px] text-gray-500 leading-relaxed mt-2 font-korean">{"\uD328\uC158 AI\uAC00 \uBB34\uB300\uC6A9 \uB8E9 \uC2DC\uC548\uC744 \uBE60\uB974\uAC8C \uC81C\uC548\uD569\uB2C8\uB2E4"}</p>
                                    </div>
                                </article>

                                <article className="relative flex gap-4">
                                    <div className="relative z-10 w-11 h-11 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center shrink-0 border-4 border-white">03</div>
                                    <div className="flex-1 rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-transform duration-200 hover:-translate-y-0.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-bold text-[15px] text-black font-korean">{"\uCEE4\uBBA4\uB2C8\uD2F0 \uD22C\uD45C"}</h3>
                                            <span className="material-symbols-outlined text-[19px] text-black">how_to_vote</span>
                                        </div>
                                        <p className="text-[12px] text-gray-500 leading-relaxed mt-2 font-korean">{"\uACF5\uC720\uD558\uACE0 \uBC18\uC751\uC744 \uBAA8\uC544 \uB7AD\uD0B9\uC744 \uC62C\uB9AC\uC138\uC694"}</p>
                                    </div>
                                </article>

                                <article className="relative flex gap-4">
                                    <div className="relative z-10 w-11 h-11 rounded-full bg-vibrant-cyan text-white text-[11px] font-black flex items-center justify-center shrink-0 border-4 border-white shadow-[0_6px_16px_rgba(0,229,255,0.35)]">04</div>
                                    <div className="flex-1 rounded-2xl border border-vibrant-cyan/25 bg-gradient-to-br from-vibrant-cyan/10 to-white p-5 transition-transform duration-200 hover:-translate-y-0.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-bold text-[15px] text-vibrant-cyan font-korean">{"\uC6B0\uC2B9 \uB8E9 \uC2E4\uD604"}</h3>
                                            <span className="material-symbols-outlined text-[19px] text-vibrant-cyan animate-pulse">emoji_events</span>
                                        </div>
                                        <p className="text-[12px] text-gray-600 leading-relaxed mt-2 font-korean">{"\uC6D4\uAC04 1\uC704 \uB514\uC790\uC778\uC740 \uC2E4\uC81C \uC81C\uC791 \uD504\uB85C\uC138\uC2A4\uB85C \uC5F0\uACB0\uB429\uB2C8\uB2E4"}</p>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Footer */}
                <footer className="px-6 py-10 border-t border-gray-100 bg-white mb-10">
                    <p className="text-xs text-black font-display font-black uppercase tracking-[0.22em] mb-5">MY-STYLE.AI</p>
                    <div className="grid grid-cols-2 gap-6 text-left">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Explore</p>
                            <div className="space-y-1">
                                <Link href="/" className="block text-[12px] text-gray-600 hover:text-black">Home</Link>
                                <Link href="/studio" className="block text-[12px] text-gray-600 hover:text-black">Studio</Link>
                                <Link href="/gallery" className="block text-[12px] text-gray-600 hover:text-black">Gallery</Link>
                                <Link href="/ranking" className="block text-[12px] text-gray-600 hover:text-black">Ranking</Link>
                                <Link href="/community" className="block text-[12px] text-gray-600 hover:text-black">Community</Link>
                                {isAdmin && (
                                    <Link href="/simulation" className="block text-[12px] text-gray-600 hover:text-black">Simulation</Link>
                                )}
                                <Link href="/mypage" className="block text-[12px] text-gray-600 hover:text-black">My Page</Link>
                                <Link href="/login" className="block text-[12px] text-gray-600 hover:text-black">Login</Link>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Support</p>
                            <div className="space-y-1">
                                <Link href="/about" className="block text-[12px] text-gray-600 hover:text-black">About</Link>
                                <a href="mailto:support@mystyle.ai" className="block text-[12px] text-gray-600 hover:text-black">Contact</a>
                            </div>
                        </div>
                    </div>
                    <p className="mt-6 text-[10px] text-gray-300">&copy; {new Date().getFullYear()} MY-STYLE.AI</p>
                </footer>
            </main>

            <BottomNav />
        </div>
    );
}