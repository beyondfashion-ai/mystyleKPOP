# FRONTEND — Frontend Developer Sub-Agent

> Frontend developer agent for the mystyleKPOP repository.
> Role: UI implementation, styling, SDK integration, API calls, client-side state management.

---

## 1. Role Definition

The FRONTEND agent owns **all client-side code** in the mystyleKPOP project:

- Next.js 14+ App Router pages and layouts
- Tailwind CSS + CSS variable design system
- Firebase Auth client integration
- API Route Handler call patterns
- Responsive layout and accessibility compliance

**Key rule:** No direct Firestore writes from the client. All mutations go through API routes.

---

## 2. CSS Variables — Color System

### 2.1 Global CSS Variables (`src/app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* === Brand Colors === */
    --color-primary: 280 80% 60%;          /* Main purple #9333EA */
    --color-primary-hover: 280 80% 50%;    /* Hover purple #7E22CE */
    --color-primary-light: 280 80% 95%;    /* Light background #F3E8FF */
    --color-secondary: 330 80% 60%;        /* Pink #EC4899 */
    --color-secondary-hover: 330 80% 50%;  /* Hover pink #DB2777 */
    --color-accent: 200 90% 55%;           /* Neon blue #0EA5E9 */

    /* === Gradient Presets === */
    --gradient-brand: linear-gradient(135deg, hsl(280 80% 60%), hsl(330 80% 60%));
    --gradient-card: linear-gradient(180deg, hsl(280 80% 98%), hsl(0 0% 100%));
    --gradient-ranking: linear-gradient(135deg, hsl(45 100% 50%), hsl(30 100% 55%));

    /* === Neutral Colors === */
    --color-bg: 0 0% 100%;                /* Background #FFFFFF */
    --color-bg-secondary: 240 5% 96%;     /* Secondary bg #F4F4F5 */
    --color-bg-tertiary: 240 5% 92%;      /* Tertiary bg #E4E4E7 */
    --color-text: 240 6% 10%;             /* Body text #18181B */
    --color-text-secondary: 240 4% 46%;   /* Secondary text #71717A */
    --color-text-muted: 240 4% 65%;       /* Muted text #A1A1AA */
    --color-border: 240 6% 90%;           /* Border #E4E4E7 */
    --color-border-hover: 240 5% 80%;     /* Border hover */

    /* === Semantic Colors === */
    --color-success: 142 72% 45%;          /* Success #22C55E */
    --color-warning: 38 92% 50%;           /* Warning #F59E0B */
    --color-error: 0 84% 60%;             /* Error #EF4444 */
    --color-info: 200 90% 55%;            /* Info #0EA5E9 */

    /* === Like / Boost Specific === */
    --color-like: 0 84% 60%;              /* Like: red #EF4444 */
    --color-like-active: 0 84% 55%;       /* Like active #DC2626 */
    --color-boost: 45 100% 50%;           /* Boost: gold #EAB308 */
    --color-boost-active: 38 92% 50%;     /* Boost active #F59E0B */

    /* === Spacing & Layout === */
    --header-height: 64px;
    --sidebar-width: 280px;
    --max-content-width: 1280px;
    --card-border-radius: 12px;
    --button-border-radius: 8px;

    /* === Z-Index Scale === */
    --z-dropdown: 50;
    --z-sticky: 100;
    --z-modal-backdrop: 200;
    --z-modal: 300;
    --z-toast: 400;
  }

  .dark {
    --color-bg: 240 10% 4%;               /* Dark bg #09090B */
    --color-bg-secondary: 240 6% 10%;     /* Dark secondary bg #18181B */
    --color-bg-tertiary: 240 5% 16%;      /* Dark tertiary bg #27272A */
    --color-text: 0 0% 98%;               /* Dark text #FAFAFA */
    --color-text-secondary: 240 5% 65%;   /* Dark secondary text */
    --color-text-muted: 240 4% 46%;       /* Dark muted text */
    --color-border: 240 4% 20%;           /* Dark border */
    --color-border-hover: 240 5% 30%;     /* Dark border hover */
  }
}
```

### 2.2 Tailwind Configuration (`tailwind.config.ts`)

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--color-primary))",
          hover: "hsl(var(--color-primary-hover))",
          light: "hsl(var(--color-primary-light))",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-secondary))",
          hover: "hsl(var(--color-secondary-hover))",
        },
        accent: "hsl(var(--color-accent))",
        like: {
          DEFAULT: "hsl(var(--color-like))",
          active: "hsl(var(--color-like-active))",
        },
        boost: {
          DEFAULT: "hsl(var(--color-boost))",
          active: "hsl(var(--color-boost-active))",
        },
      },
      fontFamily: {
        sans: ["var(--font-pretendard)", "var(--font-inter)", "sans-serif"],
        display: ["var(--font-pretendard)", "sans-serif"],
      },
      borderRadius: {
        card: "var(--card-border-radius)",
        button: "var(--button-border-radius)",
      },
      maxWidth: {
        content: "var(--max-content-width)",
      },
      zIndex: {
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        "modal-backdrop": "var(--z-modal-backdrop)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 3. Font Configuration

### 3.1 `next/font` Setup (`src/app/layout.tsx`)

```typescript
import localFont from "next/font/local";
import { Inter } from "next/font/google";

