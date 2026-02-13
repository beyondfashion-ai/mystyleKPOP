# CLAUDE.md — mystyleai MVP v2.1

> AI assistant guide for the **beyondfashion-ai/mystyleKPOP** repository.
> "From Prompt to Stage: Design your idol's stage outfit."

---

## 0. Language Policy (User Defined)

1.  **Communication with User:** Korean (Hangul)
    -   All explanations, chat messages, and questions to the user must be in Korean.
2.  **Code & System Input:** English
    -   Variable names, file names, commit messages, and internal logic must be in English.
3.  **UI Content Strategy:** English + Korean (Hybrid)
    -   **Important Titles & Paragraphs:** Korean (e.g., Page Titles, Main Actions, Key Explanations).
    -   **Detailed Labels/Secondary Text:** English is acceptable, but Korean is preferred for clarity if it's a major element.

---

## 1. Product Vision

**mystyleai** is a platform where KPOP fans design stage outfits using AI, share them in a community gallery, compete via voting/ranking, and the monthly winner receives a real costume manufactured from their design.

### Core Assumptions

- K-POP is driven by organized fandom behavior (goal-setting -> achievement).
- Existing fandom participation (voting, sharing) is strong, but there is no structure where "my creative output competes and connects to reality."

### Strategy: Create / Support / Boost

| Role        | Actions                                           |
| ----------- | ------------------------------------------------- |
| **Creator** | Generate / Save / Publish / Compete               |
| **Supporter** | Like (free vote)                                |
| **Booster** | Boost (Phase 2-A: visibility boost / Phase 2-B: paid vote = 1 ticket) |

### Key Differentiator (R2R: Result to Reality)

The monthly #1 winner's design is manufactured into a real costume and delivered, proving trust through tangible results.

### Product Principles

- Prompts and recipes are **private** (never exposed to other users)
- **No remix/copy** functionality
- All policies (voting, currency, visibility) must be expressible as a **public announcement sentence**
- Conflict will happen: design policies, permissions, and audit logs from day one

### Pay-to-Win Stance

- Currency is defined as "standardized support behavior"
- Like (free) and Boost (currency) are **always displayed and tallied separately**
- Expiration, refund, and conditions are fixed as announcement-ready text

### Repository Details

| Field        | Value                              |
| ------------ | ---------------------------------- |
| Organization | beyondfashion-ai                   |
| Repository   | mystyleKPOP                        |
| Domain       | my-style.ai                       |
| Status       | MVP Development                    |

---

## 2. Technology Stack

### Frontend

| Technology       | Details                          |
| ---------------- | -------------------------------- |
| Framework        | Next.js 14+ (App Router, `src/` directory) |
| Language         | TypeScript                       |
| Styling          | Tailwind CSS                     |
| UI Components    | Shadcn/ui (optional)            |
| State Management | React hooks + Context API        |
| Auth             | Firebase Authentication          |

### Backend

| Technology       | Details                                  |
| ---------------- | ---------------------------------------- |
| Platform         | Firebase (Firestore, Storage, Functions) |
| API Routes       | Next.js Route Handlers (`src/app/api/**/route.ts`) |
| Image Generation | fal.ai API (Flux 2 Pro model)                 |
| Translation      | Google Cloud Translation API             |
| Moderation       | Google Cloud Vision API (SafeSearch)     |

### Deployment

| Technology | Details                  |
| ---------- | ------------------------ |
| Hosting    | Vercel                   |
| Domain     | my-style.ai             |
| CDN        | Vercel Edge Network      |
| Monitoring | Sentry + Firebase Analytics |

---

## 3. Architecture Decisions (MVP)

### Directory Convention

- Use `src/app/` (Next.js official `src` support), not root `app/`.
- API routes live in `src/app/api/**/route.ts` (Route Handlers).

### Security Model: Server-Write Only

- **No client-side Firestore writes.** All mutations go through Next.js API routes.
- Admin role is determined exclusively by **Firebase Custom Claims** (`admin: true`).
- Counters (Like count, Boost count) are processed **atomically on the server** (increment / transaction).

### Like vs Boost Separation

- Like and Boost are **separate fields** in every data model.
- They are **separately displayed** on every UI surface.
- Ranking score formulas must be **publicly documented**.

---

## 4. User Roles & Permissions

