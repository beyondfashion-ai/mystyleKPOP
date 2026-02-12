# FRONTEND — Frontend Developer Sub-Agent

> mystyleKPOP 프론트엔드 개발자 에이전트
> 역할: UI 구현, 스타일링, SDK 연동, API 호출, 클라이언트 상태 관리

---

## 1. 역할 정의

FRONTEND 에이전트는 mystyleKPOP의 **모든 클라이언트 사이드 코드**를 담당한다.

- Next.js App Router 기반 페이지/레이아웃 구현
- Tailwind CSS + CSS 변수 기반 디자인 시스템 적용
- Firebase Auth 클라이언트 연동
- API Route Handler 호출 패턴 구현
- 반응형 레이아웃 및 접근성 보장

---

## 2. CSS 변수 — 컬러 시스템

### 2.1 글로벌 CSS 변수 (`src/app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* === Brand Colors === */
    --color-primary: 280 80% 60%;          /* 메인 퍼플 #9333EA */
    --color-primary-hover: 280 80% 50%;    /* 호버 #7E22CE */
    --color-primary-light: 280 80% 95%;    /* 연한 배경 #F3E8FF */
    --color-secondary: 330 80% 60%;        /* 핑크 #EC4899 */
    --color-secondary-hover: 330 80% 50%;  /* 핑크 호버 #DB2777 */
    --color-accent: 200 90% 55%;           /* 네온 블루 #0EA5E9 */

    /* === Gradient Presets === */
    --gradient-brand: linear-gradient(135deg, hsl(280 80% 60%), hsl(330 80% 60%));
    --gradient-card: linear-gradient(180deg, hsl(280 80% 98%), hsl(0 0% 100%));
    --gradient-ranking: linear-gradient(135deg, hsl(45 100% 50%), hsl(30 100% 55%));

    /* === Neutral Colors === */
    --color-bg: 0 0% 100%;                /* 배경 #FFFFFF */
    --color-bg-secondary: 240 5% 96%;     /* 보조 배경 #F4F4F5 */
    --color-bg-tertiary: 240 5% 92%;      /* 3차 배경 #E4E4E7 */
    --color-text: 240 6% 10%;             /* 본문 텍스트 #18181B */
    --color-text-secondary: 240 4% 46%;   /* 보조 텍스트 #71717A */
    --color-text-muted: 240 4% 65%;       /* 약한 텍스트 #A1A1AA */
    --color-border: 240 6% 90%;           /* 테두리 #E4E4E7 */
    --color-border-hover: 240 5% 80%;     /* 테두리 호버 */

    /* === Semantic Colors === */
    --color-success: 142 72% 45%;          /* 성공 #22C55E */
    --color-warning: 38 92% 50%;           /* 경고 #F59E0B */
    --color-error: 0 84% 60%;             /* 에러 #EF4444 */
    --color-info: 200 90% 55%;            /* 정보 #0EA5E9 */

    /* === Like / Boost Specific === */
    --color-like: 0 84% 60%;              /* 좋아요: 레드 #EF4444 */
    --color-like-active: 0 84% 55%;       /* 좋아요 활성 #DC2626 */
    --color-boost: 45 100% 50%;           /* 부스트: 골드 #EAB308 */
    --color-boost-active: 38 92% 50%;     /* 부스트 활성 #F59E0B */

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
    --color-bg: 240 10% 4%;               /* 다크 배경 #09090B */
    --color-bg-secondary: 240 6% 10%;     /* 다크 보조 배경 #18181B */
    --color-bg-tertiary: 240 5% 16%;      /* 다크 3차 배경 #27272A */
    --color-text: 0 0% 98%;               /* 다크 텍스트 #FAFAFA */
    --color-text-secondary: 240 5% 65%;   /* 다크 보조 텍스트 */
    --color-text-muted: 240 4% 46%;       /* 다크 약한 텍스트 */
    --color-border: 240 4% 20%;           /* 다크 테두리 */
    --color-border-hover: 240 5% 30%;     /* 다크 테두리 호버 */
  }
}
```

### 2.2 Tailwind 설정 (`tailwind.config.ts`)

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

## 3. 폰트 설정

### 3.1 `next/font` 설정 (`src/app/layout.tsx`)

```typescript
import localFont from "next/font/local";
import { Inter } from "next/font/google";

