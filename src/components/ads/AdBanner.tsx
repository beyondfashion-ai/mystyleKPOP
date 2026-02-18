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

export default function AdBanner({ slot, className = "" }: AdBannerProps) {
  const pushedRef = useRef(false);
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || "ca-pub-6083709376069776";
  const useMockAds = process.env.NEXT_PUBLIC_ADSENSE_USE_MOCK === "true";

  const adClient = useMemo(() => {
    if (!pubId) return "";
    return pubId.startsWith("ca-pub-") ? pubId : `ca-pub-${pubId}`;
  }, [pubId]);

  const isTestMode = process.env.NEXT_PUBLIC_ADSENSE_TEST_MODE === "true";
  const hasRealSlot = Boolean(slot) && !slot.startsWith("demo-");
  const canUseRealAds = !useMockAds && Boolean(adClient) && hasRealSlot;

  useEffect(() => {
    if (!canUseRealAds || pushedRef.current) return;
    if (typeof window === "undefined") return;

    const pushAd = () => {
      if (pushedRef.current) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch {
        // Script may not be ready yet. Retry briefly below.
      }
    };

    pushAd();
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      pushAd();
      if (pushedRef.current || attempts >= 20) {
        window.clearInterval(timer);
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [canUseRealAds]);

  if (!canUseRealAds) {
    return (
      <div className={`w-full ${className}`}>
        <div className="relative h-[120px] w-full overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, #ffffff 0%, transparent 45%), radial-gradient(circle at 80% 70%, #e5e7eb 0%, transparent 40%)",
            }}
          />
          <div className="relative z-10 flex h-full w-full items-center justify-between px-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ad Placeholder</p>
              <p className="mt-1 text-[13px] font-black text-gray-700">Your Ad Could Be Here</p>
              <p className="mt-1 text-[11px] text-gray-500">Configure AdSense pub/slot env to render live ads</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-gray-200 bg-white">
              <span className="material-symbols-outlined text-[28px] text-gray-400">campaign</span>
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
