<div align="center">

# ✨ MyStyle AI — K-POP Fan Fashion Platform

### *From Prompt to Stage: Design Your Idol's Stage Outfit*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

**K-POP 팬들이 AI로 아이돌 무대 의상을 디자인하고, 투표하고, 실제 제작까지 연결하는 플랫폼**

[🚀 Live Demo](https://my-style.ai) · [📖 Documentation](#-documentation) · [🐛 Report Bug](https://github.com/beyondfashion-ai/mystyleKPOP/issues)

</div>

---

## 🎯 What is MyStyle AI?

MyStyle AI는 K-POP 팬덤의 조직적 참여 행동을 활용한 **AI 기반 패션 디자인 플랫폼**입니다.

팬들은 텍스트 프롬프트 몇 줄만으로 아이돌의 무대 의상을 디자인하고, 갤러리에 공유하며, 커뮤니티 투표를 통해 경쟁합니다. **월간 1위 디자인은 실제 의상으로 제작**되어 아티스트/소속사에 전달됩니다.

### 💡 Core Concept: Create → Support → Boost

| Role | Description |
|:---:|:---|
| 🎨 **Creator** | AI 프롬프트로 무대 의상을 디자인하고 대회에 출품 |
| ❤️ **Supporter** | 마음에 드는 디자인에 좋아요 투표로 응원 |
| ⭐ **Booster** | 크레딧으로 좋아하는 디자인의 노출을 극대화 |

### 🏆 R2R (Result to Reality)

> 월간 랭킹 1위 디자인이 **실제 의상으로 제작**됩니다.  
> 말이 아닌 결과로 플랫폼 신뢰를 입증합니다.

---

## ⚡ Tech Stack

| Layer | Technology |
|:---|:---|
| **Framework** | Next.js 16 (App Router, `src/` directory) |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion |
| **Auth & DB** | Firebase Auth · Firestore · Storage |
| **AI Generation** | [fal.ai](https://fal.ai) (Flux 2 Pro) |
| **Payment** | PayPal (Phase 2-B) |
| **Deployment** | Vercel |
| **Icons** | Lucide React |

---

## 🏗️ Project Structure

```
mystyleKPOP/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 🏠 Landing page
│   │   ├── studio/               # 🎨 AI outfit generation studio
│   │   ├── gallery/              # 🖼️ Community design gallery
│   │   ├── design/[id]/          # 🔍 Design detail & voting
│   │   ├── ranking/              # 🏆 Monthly ranking
│   │   ├── community/            # 💬 Community
│   │   ├── mypage/               # 👤 My page
│   │   ├── login/                # 🔐 Authentication
│   │   └── api/                  # ⚙️ Server-side API routes
│   │       ├── generate/         #    AI image generation
│   │       ├── translate/        #    Prompt translation
│   │       ├── like/             #    Like toggle
│   │       ├── gallery/          #    Gallery listing
│   │       └── ranking/          #    Ranking query
│   ├── components/               # 🧩 Reusable UI components
│   ├── context/                  # 🔄 React Context providers
│   ├── hooks/                    # 🪝 Custom React hooks
│   ├── lib/                      # 📚 Firebase, fal.ai, utilities
│   └── types/                    # 📝 TypeScript type definitions
├── docs/                         # 📖 Technical documentation
├── ui design sample/             # 🎨 UI/UX design references
└── public/                       # 🖼️ Static assets
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Firebase** project ([console.firebase.google.com](https://console.firebase.google.com))
- **fal.ai** API key ([fal.ai](https://fal.ai))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/beyondfashion-ai/mystyleKPOP.git
cd mystyleKPOP

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual API keys

# 4. Run development server
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
```

> ⚠️ **Never commit `.env.local` to Git.** Only `.env.example` with empty values is tracked.

---

## 📱 Features

### 🎨 Studio — AI Outfit Generation
- 3단계 입력: **그룹/아티스트** → **컨셉** → **키워드**
- fal.ai Flux 2 Pro 모델로 ~5초 내 이미지 생성
- 대표 이미지 선택 후 갤러리에 출품

### 🖼️ Gallery — Community Showcase
- Masonry 그리드 레이아웃 + 무한 스크롤
- 컨셉별 필터 & 정렬 (최신/인기)
- 좋아요 투표 (1인 1표)

### 🏆 Ranking — Monthly Competition
- 월간 Top 50 디자인 랭킹
- 점수 산식: **좋아요 + (슈퍼스타 × 10)**
- 슈퍼스타는 사용자 기준 디자인별 **주 1회**
- 1위 디자인 = 실제 의상 제작
- 시즌별 역대 우승자 아카이브

### 🔐 Security — Server-Write Only
- 클라이언트에서 Firestore 직접 쓰기 **불가**
- 모든 데이터 변경은 API Routes를 통해 서버에서 처리
- Firebase Custom Claims 기반 관리자 권한

---

## 🗺️ Roadmap

```
Phase 1 (MVP)          Phase 2-A              Phase 2-B
─────────────          ─────────              ─────────
✅ AI 이미지 생성       🔲 무료 크레딧 시스템     🔲 유료 크레딧 (PayPal)
✅ 갤러리 & 좋아요      🔲 Google AdSense       🔲 부스트 투표 (랭킹 반영)
✅ 월간 랭킹            🔲 리워드 광고           🔲 광고 제거/최소화
✅ 사용자 인증          🔲 부스트 (노출 강화)     🔲 Superfan 구독
✅ 관리자 콘솔          🔲 일일 출석 보상        🔲 애니메이트 기능
```

---

## 📖 Documentation

| Document | Description |
|:---|:---|
| [`BOOTSTRAP_MVP.md`](docs/BOOTSTRAP_MVP.md) | Step-by-step project setup guide |
| [`DATA_MODEL.md`](docs/DATA_MODEL.md) | Firestore database schema |
| [`API_CONTRACTS.md`](docs/API_CONTRACTS.md) | API request/response specifications |
| [`SECURITY_RULES.md`](docs/SECURITY_RULES.md) | Firestore security rules |
| [`UX_SPEC_PLAYGROUND.md`](docs/UX_SPEC_PLAYGROUND.md) | Studio UX specification |
| [`MASTER_PLAN.md`](MASTER_PLAN.md) | Full product plan & roadmap |
| [`GUIDELINES_2026-02-15.md`](docs/GUIDELINES_2026-02-15.md) | Current live policy snapshot (Superstar/Ranking/UI rules) |

---

## 🧠 Agents

Specialist agents for planning and execution live in `agents/`:

- `LEGAL.md` — legal/compliance checks
- `PRODUCT_MD.md` — product & merchandising strategy
- `IP_STRATEGY.md` — IP/content-rights risk review
- `KPOP_EXPERT.md` — K-POP fandom/domain fit review

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Git Conventions

- **Branch naming**: `feature/<description>`, `fix/<description>`
- **Commit messages**: Clear, imperative mood (e.g., "Add studio generation flow")
- **Default branch**: `main`

---

## 📄 License

This project is licensed under the ISC License.

---

<div align="center">

**Made with ❤️ by [Beyond Fashion AI](https://github.com/beyondfashion-ai)**

*Empowering K-POP fans to create, share, and compete.*

</div>
