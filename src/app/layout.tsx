import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Sora, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const notoSansKr = Noto_Sans_KR({ subsets: ["latin"], variable: "--font-noto-sans-kr" });
const adsensePubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || "ca-pub-6083709376069776";
const adsenseClient = adsensePubId
  ? adsensePubId.startsWith("ca-pub-")
    ? adsensePubId
    : `ca-pub-${adsensePubId}`
  : "";
const useMockAds = process.env.NEXT_PUBLIC_ADSENSE_USE_MOCK === "true";

export const metadata: Metadata = {
  title: "MyStyleAI - 당신의 팬심이 현실이 되는 곳",
  description: "AI로 만드는 나만의 K-POP 아이돌 스타일",
  other: {
    "google-adsense-account": adsenseClient,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${sora.variable} ${notoSansKr.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-display antialiased bg-background-light text-text-main min-h-screen">
        {!useMockAds && adsenseClient ? (
          <Script
            id="google-adsense-script"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
