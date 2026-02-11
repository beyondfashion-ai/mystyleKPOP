# CLAUDE.md — mystyleai MVP v2

> AI assistant guide for the **beyondfashion-ai/mystyleKPOP** repository.
> "From Prompt to Stage: Design your idol's stage outfit."

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
| Image Generation | fal.ai API (Flux model)                 |
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

| Role            | Generate | Save Private | Publish | Like | Animate | Boost |
| --------------- | -------- | ------------ | ------- | ---- | ------- | ----- |
| **Guest**       | 1 trial  | No           | No      | No   | No      | No    |
| **Free**        | Daily limit | No        | Yes     | Yes  | No      | No    |
| **Superfan Pass** | Daily limit | Yes     | Yes     | Yes  | Yes     | No    |
| **Booster**     | Daily limit | Yes       | Yes     | Yes  | Yes     | Yes (Phase 2) |

---

## 5. Information Architecture (Routes)

| Route            | Page              | Description                        |
| ---------------- | ----------------- | ---------------------------------- |
| `/`              | Landing           | 3-second comprehension + Studio CTA + Hall of Fame |
| `/studio`        | Studio            | 3-input generation (Group/Concept/Keyword) |
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

- 3-second comprehension: hero with background video/GIF
- "Get Started Free" CTA redirecting to Studio
- Hall of Fame section (past winners with real costume photos)
- Social proof (user count, sample images)
- Features section (10-second generation, KPOP-specialized, real reward)

### 7.2 Studio (`/studio`)

**3-input generation process:**

1. **Group/Artist:** Select target artist or group
2. **Concept:** Stage concept (formal, street, concert, school, high fashion, etc.)
3. **Keywords:** Free-text input; multilingual (Korean, Japanese, Chinese auto-translated)

**Output:**
- 4 images generated within ~10 seconds
- **Mandatory:** User must select 1 representative image before proceeding
- Options: [Publish] [Save Private (Superfan only)] [Animate (Superfan only)] [Regenerate]

**Generation limits:**
- Guest: 1 trial (cannot save or publish)
- Free user: daily limit (configurable, default 20)
- Superfan Pass: daily limit + private save + animate

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

---

## 8. Monetization Phases

### Phase 1 (MVP): Likes-Based Ranking

- Ranking is determined by Like count only
- All voting is free
- Revenue: none (user acquisition focus)

### Phase 2-A: Free Currency + Visibility Boost

- Users earn free currency via missions/ads
- Boost = visibility enhancement only (does NOT affect ranking score)
- Like and Boost displayed separately
- Revenue: ad-supported

### Phase 2-B: Paid Currency + Boost Vote

- Paid currency introduced
- Ads removed or minimized; free currency discontinued
- Boost Vote: 1 currency = 1 vote (directly affects ranking score)
- Like and Boost Vote tallied and displayed separately
- Revenue: currency purchases

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
| `POST`   | `/api/translate`             | No            | Translate prompt to English |
| `POST`   | `/api/generate`              | Yes*          | Generate 4 outfit images   |
| `GET`    | `/api/designs/[id]`          | No            | Get design detail          |
| `POST`   | `/api/like/[designId]`       | Yes           | Toggle like on a design    |
| `GET`    | `/api/gallery`               | No            | List designs with filters  |
| `GET`    | `/api/ranking/monthly`       | No            | Get current month ranking  |

*Guest gets 1 trial without auth; subsequent calls require login.

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

- Login -> Prompt input -> 4 images generated within 10 seconds
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

<!-- OMC:START -->
<!-- OMC:VERSION:1.0.0 -->

## 18. Multi-Agent Orchestration (OMC)

This project uses an oh-my-claudecode-inspired multi-agent orchestration system for Claude Code.
Specialized agents coordinate to complete complex tasks accurately and efficiently.

### Operating Principles

- Delegate specialized or tool-heavy work to the most appropriate agent.
- Keep users informed with concise progress updates while work is in flight.
- Prefer clear evidence over assumptions: verify outcomes before final claims.
- Choose the lightest-weight path that preserves quality (direct action or agent).
- Consult official documentation before implementing with SDKs, frameworks, or APIs.

### Delegation Rules

Use delegation when it improves quality, speed, or correctness:
- Multi-file implementations, refactors, debugging, reviews, planning, research, and verification.
- Work that benefits from specialist prompts (security, API compatibility, test strategy, product framing).
- Independent tasks that can run in parallel.

Work directly only for trivial operations where delegation adds disproportionate overhead.

