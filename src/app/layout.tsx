import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mystyleai — Design Your Idol's Stage Outfit",
  description:
    "From Prompt to Stage: Design KPOP stage outfits with AI, compete in monthly rankings, and win a real costume.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
