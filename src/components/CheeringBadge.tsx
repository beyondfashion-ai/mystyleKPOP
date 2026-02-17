"use client";

import React from "react";
import Link from "next/link";

interface CheeringBadgeProps {
    userName: string;
    idolName: string;
    variant: "card" | "detail" | "modal";
    className?: string;
}

/**
 * Returns the correct Korean particle (을/를) based on the final consonant.
 * This is a simple implementation.
 */
function getObjectParticle(word: string) {
    if (!word) return "를";

    // Check if the last character has a final consonant (batchim)
    const lastChar = word.charCodeAt(word.length - 1);

    // Hangul Syllables range: AC00-D7A3
    if (lastChar < 0xac00 || lastChar > 0xd7a3) {
        // For non-Korean words (e.g. English), we can't easily determine.
        // Default to '를' as it's common for English names in K-pop context 
        // (often ending in vowel sounds or 's' which is 'su').
        // Exception: meaningful batchim like 'GD' (di), 'TOP' (pi).
        // For MVP, we'll stick to '를' or '을(를)'.
        // User requested "~님이 **를 응원합니다", so we default to '를'.
        return "를";
    }

    const jongseong = (lastChar - 0xac00) % 28;
    return jongseong === 0 ? "를" : "을";
}

export default function CheeringBadge({ userName, idolName, variant, className = "" }: CheeringBadgeProps) {
    const particle = getObjectParticle(idolName);

    const baseStyle = "break-keep whitespace-normal leading-tight font-korean";

    if (variant === "card") {
        return (
            <div className={`${baseStyle} text-[11px] text-gray-400 mt-1 ${className}`}>
                <span className="font-bold text-black">@{userName}</span>님이{" "}
                <span className="font-bold text-primary">{idolName}</span>{particle}{" "}
                응원합니다
            </div>
        );
    }

    if (variant === "detail") {
        // Pill shape, high contrast
        return (
            <div className={`${baseStyle} inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-full ${className}`}>
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                <span className="text-[12px]">
                    <span className="font-bold">@{userName}</span>님이{" "}
                    <span className="font-bold text-superstar">{idolName}</span>{particle}{" "}
                    응원합니다
                </span>
            </div>
        );
    }

    if (variant === "modal") {
        // Large, centered highlight
        return (
            <div className={`${baseStyle} text-center ${className}`}>
                <p className="text-[16px] text-black mb-1">
                    <span className="font-bold">@{userName}</span>님이
                </p>
                <p className="text-[20px] font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500">
                    {idolName}{particle} 응원합니다!
                </p>
            </div>
        );
    }

    return null;
}