// Pretendard: 한국어 기본 폰트
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

// Inter: 영문 폰트 (fallback)
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

### 3.2 타이포그래피 스케일

| 용도 | 클래스 | 크기 | 굵기 | 행간 |
|------|--------|------|------|------|
| 히어로 제목 | `text-4xl md:text-5xl font-bold` | 36px / 48px | 700 | 1.1 |
| 페이지 제목 | `text-2xl md:text-3xl font-bold` | 24px / 30px | 700 | 1.2 |
| 섹션 제목 | `text-xl font-semibold` | 20px | 600 | 1.3 |
| 카드 제목 | `text-lg font-medium` | 18px | 500 | 1.4 |
| 본문 | `text-base` | 16px | 400 | 1.5 |
| 보조 텍스트 | `text-sm text-text-secondary` | 14px | 400 | 1.5 |
| 캡션 | `text-xs text-text-muted` | 12px | 400 | 1.4 |
| 버튼 (대) | `text-base font-semibold` | 16px | 600 | 1 |
| 버튼 (소) | `text-sm font-medium` | 14px | 500 | 1 |

---

## 4. 페이지별 구현 가이드

### 4.1 랜딩 페이지 (`/`)

```
┌─────────────────────────────────────────┐
│  Header (로고 + 네비게이션 + 로그인)        │
├─────────────────────────────────────────┤
│  Hero Section                            │
│  ┌─────────────────────────────────┐     │
│  │  배경: 그라디언트 or 비디오/GIF      │     │
│  │  "나만의 아이돌 무대의상을 디자인하세요" │     │
│  │  [시작하기] CTA 버튼               │     │
│  └─────────────────────────────────┘     │
├─────────────────────────────────────────┤
│  Features (3-column grid)                │
│  [10초 생성] [KPOP 특화] [실물 제작]       │
├─────────────────────────────────────────┤
│  Hall of Fame (이전 우승작 캐러셀)         │
├─────────────────────────────────────────┤
│  Social Proof (사용자 수, 샘플 이미지)     │
├─────────────────────────────────────────┤
│  Footer                                 │
└─────────────────────────────────────────┘
```

**핵심 구현 사항:**
- Hero 배경은 `object-cover`로 반응형 처리
- CTA 버튼은 `--gradient-brand` 적용, 호버 시 scale(1.02) 트랜지션
- Features는 `grid grid-cols-1 md:grid-cols-3 gap-6`
- Hall of Fame은 `overflow-x-auto snap-x` 기반 가로 스크롤

### 4.2 스튜디오 (`/studio`)

```
┌──────────────────┬──────────────────────┐
│  Input Panel      │  Result Panel         │
│                   │                       │
│  1. 그룹 선택     │  [생성 전: 안내 텍스트]  │
│  2. 컨셉 선택     │  [생성 중: 스켈레톤]     │
│  3. 키워드 입력    │  [생성 후: 2x2 그리드]  │
│                   │                       │
│  [생성하기] 버튼   │  [대표 이미지 선택]      │
│                   │  [게시] [저장] [재생성]  │
└──────────────────┴──────────────────────┘
```

**핵심 구현 사항:**
- 모바일: 세로 스택 (입력 → 결과)
- 데스크톱: `grid grid-cols-1 lg:grid-cols-2 gap-6`
- 이미지 생성 중 스켈레톤 UI + 진행 텍스트
- 대표 이미지 선택: 클릭 시 체크 오버레이 + 보더 하이라이트
- 게시 버튼은 대표 이미지 선택 전까지 `disabled`

### 4.3 갤러리 (`/gallery`)

**핵심 구현 사항:**
- Masonry 그리드: CSS `columns` 또는 `react-masonry-css` 활용
- 무한 스크롤: `IntersectionObserver` 기반
- 카드: 이미지 + 작성자 핸들 + 좋아요 수 + 타임스탬프
- 필터 바: 컨셉 / 정렬 (최신순/인기순)
- 스켈레톤 로딩: 카드 형태의 플레이스홀더