### Model Routing

Pass `model` on Task calls to match complexity:
- `haiku`: quick lookups, lightweight scans, narrow checks
- `sonnet`: standard implementation, debugging, reviews
- `opus`: architecture, deep analysis, complex refactors

### Agent Catalog

Agents are defined in `.claude/agents/`. Use `general-purpose` subagent_type with agent prompt context.

**Build/Analysis Lane:**
- `explore` (haiku): codebase discovery, symbol/file mapping
- `analyst` (opus): requirements clarity, acceptance criteria, hidden constraints
- `planner` (opus): task sequencing, execution plans, risk flags
- `architect` (opus): system design, boundaries, interfaces, long-horizon tradeoffs
- `debugger` (sonnet): root-cause analysis, regression isolation, failure diagnosis
- `executor` (sonnet): code implementation, refactoring, feature work
- `deep-executor` (opus): complex autonomous goal-oriented tasks
- `verifier` (sonnet): completion evidence, claim validation, test adequacy

**Review Lane:**
- `code-reviewer` (opus): comprehensive review across concerns
- `security-reviewer` (opus): vulnerabilities, trust boundaries, authn/authz

**Domain Specialists:**
- `test-engineer` (sonnet): test strategy, coverage, flaky-test hardening
- `build-fixer` (sonnet): build/toolchain/type failures
- `designer` (sonnet): UX/UI architecture, interaction design, KPOP aesthetic
- `git-master` (sonnet): commit strategy, history hygiene

**Product Lane:**
- `product-manager` (sonnet): problem framing, personas/JTBD, PRDs

### Agent Compositions

Feature Development:
  `analyst` -> `planner` -> `executor` -> `test-engineer` -> `code-reviewer` -> `verifier`

Bug Investigation:
  `explore` + `debugger` + `executor` + `test-engineer` + `verifier`

Code Review:
  `code-reviewer` + `security-reviewer`

Product Discovery:
  `product-manager` + `analyst` + `planner`

### Execution Modes (Magic Keywords)

Type these keywords in your prompt to activate modes:

| Keyword | Mode | Description |
|---------|------|-------------|
| `autopilot` | Autopilot | Full autonomous execution from idea to working code |
| `ralph` | Persistent | Self-continuing loop until task is verified complete |
| `ultrawork` / `ulw` | Parallel | Maximum parallelism with parallel agent orchestration |
| `ecomode` / `eco` | Token-efficient | Uses haiku and sonnet to minimize token usage |
| `plan this` | Planning | Strategic planning interview before implementation |
| `ultrathink` | Deep thinking | Extended reasoning for complex analysis |
| `stopomc` | Cancel | Stop all active modes and clear state |

### Verification Protocol

Verify before claiming completion:
- Small changes (<5 files): verifier with `model="haiku"`
- Standard changes: verifier with `model="sonnet"`
- Large or security changes (>20 files): verifier with `model="opus"`

### Context Persistence

Use `<remember>info</remember>` to persist information across context compaction (7 days).
Use `<remember priority>info</remember>` for permanent persistence (loaded every session start).

### Hooks System

Hooks are configured in `.claude/settings.json`:
- **UserPromptSubmit**: Keyword detection for mode activation
- **SessionStart**: Restore persistent modes, load notepad priority context
- **PreToolUse**: Delegation notices for source file edits
- **PostToolUse**: Process `<remember>` tags from agent output
- **Stop**: Persistent mode continuation enforcement

### State Management

OMC state lives in `.omc/`:
- `.omc/state/` - Mode state files (ralph, autopilot, ultrawork, ecomode)
- `.omc/plans/` - Work plans
- `.omc/drafts/` - Drafts and notes
- `.omc/research/` - Research outputs
- `.omc/logs/` - Audit logs
- `.omc/notepad.md` - Session memory (priority context + working memory)

<!-- OMC:END -->

---

## Changelog

| Date       | Change                                                  |
| ---------- | ------------------------------------------------------- |
| 2026-02-10 | Initial CLAUDE.md created for empty repository          |
| 2026-02-10 | Full MVP spec: tech stack, schema, APIs, UI, checklist  |
| 2026-02-11 | v2 rewrite: product vision, roles, phases, governance, security decisions, src/ structure, companion docs |
| 2026-02-11 | Added OMC multi-agent orchestration: 14 agents, hooks, execution modes, state management |

---

*Keep this file up to date as the project evolves. When new tools, frameworks, or conventions are adopted, update the relevant sections.*
