import type { Metadata } from "next";
import { Inter, Sora, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const notoSansKr = Noto_Sans_KR({ subsets: ["latin"], variable: "--font-noto-sans-kr" });

export const metadata: Metadata = {
  title: "MyStyleAI - 당신의 팬심이 현실이 되는 곳",
  description: "AI로 만드는 나만의 K-POP 아이돌 스타일",
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