| Role            | Generate    | Extra Gen (Credit) | Save Private | Publish | Like | Animate | Boost         |
| --------------- | ----------- | ------------------ | ------------ | ------- | ---- | ------- | ------------- |
| **Guest**       | 1 trial     | No                 | No           | No      | No   | No      | No            |
| **Free**        | 10/day      | Yes (Phase 2+)     | No           | Yes     | Yes  | No      | No            |
| **Superfan Pass** | 10/day    | Yes (Phase 2+)     | Yes          | Yes     | Yes  | Yes     | No            |
| **Booster**     | 10/day      | Yes (Phase 2+)     | Yes          | Yes     | Yes  | Yes     | Yes (Phase 2) |

---

## 5. Information Architecture (Routes)

| Route            | Page              | Description                        |
| ---------------- | ----------------- | ---------------------------------- |
| `/`              | Landing           | Hero CTA + Best Picks (API-driven) + How It Works |
| `/studio`        | Studio            | 4-step generation (IdolType/Concept/Keywords+Hashtags/ImageCount) |
| `/gallery`       | Explore           | Masonry grid + infinite scroll     |
| `/design/[id]`   | Detail            | Full view + Like + Boost + Share + Animate |
| `/ranking`       | Monthly Ranking   | Top 50 + phase-specific score text |
| `/auth/*`        | Auth              | Email/Password login/signup        |
| `/account`       | My Page           | User profile + my designs          |
| `/admin/*`       | Admin Console     | Moderation + operations            |

---

## 6. Project Structure

```
mystyleai/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (main)/
│   │   │   ├── page.tsx                 # Landing page
│   │   │   ├── studio/
│   │   │   │   └── page.tsx             # Generation studio
│   │   │   ├── gallery/
│   │   │   │   └── page.tsx             # Explore (infinite scroll)
│   │   │   ├── design/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Design detail page
│   │   │   ├── ranking/
│   │   │   │   └── page.tsx             # Monthly ranking
│   │   │   └── account/
│   │   │       └── page.tsx             # My page
│   │   ├── admin/
│   │   │   └── page.tsx                 # Admin console
│   │   ├── api/
│   │   │   ├── translate/
│   │   │   │   └── route.ts            # Prompt translation
│   │   │   ├── generate/
│   │   │   │   └── route.ts            # AI image generation
│   │   │   ├── designs/
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts        # Design lookup
│   │   │   ├── like/
│   │   │   │   └── [designId]/
│   │   │   │       └── route.ts        # Like toggle
│   │   │   ├── gallery/
│   │   │   │   └── route.ts            # Gallery listing
│   │   │   └── ranking/
│   │   │       └── route.ts            # Monthly ranking query
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                          # Shared UI components
│   │   ├── studio/
│   │   │   ├── GroupSelect.tsx          # Group/artist selection
│   │   │   ├── ConceptSelect.tsx        # Concept selection
│   │   │   └── KeywordInput.tsx         # Keyword/prompt input
│   │   ├── gallery/
│   │   │   ├── DesignCard.tsx           # Design card
│   │   │   └── FilterBar.tsx            # Filter bar
│   │   └── design/
│   │       ├── ImageViewer.tsx          # Image viewer
│   │       ├── LikeButton.tsx           # Like button
│   │       └── ShareButtons.tsx         # Social share buttons
│   └── lib/
│       ├── firebase/
│       │   ├── config.ts               # Firebase configuration
│       │   ├── admin.ts                # Firebase Admin SDK init
│       │   ├── auth.ts                 # Auth helpers
│       │   ├── firestore.ts            # Firestore helpers
│       │   └── storage.ts              # Storage helpers
│       ├── fal/
│       │   └── client.ts               # fal.ai client
│       ├── translation/
│       │   └── client.ts               # Translation API client
│       └── utils.ts                     # Utility functions
├── functions/
│   ├── src/
│   │   ├── ranking-snapshot.ts          # End-of-month ranking snapshot
│   │   ├── update-like-count.ts         # likeCount sync (atomic)
│   │   └── reset-generation-limits.ts   # Daily limit reset
│   └── package.json
├── docs/
│   ├── BOOTSTRAP_MVP.md                 # Setup & bootstrap guide
│   ├── SECURITY_RULES.md                # Firestore security rules
│   ├── DATA_MODEL.md                    # Full Firestore schema
│   ├── API_CONTRACTS.md                 # API request/response specs
│   └── UX_SPEC_PLAYGROUND.md            # Studio UX specification
├── public/
│   └── images/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md                            # This file
```

---

## 7. Core Pages & Features

### 7.1 Landing Page (`/`)

- Hero section: "당신의 팬심이 현실이 되는 곳" + "지금 바로 디자인하기" CTA
- **BEST PICKS section:** API-driven (`/api/gallery?sort=popular`), top 5 designs
  - 1st place: large card (aspect-4/3) with overlay info
  - 2nd-5th: horizontal scroll cards with rank badges
  - Each card links to `/design/[id]`
  - Empty state when no designs exist
