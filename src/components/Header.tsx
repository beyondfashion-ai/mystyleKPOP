"use client";

import Link from "next/link";

interface HeaderProps {
    /** Optional page title shown below the brand bar */
    pageTitle?: string;
    /** Optional right-side slot (e.g. filter button) */
    rightSlot?: React.ReactNode;
    /** Optional tabs shown below the title */
    tabs?: React.ReactNode;
}

export default function Header({ pageTitle, rightSlot, tabs }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-[60] bg-white/70 backdrop-blur-xl border-b border-gray-100">
            <div className="max-w-md mx-auto px-6 pt-safe-top">
                {/* Brand bar — same across all pages */}
                <div className="h-14 flex justify-between items-center">
                    <Link href="/" className="text-sm font-extrabold tracking-tighter font-display uppercase">
                        MY-STYLE.AI
                    </Link>
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

                {/* Page title row (optional) */}
                {(pageTitle || rightSlot) && (
                    <div className="flex items-center justify-between pb-4">
                        {pageTitle && (
                            <h2 className="text-3xl font-bold text-black font-korean tracking-tight">{pageTitle}</h2>
                        )}
                        {rightSlot && <div>{rightSlot}</div>}
                    </div>
                )}

                {/* Tabs row (optional) */}
                {tabs && <div className="pb-2">{tabs}</div>}
            </div>
        </header>
    );
}
