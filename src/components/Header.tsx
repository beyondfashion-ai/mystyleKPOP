"use client";

import Link from "next/link";

interface HeaderProps {
    /** Optional page title shown below the brand bar (scrolls with content) */
    pageTitle?: string;
    /** Optional subtitle shown below the page title */
    subtitle?: string;
    /** Optional right-side slot (e.g. filter button) */
    rightSlot?: React.ReactNode;
    /** Optional tabs shown below the title */
    tabs?: React.ReactNode;
    /** When true, tabs are fixed together with brand bar */
    stickyTabs?: boolean;
    /** When true, hides the default search button */
    hideSearch?: boolean;
}

import { useState } from "react";
import SearchOverlay from "./SearchOverlay";
import NotificationDropdown from "./NotificationDropdown";

export default function Header({ pageTitle, subtitle, rightSlot, tabs, stickyTabs, hideSearch }: HeaderProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const handleOpenSearch = () => {
        setIsNotiOpen(false);
        setIsSearchOpen(true);
    };
    const handleToggleNoti = () => {
        setIsSearchOpen(false);
        setIsNotiOpen((prev) => !prev);
    };

    return (
        <>
            {/* Search Overlay */}
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Fixed header — brand bar + sticky tabs merged in one layer */}
            <header className="fixed top-0 left-0 right-0 z-[60] bg-white/70 backdrop-blur-xl">
                <div className="max-w-md mx-auto px-6 pt-safe-top">
                    <div className="h-14 flex justify-between items-center">
                        <Link href="/" className="text-sm font-extrabold tracking-tighter font-display uppercase">
                            MY-STYLE.AI
                        </Link>
                        <div className="flex items-center gap-5 relative">
                            {!hideSearch && (
                                <button
                                    onClick={handleOpenSearch}
                                    className="flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    aria-label="검색"
                                >
                                    <span className="material-symbols-outlined text-[22px] text-gray-900 font-light">search</span>
                                </button>
                            )}

                            <div className="relative">
                                <button
                                    onClick={handleToggleNoti}
                                    className={`flex items-center justify-center relative p-1 rounded-full hover:bg-gray-100 transition-colors ${isNotiOpen ? "bg-gray-100" : ""}`}
                                    aria-label="알림"
                                >
                                    <span className={`material-symbols-outlined text-[22px] font-light ${isNotiOpen ? "text-black" : "text-gray-900"}`}>notifications</span>
                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                                </button>

                                {/* Notification Dropdown */}
                                <NotificationDropdown isOpen={isNotiOpen} onClose={() => setIsNotiOpen(false)} />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Tabs inside fixed header when stickyTabs */}
                {stickyTabs && tabs && (
                    <div className="max-w-md mx-auto px-6 pb-2">
                        {tabs}
                    </div>
                )}
            </header>

            {/* Spacer to push content below fixed header */}
            <div className="pt-safe-top">
                <div className={stickyTabs && tabs ? "h-[104px]" : "h-14"}></div>
            </div>

            {/* Scrollable page title (flows with content) */}
            {(pageTitle || rightSlot) && (
                <div className="max-w-md mx-auto px-6">
                    <div className="flex items-center justify-between py-4">
                        {pageTitle && (
                            <div>
                                <h2 className="text-3xl font-bold text-black font-korean tracking-tight">{pageTitle}</h2>
                                {subtitle && <p className="text-[13px] text-gray-500 font-medium mt-1">{subtitle}</p>}
                            </div>
                        )}
                        {rightSlot && <div>{rightSlot}</div>}
                    </div>
                </div>
            )}

            {/* Non-sticky tabs (scroll with content) */}
            {!stickyTabs && tabs && (
                <div className="max-w-md mx-auto px-6 pb-2">
                    {tabs}
                </div>
            )}
        </>
    );
}