- **"어떻게 진행되나요?" section:** 4-step process cards (프롬프트 입력 → AI 의상 생성 → 커뮤니티 투표 → 실제 의상 제작)
- Footer with brand + navigation links

### 7.2 Studio (`/studio`)

**4-step generation process (form always visible):**

1. **Idol Type:** girlgroup / boygroup / solo (3-column grid)
2. **Concept Style:** 7 concepts (cyber, y2k, highteen, sexy, suit, street + girlcrush for girlgroup only)
3. **Keywords + Hashtags:** Textarea with hashtag chips that append `#tags` directly into text
4. **Image Count:** 1장 / 2장 / 4장 selector

**Preview (appears below form after generation):**
- Tap any image → fullscreen popup
- Checkbox (top-right) to select/deselect images for publish
- First image auto-selected by default
- Multiple images can be published together
- Actions: [결과 지우기] [갤러리에 공개]

**Publish flow:**
- Bottom sheet modal (z-[60], above BottomNav)
- Shows selected images preview + concept tags + optional title/description
- Fixed bottom button: "갤러리에 공개하기"
- Success screen with share buttons (Web Share, X, Link copy, KakaoTalk)

**AI Model:** fal-ai/flux-2/turbo
- Parameters: `guidance_scale: 3.5`, `num_inference_steps: 8`, random seed per image
- Prompt: natural language with randomized pose (10), angle (6), framing (4) per image
- See `docs/UX_SPEC_PLAYGROUND.md` for full specification

### 7.3 Gallery (`/gallery`)

- Masonry grid layout
- Infinite scroll (loads 12 at a time)
- Each card: image, creator handle, Like count, timestamp
- Filters: concept, sort (newest / popular)

### 7.4 Design Detail (`/design/[id]`)

- Large image viewer (representative image selected by creator)
- Like button (login required, 1 per user per design)
- Boost button (Phase 2, displayed separately from Like)
- Share buttons (KakaoTalk, Instagram, X)
- Animate preview (if available)
- Report button (moderation)
- **Prompt/recipe is never shown** to other users

### 7.5 Ranking (`/ranking`)

- Current month's Top 50 designs
- #1 highlighted: "This design will be manufactured into a real costume!"
- Phase-specific score text (Phase 1: Likes only; Phase 2-B: Likes + Boost Votes)
- Winner info submission form (within 7 days after month end)
- Past winner archive
- Countdown timer for remaining days

### 7.6 Account (`/account`)

- User profile (handle, bio, profile image)
- My designs list (private + public)
- Total stats (generations, published, likes received)

### 7.7 Admin Console (`/admin`)

- Requires `admin: true` Custom Claim
- Content moderation queue
- User management (warnings, restrictions, bans)
- Monthly winner confirmation workflow
- Abuse detection logs

### 7.8 Growth Mechanics (Retention & Viral)

- **Daily Streak (Attendance):**
  - Logic: User must cast **3 Votes** daily to receive free credits (not just login).
  - Goal: Habit formation for "Supporter" role.
- **Share-to-Unlock:**
  - Logic: 1 of 4 generated images is blurred or high-res download is locked.
  - Unlock condition: **"Share to Friend"** (creates external link).
  - Goal: Organic viral loop without ad spend.

---

## 8. Monetization Phases

### Phase 1 (MVP): Likes-Based Ranking

- Ranking is determined by Like count only
- All voting is free
- Daily free generation limit: 10. No credit system yet.
- Revenue: none (user acquisition focus)

### Phase 2-A: Free Currency + Visibility Boost + AdSense

- Users earn free currency via missions/ads
- **Google AdSense** ads displayed in Gallery and Studio loading
- **Rewarded Ads**: Watch ad → earn Credits for extra image generations
- Extra generations beyond daily limit (10) cost 1 Credit each
- Boost = visibility enhancement only (does NOT affect ranking score)
- Like and Boost displayed separately
- Revenue: ad-supported + currency education

### Phase 2-B: Paid Currency + Boost Vote

- Paid currency introduced
- **Ads removed or minimized**; free currency discontinued
- **Paid Generation Credits**: Purchase Credits via PayPal
  - Starter: 50 Credits / $0.99
  - Basic: 150 Credits / $2.49
  - Value: 500 Credits / $6.99
  - Pro: 1,200 Credits / $12.99
