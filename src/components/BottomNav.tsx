"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-100 pb-safe shadow-sm">
            <div className="max-w-md mx-auto h-[84px] px-8 flex items-center justify-between relative">
                <Link href="/" className="flex flex-col items-center gap-1.5 w-12 group">
                    <span className={`material-symbols-outlined text-[26px] font-light transition-colors ${isActive("/") ? "text-black fill-current" : "text-gray-300 group-hover:text-black"}`}>home</span>
                    <span className={`text-[10px] font-bold font-korean transition-colors ${isActive("/") ? "text-black" : "text-gray-300 group-hover:text-black"}`}>홈</span>
                </Link>
                <Link href="/gallery" className="flex flex-col items-center gap-1.5 w-12 group">
                    <span className={`material-symbols-outlined text-[26px] font-light transition-colors ${isActive("/gallery") ? "text-black fill-current" : "text-gray-300 group-hover:text-black"}`}>explore</span>
                    <span className={`text-[10px] font-bold font-korean transition-colors ${isActive("/gallery") ? "text-black" : "text-gray-300 group-hover:text-black"}`}>둘러보기</span>
                </Link>
                <div className="relative -top-5 flex flex-col items-center">
                    <Link href="/studio" className="w-[58px] h-[58px] bg-black rounded-full flex items-center justify-center shadow-2xl shadow-black/30 hover:scale-105 active:scale-95 transition-all border-4 border-white">
                        <span className="material-symbols-outlined text-white text-[32px] font-light">add</span>
                    </Link>
                </div>
                <Link href="/community" className="flex flex-col items-center gap-1.5 w-12 group">
                    <span className={`material-symbols-outlined text-[26px] font-light transition-colors ${isActive("/community") ? "text-black fill-current" : "text-gray-300 group-hover:text-black"}`}>forum</span>
                    <span className={`text-[10px] font-bold font-korean transition-colors ${isActive("/community") ? "text-black" : "text-gray-300 group-hover:text-black"}`}>커뮤니티</span>
                </Link>
                <Link href="/mypage" className="flex flex-col items-center gap-1.5 w-12 group">
                    <span className={`material-symbols-outlined text-[26px] font-light transition-colors ${isActive("/mypage") ? "text-black fill-current" : "text-gray-300 group-hover:text-black"}`}>person</span>
                    <span className={`text-[10px] font-bold font-korean transition-colors ${isActive("/mypage") ? "text-black" : "text-gray-300 group-hover:text-black"}`}>마이</span>
                </Link>
            </div>
        </nav>
    );
}
