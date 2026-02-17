"use client";

import { useEffect, useMemo, useRef } from "react";

interface AdBannerProps {
  slot: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const ADSENSE_SCRIPT_ID = "google-adsense-script";

export default function AdBanner({ slot, className = "" }: AdBannerProps) {
  const pushedRef = useRef(false);
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || "";
  const useMockAds = process.env.NEXT_PUBLIC_ADSENSE_USE_MOCK !== "false";

  const adClient = useMemo(() => {
    if (!pubId) return "";
    return pubId.startsWith("ca-pub-") ? pubId : `ca-pub-${pubId}`;
  }, [pubId]);

  const isTestMode = process.env.NEXT_PUBLIC_ADSENSE_TEST_MODE === "true";
  const canUseRealAds = !useMockAds && Boolean(adClient) && Boolean(slot);

  useEffect(() => {
    if (!canUseRealAds || pushedRef.current) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const pushAd = () => {
      if (pushedRef.current) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch (error) {
        console.error("AdSense push error:", error);
      }
    };

    const existingScript = document.getElementById(ADSENSE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      // Queue ad unit rendering when script is already available.
      pushAd();
      return;
    }

    const script = document.createElement("script");
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
    script.onload = () => pushAd();
    document.head.appendChild(script);
  }, [adClient, canUseRealAds, slot]);

  if (!canUseRealAds) {
    return (
      <div className={`w-full ${className}`}>
        <div className="relative h-[120px] w-full rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #ffffff 0%, transparent 45%), radial-gradient(circle at 80% 70%, #e5e7eb 0%, transparent 40%)" }} />
          <div className="relative z-10 h-full w-full flex items-center justify-between px-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Ad Placeholder</p>
              <p className="text-[13px] font-black text-gray-700 mt-1">Your Ad Could Be Here</p>
              <p className="text-[11px] text-gray-500 mt-1">Google AdSense 연결 전 더미 이미지</p>
            </div>
            <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-400 text-[28px]">campaign</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <ins
        className="adsbygoogle block w-full overflow-hidden rounded-xl bg-gray-50"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest={isTestMode ? "on" : undefined}
      />
    </div>
  );
}
