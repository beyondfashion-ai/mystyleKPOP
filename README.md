<div align="center">

# MyStyle AI — K-POP Stage Outfit Design Platform

### *From Prompt to Stage: Design Your Idol's Stage Outfit*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A platform where K-POP fans design stage outfits using AI, share them in a community gallery, and compete through voting — with the monthly winner's design manufactured into a real costume.

[Live Site](https://my-style.ai) · [Documentation](#-documentation) · [Report Bug](https://github.com/beyondfashion-ai/mystyleKPOP/issues)

</div>

---

## What is MyStyle AI?

MyStyle AI is an **AI-powered fashion design platform** built for the K-POP fandom. Fans describe their vision in a few keywords, and the AI generates stage outfit concepts in seconds. Designs are published to a community gallery where others can vote, and the top-ranked design each month gets produced as a real costume.

### Core Loop

| Role | Action |
|:---:|:---|
| **Creator** | Design stage outfits via AI prompts and publish to the gallery |
| **Supporter** | Vote (Like / Superstar) on favorite designs to boost rankings |

### Key Feature: Result to Reality (R2R)

The #1 monthly-ranked design is manufactured into a real stage costume by a professional K-POP costume production team — turning fan creativity into something tangible.

---

## Tech Stack

| Layer | Technology | Details |
|:---|:---|:---|
| **Framework** | Next.js 16 | App Router, `src/` directory structure |
| **Language** | TypeScript 5.9 | Strict typing across the entire codebase |
| **Styling** | Tailwind CSS 4 | Utility-first CSS with custom design tokens |
| **Animation** | Framer Motion | Page transitions and micro-interactions |
| **Auth & DB** | Firebase 12 | Authentication, Firestore, Cloud Storage |
| **AI Image Generation** | [fal.ai](https://fal.ai) | Flux 2 Turbo model for outfit generation |
| **AI Stylist** | Google Gemini 2.0 Flash | Virtual stylist feedback with Google Search Grounding |
| **Translation** | Google Cloud Translation | Korean ↔ English prompt translation |
| **Deployment** | Vercel | Edge Network CDN, automatic previews |
| **Icons** | Lucide React | Consistent icon system |

---

## Architecture

### Server-Write Only

All data mutations go through Next.js API Route Handlers — **no client-side Firestore writes**. This ensures data integrity, atomic counter operations, and centralized validation.

```
Client (React) → API Route (Next.js) → Firestore / Storage / External APIs
```

### AI Generation Pipeline

```
User Input (idol type, concept, keywords)
  → Prompt Construction (pose/angle/framing randomization)
    → fal.ai Flux 2 Turbo (image generation)
      → AI Stylist Feedback (Gemini 2.0 Flash + Search Grounding)
        → Publish to Gallery
```

### Security

- Admin privileges via **Firebase Custom Claims** (`admin: true`), never client-side role fields
- Like/Boost counters processed **atomically** on the server (Firestore transactions)
- User prompts and generation recipes are **private** — never exposed in API responses

---

## Project Structure

```
mystyleKPOP/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page (hero + monthly ranking + journey)
│   │   ├── layout.tsx                  # Root layout
│   │   ├── studio/page.tsx             # AI outfit generation studio
│   │   ├── gallery/page.tsx            # Community design gallery (masonry + infinite scroll)
│   │   ├── design/[id]/page.tsx        # Design detail (voting, stylist feedback, share)
│   │   ├── ranking/page.tsx            # Monthly ranking (Top 50)
│   │   ├── community/page.tsx          # Community feed
│   │   ├── mypage/page.tsx             # User profile & designs
│   │   ├── login/page.tsx              # Authentication
│   │   ├── onboarding/page.tsx         # Post-signup preference survey
│   │   ├── about/page.tsx              # About the platform
│   │   ├── simulation/page.tsx         # Admin: agent simulation
│   │   ├── terms/page.tsx              # Terms of service
│   │   ├── privacy/page.tsx            # Privacy policy
│   │   ├── refund/page.tsx             # Refund policy
│   │   ├── security/page.tsx           # Security policy
│   │   ├── ai-policy/page.tsx          # AI content policy
│   │   ├── community-guidelines/page.tsx # Community guidelines
│   │   └── api/                        # Server-side API routes (see below)
│   ├── components/
│   │   ├── Header.tsx                  # Top navigation with search & notifications
│   │   ├── BottomNav.tsx               # Mobile bottom navigation
│   │   ├── SearchOverlay.tsx           # Full-screen search overlay
│   │   ├── NotificationDropdown.tsx    # Real-time notification dropdown
│   │   ├── CheeringBadge.tsx           # "@user cheers for @idol" badge
│   │   ├── StylistFeedbackCard.tsx     # AI Virtual Stylist tab UI
│   │   ├── LegalPageLayout.tsx         # Shared layout for legal pages
│   │   └── ads/AdBanner.tsx            # Ad placement component
│   ├── context/
│   │   └── AuthContext.tsx             # Firebase auth state provider
│   ├── data/
│   │   ├── concept-styles.ts           # Style archetype definitions
│   │   └── onboarding-data.ts          # Onboarding survey config
│   └── lib/
│       ├── firebase.ts                 # Firebase client SDK init
│       ├── firebase-admin.ts           # Firebase Admin SDK init
│       ├── auth-helpers.ts             # Auth utility functions
│       ├── stylist-personas.ts         # 4 AI stylist character definitions & system prompts
│       ├── simulation-config.ts        # Agent persona config for simulation
│       ├── group-aliases.ts            # Group name alias mapping
│       └── tag-constants.ts            # Tag system constants
├── agents/                             # Specialist agent guides (12 agents)
├── docs/                               # Technical documentation
└── public/                             # Static assets
```

---

## API Routes

All routes live under `src/app/api/` as Next.js Route Handlers.

| Method | Route | Description |
|:---|:---|:---|
| `POST` | `/api/generate` | Generate 1–4 outfit images via fal.ai Flux 2 Turbo |
| `POST` | `/api/designs/publish` | Publish design with selected images to gallery |
| `GET` | `/api/designs/[id]` | Design detail + creator info + recommendations |
| `POST` | `/api/designs/[id]/comments` | Add comment to a design |
| `POST` | `/api/like/[designId]` | Toggle like on a design |
| `POST` | `/api/boost/[designId]` | Superstar boost (weekly cooldown, 10× weight) |
| `GET` | `/api/gallery` | Paginated gallery listing (sort, concept filter, cursor) |
| `GET` | `/api/ranking` | Monthly/weekly ranking query |
| `GET` | `/api/community` | Community feed |
| `GET` | `/api/notifications` | User notification list |
| `POST` | `/api/stylist/feedback` | AI Stylist feedback (Gemini 2.0 Flash + Search Grounding) |
| `POST` | `/api/stylist/refine-prompt` | AI-assisted prompt refinement |
| `GET` | `/api/tags/popular` | Popular user-generated tags |
| `GET` | `/api/tags/search` | Tag search |
| `GET` | `/api/tags/suggest` | Tag autocomplete suggestions |
| `GET` | `/api/user/stats` | User design count & total likes |
| `GET` | `/api/user/personalization` | User preference data |
| `POST` | `/api/simulate/agent` | Admin: run agent simulation |
| `POST` | `/api/admin/setup` | Admin: initial setup |

---

## Key Features

### Studio — AI Outfit Generation

4-step generation flow:
1. **Idol Type** — Girl group / Boy group / Solo
2. **Concept Style** — 7 style archetypes (Cyber, Y2K, High Teen, Sexy, Suit, Street, Girl Crush)
3. **Keywords + Hashtags** — Free-text with hashtag chip input
4. **Image Count** — 1 / 2 / 4 images per generation

Each image is generated with randomized pose (10 variants), camera angle (6), and framing (4) for variety. After generation, an **AI Virtual Stylist** provides feedback from 4 fictional creative director personas using Gemini 2.0 Flash with real-time trend references via Google Search Grounding.

### Gallery — Community Showcase

- Masonry grid layout with infinite scroll (12 items per page)
- Filter by concept, sort by newest or popular
- Like voting (1 per user per design)

### Ranking — Monthly Competition

- Top 50 designs ranked monthly
- Score formula: `likeCount + (superstarCount × 10)`
- Superstar: 1 per user per design per week (global cooldown)
- Like and Superstar counts always displayed separately

### AI Virtual Stylist

4 fictional former creative directors from major agencies, each with a distinct style philosophy:

| Stylist | Stylehouse | Style DNA |
|:---|:---|:---|
| Cha Ha-eun | NOVA | Neo-Culture, Chrome, Y3K |
| Yoon Si-hyuk | ONYX | Dark Luxury, Power Shoulder |
| Seo Yu-jin | LORE | Retro-Futurism, Narrative Wear |
| Han Do-yoon | PRISM | Color Blocking, Sporty-Chic |

Powered by Gemini 2.0 Flash with Google Search Grounding for real-time trend context. Includes dual-layer naming for IP protection and an output filter for artist name sanitization.

### Notification System

Real-time alerts for likes, boosts, and other interactions via the header notification dropdown.

### User-Generated Tagging (UGC)

Users freely tag designs with group/artist names. The platform aggregates and surfaces popular tags — no pre-defined artist lists.

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Firebase** project — [console.firebase.google.com](https://console.firebase.google.com)
- **fal.ai** API key — [fal.ai](https://fal.ai)
- **Google Gemini** API key (for AI Stylist)

### Installation

```bash
# Clone the repository
git clone https://github.com/beyondfashion-ai/mystyleKPOP.git
cd mystyleKPOP

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Firebase (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-side)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# fal.ai
FAL_KEY=

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_TRANSLATION_KEY=

# Google Gemini (AI Virtual Stylist)
GOOGLE_GEMINI_API_KEY=
```

> **Never commit `.env.local` to Git.** Only `.env.example` with empty values is tracked.

**Local dev fallback:** When Firebase is not configured, publish, gallery, and design detail APIs fall back to a local JSON file (`data/designs.json`).

---

## Documentation

| Document | Description |
|:---|:---|
| [`BOOTSTRAP_MVP.md`](docs/BOOTSTRAP_MVP.md) | Step-by-step project setup guide |
| [`DATA_MODEL.md`](docs/DATA_MODEL.md) | Firestore database schema |
| [`API_CONTRACTS.md`](docs/API_CONTRACTS.md) | API request/response specifications |
| [`SECURITY_RULES.md`](docs/SECURITY_RULES.md) | Firestore security rules |
| [`UX_SPEC_PLAYGROUND.md`](docs/UX_SPEC_PLAYGROUND.md) | Studio UX specification |
| [`GUIDELINES_2026-02-15.md`](docs/GUIDELINES_2026-02-15.md) | Live policy snapshot (Superstar, ranking, UI rules) |
| [`TODO.md`](docs/TODO.md) | Remaining tasks checklist |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Conventions

- **Branch naming**: `feature/<description>`, `fix/<description>`
- **Commit messages**: Imperative mood (e.g., "Add studio generation flow")
- **Default branch**: `main`
- **Security**: All Firestore mutations via API routes, never client-side

---

## License

This project is licensed under the ISC License.

---

<div align="center">

**Made with passion by [Beyond Fashion AI](https://github.com/beyondfashion-ai)**

</div>