- Extra generations beyond daily limit (10) cost 1 Credit each
- Boost Vote: 1 currency = 1 vote (directly affects ranking score)
- Like and Boost Vote tallied and displayed separately
- Revenue: currency purchases

### AdSense Policy (Phase 2-A)

- **Gallery page**: Native in-feed ads between design cards (every 8th card)
- **Studio loading**: Display ad during 10-second generation wait
- **Ranking page footer**: Banner ad
- **Never on**: Design detail page (preserves immersive experience)
- AdSense publisher ID stored in environment variable `NEXT_PUBLIC_ADSENSE_PUB_ID`
- Removed or minimized when transitioning to Phase 2-B

---

## 9. Governance & Trust

### Abuse Prevention

- Rate limiting on all API endpoints
- Anomaly detection for voting patterns
- Escalation: warning -> restriction -> ban
- All moderation actions are logged with timestamps

### Monthly Winner Process

1. Month-end deadline (automatic snapshot)
2. Winner confirmation (admin review)
3. Production begins
4. Delivery to winner
5. Winner posts authentication/unboxing
6. Added to Hall of Fame

### Like/Boost Transparency

- Always display Like and Boost counts separately
- Never combine them into a single "score" without public formula
- Score calculation formula published in ranking page footer

---

## 10. Firestore Data Schema

> Full schema details: see `docs/DATA_MODEL.md`

### Collections Overview

| Collection          | Document ID Pattern         | Purpose                    |
| ------------------- | --------------------------- | -------------------------- |
| `designs`           | auto-generated              | All generated designs      |
| `likes`             | `{designId}_{uid}`          | Like records               |
| `generationLimits`  | `{uid}_{YYYY-MM-DD}`        | Daily generation counters  |
| `rankings`          | `monthly_{YYYY-MM}`         | Monthly ranking snapshots  |
| `users`             | Firebase Auth UID           | User profiles & stats      |

---

## 11. API Endpoints

> Full request/response specs: see `docs/API_CONTRACTS.md`

| Method   | Route                        | Auth Required | Description                |
| -------- | ---------------------------- | ------------- | -------------------------- |
| `POST`   | `/api/generate`              | No*           | Generate 1-4 outfit images (fal-ai/flux-2/turbo) |
| `POST`   | `/api/designs/publish`       | Optional      | Publish design with 1-4 images to gallery |
| `GET`    | `/api/designs/[id]`          | No            | Get design detail + creator designs + recommended |
| `POST`   | `/api/like/[designId]`       | Yes           | Toggle like on a design    |
| `GET`    | `/api/like/[designId]`       | No            | Check if user liked a design |
| `GET`    | `/api/gallery`               | No            | List designs (sort, concept, cursor pagination) |
| `GET`    | `/api/ranking`               | No            | Get current month ranking  |
| `GET`    | `/api/community`             | No            | Community feed             |
| `GET`    | `/api/user/stats`            | No            | User design count & total likes |

*Auth not enforced in MVP; generation limits planned for Phase 2.

**Local dev fallback:** When Firebase is not configured, `/api/designs/publish`, `/api/gallery`, and `/api/designs/[id]` fall back to `data/designs.json` (local JSON file).

---

## 12. Environment Variables (`.env.local`)

```bash
# Firebase (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-side only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# fal.ai
FAL_KEY=

# Google Cloud Translation
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_TRANSLATION_KEY=

# Google Cloud Vision (moderation)
GOOGLE_CLOUD_VISION_KEY=

# Next.js
NEXT_PUBLIC_SITE_URL=https://my-style.ai

# Google AdSense (Phase 2-A)
NEXT_PUBLIC_ADSENSE_PUB_ID=
```

**IMPORTANT:**
- Never commit `.env.local` to Git.
- Only commit `.env.example` with empty placeholder values.

---

## 13. UI/UX Guidelines

### Design System

- **Primary Color:** Neon/gradient with KPOP aesthetic (e.g., pink-to-purple)
- **Fonts:** Pretendard (Korean), Inter (English)
- **Spacing:** Tailwind default (4px units)
- **Border Radius:** `rounded-lg` (8px)
- **Shadows:** `shadow-lg`

### Responsive Breakpoints

| Breakpoint | Width          |
| ---------- | -------------- |
| Mobile     | < 768px        |
| Tablet     | 768px ~ 1024px |
| Desktop    | > 1024px       |

### Accessibility

- All buttons must have `aria-label`
- All images must have `alt` text
- Support keyboard navigation (Tab, Enter)

---

## 14. Development Workflow

### Setup