// Pretendard: Primary font for Korean text
const pretendard = localFont({
  src: [
    { path: "../fonts/Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Pretendard-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Pretendard-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Pretendard-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

// Inter: English font (fallback)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

### 3.2 Typography Scale

| Usage | Tailwind Classes | Size | Weight | Line Height |
|-------|-----------------|------|--------|-------------|
| Hero title | `text-4xl md:text-5xl font-bold` | 36px / 48px | 700 | 1.1 |
| Page title | `text-2xl md:text-3xl font-bold` | 24px / 30px | 700 | 1.2 |
| Section heading | `text-xl font-semibold` | 20px | 600 | 1.3 |
| Card title | `text-lg font-medium` | 18px | 500 | 1.4 |
| Body text | `text-base` | 16px | 400 | 1.5 |
| Secondary text | `text-sm text-text-secondary` | 14px | 400 | 1.5 |
| Caption | `text-xs text-text-muted` | 12px | 400 | 1.4 |
| Button (large) | `text-base font-semibold` | 16px | 600 | 1 |
| Button (small) | `text-sm font-medium` | 14px | 500 | 1 |

---

## 4. Page-by-Page Implementation Guide

### 4.1 Landing Page (`/`)

```
┌──────────────────────────────────────────┐
│  Header (Logo + Navigation + Login)       │
├──────────────────────────────────────────┤
│  Hero Section                             │
│  ┌──────────────────────────────────┐    │
│  │  Background: gradient or video/GIF │    │
│  │  "Design your idol's stage outfit" │    │
│  │  [Get Started Free] CTA button     │    │
│  └──────────────────────────────────┘    │
├──────────────────────────────────────────┤
│  Features (3-column grid)                 │
│  [10s Generation] [KPOP-Specialized]      │
│  [Real Costume]                           │
├──────────────────────────────────────────┤
│  Hall of Fame (past winners carousel)     │
├──────────────────────────────────────────┤
│  Social Proof (user count, sample images) │
├──────────────────────────────────────────┤
│  Footer                                   │
└──────────────────────────────────────────┘
```

**Implementation details:**
- Hero background: `object-cover` for responsive handling
- CTA button: apply `--gradient-brand`, hover `scale(1.02)` transition
- Features: `grid grid-cols-1 md:grid-cols-3 gap-6`
- Hall of Fame: `overflow-x-auto snap-x` horizontal scroll
- Social proof: animated counter (count-up on viewport entry)

### 4.2 Studio (`/studio`)

```
┌───────────────────┬───────────────────────┐
│  Input Panel       │  Result Panel          │
│                    │                        │
│  1. Group select   │  [Before: guide text]  │
│  2. Concept select │  [During: skeleton]    │
│  3. Keyword input  │  [After: 2x2 grid]    │
│                    │                        │
│  [Generate] button │  [Select representative]│
│                    │  [Publish][Save][Redo]  │
└───────────────────┴───────────────────────┘
```

**Implementation details:**
- Mobile: vertical stack (input → result)
- Desktop: `grid grid-cols-1 lg:grid-cols-2 gap-6`
- Skeleton UI + progress text during generation
- Representative image selection: click → check overlay + border highlight
- Publish button stays `disabled` until representative image is selected
- Keyword input: detect Korean/Japanese/Chinese → auto-translate via `/api/translate`

### 4.3 Gallery (`/gallery`)

**Implementation details:**
- Masonry grid: CSS `columns` or `react-masonry-css`
- Infinite scroll: `IntersectionObserver` based, loads 12 items per batch
- Card: image + creator handle + like count + timestamp
- Filter bar: concept filter / sort (newest / most popular)
- Skeleton loading: card-shaped placeholder during load
- Empty state: friendly message + CTA to visit studio

### 4.4 Design Detail (`/design/[id]`)

**Implementation details:**
- Image viewer: maintain `aspect-ratio`, support pinch-zoom on mobile
- Like button: heart icon + count, optimistic update on click
- Share buttons: KakaoTalk, Instagram, X (Twitter)
- Animate preview: video player if animation exists (Superfan only)
- Report button: opens modal → sends to `/api/report`
- **NEVER display prompt/recipe to any user other than the creator**

### 4.5 Ranking (`/ranking`)

**Implementation details:**
- Top 3: special styling (gold/silver/bronze + enlarged card)
- Rank 4–50: list format with thumbnail + like count
- #1 highlight text: "This design will be manufactured into a real costume!"
- Countdown timer for days remaining in current month
- Score formula displayed in footer
- Phase-aware: display appropriate score text per monetization phase

### 4.6 Account (`/account`)

**Implementation details:**
- Profile edit: handle, bio, profile image upload
- My designs grid: toggle between public and private
- Stats: total generations, published count, likes received
- Account deletion: confirm modal → calls deletion API

---

## 5. SDK Integration Code

### 5.1 Firebase Auth — Auth Context

```typescript
// src/lib/firebase/auth-context.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 5.2 Firebase Auth — Sign In / Sign Up

```typescript
// src/lib/firebase/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./config";

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential;
}

export async function signOut() {
  return firebaseSignOut(auth);
}
```

### 5.3 Auth Token Helper

```typescript
// src/lib/firebase/get-token.ts
import { auth } from "./config";

export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
```

---

## 6. API Call Patterns

### 6.1 Shared Fetch Wrapper

```typescript
// src/lib/api/client.ts
import { getAuthToken } from "@/lib/firebase/get-token";

interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  requireAuth?: boolean;
}

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, requireAuth = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = await getAuthToken();
    if (!token) throw new Error("Authentication required");
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}
```

### 6.2 Per-Page API Call Examples

```typescript
// === Image Generation ===
const result = await apiClient<GenerateResponse>("/api/generate", {
  method: "POST",
  requireAuth: true,
  body: { groupName, concept, keywords },
});

// === Gallery Listing ===
const gallery = await apiClient<GalleryResponse>(
  `/api/gallery?cursor=${cursor}&limit=12&sort=${sort}`
);

// === Like Toggle ===
const likeResult = await apiClient<LikeResponse>(`/api/like/${designId}`, {
  method: "POST",
  requireAuth: true,
});

// === Design Detail ===
const design = await apiClient<DesignDetail>(`/api/designs/${id}`);

// === Monthly Ranking ===
const ranking = await apiClient<RankingResponse>(
  `/api/ranking?month=${month}`
);
```

### 6.3 Optimistic Update Pattern (Like)

```typescript
// src/hooks/useLike.ts
"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api/client";

export function useLike(designId: string, initialLiked: boolean, initialCount: number) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = useCallback(async () => {
    if (loading) return;

    // Optimistic update
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));
    setLoading(true);

    try {
      await apiClient(`/api/like/${designId}`, {
        method: "POST",
        requireAuth: true,
      });
    } catch {
      // Rollback on failure
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  }, [designId, liked, loading]);

  return { liked, count, toggleLike, loading };
}
```

---

## 7. Responsive Breakpoint Rules

| Device | Tailwind Prefix | Width | Layout Changes |
|--------|----------------|-------|----------------|
| Mobile | (default) | < 768px | Single column, bottom navigation |
| Tablet | `md:` | 768px – 1024px | 2-column grid, collapsed sidebar |
| Desktop | `lg:` | > 1024px | 2–3 column grid, full sidebar |

---

## 8. Accessibility Rules

- All `<button>` elements must have `aria-label`
- All `<img>` elements must have meaningful `alt` text
- Focus visibility: `focus-visible:ring-2 focus-visible:ring-primary`
- Minimum touch target: 44x44px
- Keyboard navigation support: Tab, Enter, Escape
- Never convey information through color alone (pair with icon/text)
- Semantic HTML: use `<main>`, `<nav>`, `<section>`, `<article>` appropriately
- Skip-to-content link at the top of every page

---

## 9. Performance Guidelines

- Images: use `next/image` with `priority` only on LCP images
- Code splitting: `dynamic()` import for heavy components
- Minimize client components: isolate `"use client"` to interactive leaf nodes
- Bundle size: check with `next build` regularly
- Prefetching: `<Link prefetch>` for high-probability navigation targets
- Avoid layout shifts: set explicit `width` and `height` on images

---

*This document is the primary reference for the FRONTEND agent in all client-side implementation tasks.*
