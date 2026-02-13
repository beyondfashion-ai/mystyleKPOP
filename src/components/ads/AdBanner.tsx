"use client";

import { useEffect } from "react";

interface AdBannerProps {
  slot: string;
}

export default function AdBanner({ slot }: AdBannerProps) {
  useEffect(() => {
    // AdSense loading logic would go here
    // e.g., (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  // Configure visibility via env or admin settings
  const adsEnabled = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ? true : false;
  
  if (!adsEnabled) return null;

  return (
    <div className="flex w-full flex-col items-center justify-center p-4">
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
        Advertisement
      </div>
      <div className="aspect-[4/3] w-full max-w-[300px] bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-md">
        <span>Ad Space ({slot})</span>
      </div>
    </div>
  );
}