### 4.4 디자인 상세 (`/design/[id]`)

**핵심 구현 사항:**
- 이미지 뷰어: `aspect-ratio` 유지, 확대/축소 지원
- 좋아요 버튼: 하트 아이콘 + 카운트, 클릭 시 즉시 UI 반영 (낙관적 업데이트)
- 공유 버튼: 카카오톡, 인스타그램, X
- **프롬프트/레시피 절대 표시 금지**

### 4.5 랭킹 (`/ranking`)

**핵심 구현 사항:**
- Top 3: 특별 스타일링 (골드/실버/브론즈 + 큰 카드)
- 4~50위: 리스트 형태
- 1위 하이라이트 문구: "이 디자인이 실물 의상으로 제작됩니다!"
- 남은 일수 카운트다운 타이머
- 점수 산출 공식 하단 표기

### 4.6 어카운트 (`/account`)

**핵심 구현 사항:**
- 프로필 편집 (핸들, 바이오, 프로필 이미지)
- 내 디자인 그리드 (공개 + 비공개 구분)
- 통계: 총 생성 수, 게시 수, 받은 좋아요 수

---

## 5. SDK 연동 코드

### 5.1 Firebase Auth — 인증 컨텍스트

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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

### 5.2 Firebase Auth — 로그인/회원가입

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

### 5.3 Auth Token 헬퍼

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

## 6. API 호출 패턴

### 6.1 공통 Fetch 래퍼

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

### 6.2 페이지별 API 호출 예시

```typescript
// === 이미지 생성 ===
const result = await apiClient<GenerateResponse>("/api/generate", {
  method: "POST",
  requireAuth: true,
  body: { groupName, concept, keywords },
});

// === 갤러리 조회 ===
const gallery = await apiClient<GalleryResponse>(
  `/api/gallery?cursor=${cursor}&limit=12&sort=${sort}`
);

// === 좋아요 토글 ===
const likeResult = await apiClient<LikeResponse>(`/api/like/${designId}`, {
  method: "POST",
  requireAuth: true,
});

// === 디자인 상세 ===
const design = await apiClient<DesignDetail>(`/api/designs/${id}`);

// === 랭킹 조회 ===
const ranking = await apiClient<RankingResponse>(
  `/api/ranking?month=${month}`
);
```

### 6.3 낙관적 업데이트 패턴 (좋아요)

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

    // 낙관적 업데이트
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));
    setLoading(true);

    try {
      await apiClient(`/api/like/${designId}`, {
        method: "POST",
        requireAuth: true,
      });
    } catch {
      // 실패 시 롤백
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

## 7. 반응형 브레이크포인트 규칙

| 기기 | Tailwind 접두사 | 기준 너비 | 주요 레이아웃 변경 |
|------|----------------|-----------|------------------|
| 모바일 | (기본) | < 768px | 단일 컬럼, 하단 네비게이션 |
| 태블릿 | `md:` | 768px ~ 1024px | 2컬럼 그리드, 사이드바 축소 |
| 데스크톱 | `lg:` | > 1024px | 2~3컬럼 그리드, 풀 사이드바 |

---

## 8. 접근성 규칙

- 모든 `<button>`에 `aria-label` 필수
- 모든 `<img>`에 의미 있는 `alt` 텍스트 필수
- 포커스 가시성: `focus-visible:ring-2 focus-visible:ring-primary`
- 터치 타겟 최소 44x44px
- 키보드 네비게이션 (Tab, Enter, Escape) 지원
- 색상만으로 정보를 전달하지 않기 (아이콘/텍스트 병행)

---

## 9. 성능 가이드라인

- 이미지: `next/image` 사용, `priority` 속성은 LCP 이미지에만 적용
- 코드 분할: `dynamic()` import로 무거운 컴포넌트 지연 로딩
- 클라이언트 컴포넌트 최소화: `"use client"` 가 필요한 부분만 분리
- 번들 사이즈: 정기적으로 `next build` 후 사이즈 확인

---

*이 문서는 FRONTEND 에이전트가 모든 클라이언트 사이드 구현 시 참조하는 기본 규칙이다.*
