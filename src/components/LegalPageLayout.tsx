"use client";

import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface LegalPageLayoutProps {
  pageTitle: string;
  subtitle: string;
  effectiveDate: string;
  version: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({
  pageTitle,
  subtitle,
  effectiveDate,
  version,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-black pb-24">
      <Header pageTitle={pageTitle} subtitle={subtitle} />

      <main className="max-w-md mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2">
          <span>시행일: {effectiveDate}</span>
          <span>{version}</span>
        </div>

        {children}
      </main>

      <BottomNav />
    </div>
  );
}
