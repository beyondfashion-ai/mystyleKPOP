import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                "primary": "#1978e5",
                "background-light": "#f6f7f8",
                "background-dark": "#111821",
                "neon-purple": "#BF00FF",
                "neon-pink": "#FF007F",
                "electric-blue": "#00FFFF",
                "neon-gold": "#FFD700",
                "mint-green": "#00FFAB",
                "vibrant-cyan": "#00E5FF",
                "superstar": "#9D50FF",
                "neutral-border": "#E5E7EB",
                "text-main": "#000000",
                "text-sub": "#666666",
                "accent-purple": "#a855f7",
                "neutral-ink": "#1a1a1a",
            },
            fontFamily: {
                "display": ["var(--font-sora)", "sans-serif"],
                "body": ["var(--font-inter)", "sans-serif"],
                "korean": ["var(--font-noto-sans-kr)", "sans-serif"],
            },
            borderRadius: {
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1rem",
                "3xl": "1.5rem",
            },
        },
    },
    plugins: [],
};
export default config;
