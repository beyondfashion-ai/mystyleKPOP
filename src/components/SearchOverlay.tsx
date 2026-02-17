"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = "";
        }
    }, [isOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        router.push(`/gallery?groupTag=${encodeURIComponent(query)}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/25 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div className="max-w-md mx-auto px-4 pt-safe-top">
                <div
                    className="mt-3 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
                        <span className="w-8"></span>
                        <h2 className="font-bold text-lg font-korean">검색</h2>
                        <button onClick={onClose} className="w-8 flex justify-center" aria-label="검색 닫기">
                            <span className="material-symbols-outlined text-[24px]">close</span>
                        </button>
                    </div>

                    <div className="p-4">
                        <form onSubmit={handleSearch} className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="그룹명이나 스타일 키워드를 검색해보세요"
                                className="w-full h-12 bg-gray-100 rounded-xl pl-10 pr-4 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                            />
                        </form>
                    </div>

                    <div className="px-6 py-4">
                        <h3 className="text-xs font-bold text-gray-400 mb-3">추천 검색어</h3>
                        <div className="flex flex-wrap gap-2">
                            {["NewJeans", "BTS", "Cyberpunk", "Y2K", "Pink", "School"].map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => {
                                        router.push(`/gallery?groupTag=${encodeURIComponent(tag)}`);
                                        onClose();
                                    }}
                                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-100"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