```bash
npx create-next-app@latest mystyleai --typescript --tailwind --app --src-dir
npm install firebase @fal-ai/serverless-client @google-cloud/translate @google-cloud/vision
cp .env.example .env.local
# Fill in actual keys in .env.local
```

### Firebase Setup

1. Create a project in Firebase Console
2. Enable Firestore Database
3. Enable Storage
4. Enable Authentication (Email/Password)
5. Deploy Security Rules (see `docs/SECURITY_RULES.md`)
6. Set admin Custom Claims via Firebase Admin SDK

### Dev Server

```bash
npm run dev
```

### Build & Deploy

```bash
npm run build
vercel --prod
```

### Git Conventions

- **Default branch:** `main`
- **Feature branches:** `feature/<description>`
- **Bug fix branches:** `fix/<description>`
- **Commit messages:** Clear, imperative mood (e.g., "Add studio generation flow")
- **Commit signing:** Enabled (GPG/SSH)

---

## 15. AI Assistant Guidelines

### General Principles

1. **Read before writing** — Always read existing code before proposing changes
2. **Minimal changes** — Make only the changes requested; avoid unnecessary refactoring
3. **No over-engineering** — Keep solutions simple and focused on the task
4. **Security first** — Never commit secrets, credentials, or API keys
5. **Server-write only** — All Firestore mutations go through API routes, never client-side
6. **One task at a time** — Complete one feature fully before moving to the next

### Security Rules for AI

- Never expose user prompts/recipes to other users in any API response
- Always validate auth tokens server-side before mutations
- Use atomic operations for counters (Like count, generation count)
- Admin checks must use Custom Claims, never client-side role fields

### Code Style

- Follow the project's linter/formatter configuration
- Match the style of surrounding code
- Use clear, descriptive names for variables and functions
- Add comments only where logic is non-obvious

### Commit Practices

- Write clear, concise commit messages in imperative mood
- Stage specific files rather than using `git add -A`
- Never commit `.env`, credentials, or large binary files
- Verify changes with `git diff` before committing

### What to Avoid

- Do not add unnecessary dependencies
- Do not modify CI/CD pipelines without explicit permission
- Do not force-push or rewrite shared branch history
- Do not generate or guess URLs
- Do not expose prompts/recipes in gallery or detail views
- Do not combine Like and Boost into a single score without explicit instruction

---

## 16. Companion Documents

| Document                      | Purpose                                    |
| ----------------------------- | ------------------------------------------ |
| `docs/BOOTSTRAP_MVP.md`       | Step-by-step project setup guide           |
| `docs/SECURITY_RULES.md`      | Firestore security rules with explanations |
| `docs/DATA_MODEL.md`          | Full Firestore schema with all fields      |
| `docs/API_CONTRACTS.md`       | Complete API request/response contracts    |
| `docs/UX_SPEC_PLAYGROUND.md`  | Studio page UX specification               |

---

## 17. MVP Success Criteria

### Technical Success

- Login -> Prompt input -> 1 image generated within 5 seconds (4 for paid users)
- Select representative -> Publish -> Appears in gallery -> Others can Like
- Monthly auto-snapshot of Top 50 ranking
- Fully functional on mobile
- Admin can moderate content and confirm winners

### Business Success (3-month target)

| Metric                  | Target        |
| ----------------------- | ------------- |
| Monthly new users       | 5,000         |
| Monthly generations     | 2,000         |
| Published designs       | 600           |
| DAU/MAU activity ratio  | 30%           |

---

## Changelog

| Date       | Change                                                  |
| ---------- | ------------------------------------------------------- |
| 2026-02-10 | Initial CLAUDE.md created for empty repository          |
| 2026-02-10 | Full MVP spec: tech stack, schema, APIs, UI, checklist  |
| 2026-02-11 | v2 rewrite: product vision, roles, phases, governance, security decisions, src/ structure, companion docs |
| 2026-02-12 | v2.1 update: Growth mechanics (Daily Streak, Share-to-Unlock) added |
| 2026-02-12 | v2.2 update: Free tier = 1 image/generation, paid = 4 images. Model upgraded to fal-ai/flux-2-pro with JSON structured prompts |
| 2026-02-13 | v2.3 update: Studio UI finalized — 4-step form (idol/concept/keywords+hashtags/count), form always visible with preview below, multi-image publish, fullscreen popup, pose/angle/framing randomization, fal-ai/flux-2/turbo model. Landing page BEST PICKS section now API-driven from gallery data. Trending Styles removed. Local JSON fallback for dev without Firebase. Docs updated to match implementation. |

---

*Keep this file up to date as the project evolves. When new tools, frameworks, or conventions are adopted, update the relevant sections.*
