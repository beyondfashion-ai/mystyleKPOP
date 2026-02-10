# CLAUDE.md — mystyleai MVP

> AI assistant guide for the **beyondfashion-ai/mystyleKPOP** repository.
> KPOP Stage Outfit AI Generation Platform.

---

## Project Overview

**mystyleai** is a platform where KPOP fans design stage outfits using AI, share them in a community gallery, and the monthly winner receives a real costume produced from their design.

### Core Value Propositions

- **10-Second Generation:** AI generates 4 KPOP stage outfit images quickly
- **Multilingual Support:** Korean, Japanese, Chinese prompts are auto-translated to English
- **Real Reward:** The #1 design each month is manufactured into a real costume and gifted to the winner
- **Community:** Gallery, voting, and leaderboard to energize fandom culture

### Repository Details

| Field        | Value                              |
| ------------ | ---------------------------------- |
| Organization | beyondfashion-ai                   |
| Repository   | mystyleKPOP                        |
| Domain       | my-style.ai                       |
| Status       | MVP Development                    |

---

## Technology Stack

### Frontend

| Technology       | Details                          |
| ---------------- | -------------------------------- |
| Framework        | Next.js 14+ (App Router)        |
| Language         | TypeScript                       |
| Styling          | Tailwind CSS                     |
| UI Components    | Shadcn/ui (optional)            |
| State Management | React hooks + Context API        |
| Auth             | Firebase Authentication          |

### Backend

| Technology       | Details                                  |
| ---------------- | ---------------------------------------- |
| Platform         | Firebase (Firestore, Storage, Functions) |
| API Routes       | Next.js API routes (`/app/api/`)         |
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

## Project Structure

```
mystyleai/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/
│   │   ├── page.tsx                 # Landing page
│   │   ├── playground/
│   │   │   └── page.tsx             # Generation studio
│   │   ├── gallery/
│   │   │   └── page.tsx             # Gallery (infinite scroll)
│   │   ├── design/
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Design detail page
│   │   └── leaderboard/
│   │       └── page.tsx             # Monthly ranking
│   ├── api/
│   │   ├── translate/
│   │   │   └── route.ts            # Prompt translation
│   │   ├── generate/
│   │   │   └── route.ts            # AI image generation
│   │   ├── designs/
│   │   │   └── [id]/
│   │   │       └── route.ts        # Design lookup
│   │   ├── upvote/
│   │   │   └── [designId]/
│   │   │       └── route.ts        # Upvote toggle
│   │   ├── gallery/
│   │   │   └── route.ts            # Gallery listing
│   │   ├── remix/
│   │   │   └── route.ts            # Remix generation
│   │   └── leaderboard/
│   │       └── route.ts            # Monthly ranking query
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                          # Shared UI components
│   ├── playground/
│   │   ├── GenderSelect.tsx         # Gender selection
│   │   ├── LoraStyleSelect.tsx      # LoRA style selection
│   │   ├── VibeSelect.tsx           # Mood/vibe selection
│   │   └── PromptInput.tsx          # Prompt input field
│   ├── gallery/
│   │   ├── DesignCard.tsx           # Design card
│   │   └── FilterBar.tsx            # Filter bar
│   └── design/
│       ├── ImageGallery.tsx         # Image viewer
│       └── UpvoteButton.tsx         # Upvote button
├── lib/
│   ├── firebase/
│   │   ├── config.ts               # Firebase configuration
│   │   ├── auth.ts                  # Auth helpers
│   │   ├── firestore.ts            # Firestore helpers
│   │   └── storage.ts              # Storage helpers
│   ├── fal/
│   │   └── client.ts               # fal.ai client
│   ├── translation/
│   │   └── client.ts               # Translation API client
│   └── utils.ts                     # Utility functions
├── functions/
│   ├── src/
│   │   ├── leaderboard-snapshot.ts  # End-of-month ranking snapshot
│   │   ├── update-upvote-count.ts   # upvoteCount sync
│   │   └── reset-generation-limits.ts # Daily limit reset
│   └── package.json
├── public/
│   └── images/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md                        # This file
```

---

## Core Pages & Features

### 1. Landing Page (`/`)

- Hero section with background video/GIF
- "Get Started Free" CTA redirecting to Playground
- Social proof (user count, sample images)
- Features section (10-second generation, KPOP-specialized, real reward)
- Gallery preview (top 12 designs)

### 2. Playground (`/playground`)

**4-step generation process:**

1. **Gender selection:** Male / Female
2. **LoRA style:** Formal, School uniform, Street, High fashion, Concert, etc.
3. **Vibe/Mood:** Edgy, Elegant, Cute, Sexy, Futuristic
4. **Prompt input:** Multilingual support (Korean, Japanese, Chinese, etc.)

**Output:**
- 4 images generated within ~10 seconds
- Options: [Save (Private)] [Publish] [Regenerate]

**Generation limits:**
- Not logged in: 3 per session
- Logged in: 20 per day

### 3. Gallery (`/gallery`)

- 3-column grid layout
- Infinite scroll (loads 12 at a time)
- Filters: gender, LoRA style, vibe, sort (newest / popular)
- Each card: image, upvote count, creator nickname, prompt preview

### 4. Design Detail (`/design/[id]`)

- Large image viewer (select from 4 generated images)
- Upvote button (login required, 1 vote per user per design)
- Design info: prompt, gender, style, vibe, creation date
- Remix button (generate new design based on this one)
- Social share buttons (KakaoTalk, Instagram, X)
- Report button (moderation)

### 5. Leaderboard (`/leaderboard`)

- Current month's Top 10 designs
- #1 highlighted ("This design will be manufactured into a real costume!")
- Winner info submission form (within 7 days)
- Past winner archive
- Countdown timer for remaining days

---

## Firestore Data Schema

### Collection: `designs`

```typescript
{
  designId: string,              // auto-generated
  ownerUid: string,              // Firebase Auth UID
  ownerHandle: string,           // @nickname
  ownerProfileImage?: string,

  originalPrompt: string,        // Original (Korean, etc.)
  englishPrompt: string,         // Translated English
  promptTemplate: string,        // Preset ID

  gender: "male" | "female",
  loraStyle: string,             // "formal", "school", "street", etc.
  vibe: string,                  // "edgy", "elegant", etc.

  imageUrls: [
    {
      url: string,               // Firebase Storage URL
      index: number,             // 1~4
      selected: boolean
    }
  ],

  generationRequestId: string,   // fal.ai request ID
  generatedAt: timestamp,

  visibility: "private" | "public",
  publishedAt: timestamp | null,

  upvoteCount: number,           // Cache (synced by Cloud Function)
  remixOfDesignId?: string,

  tags: {
    vibe: string[],
    items?: string[],
    colors?: string[]
  },

  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `upvotes`

```typescript
// Document ID: "{designId}_{uid}"
{
  designId: string,
  uid: string,
  createdAt: timestamp
}
```

### Collection: `generationLimits`

```typescript
// Document ID: "{uid}_{YYYY-MM-DD}"
{
  uid: string,
  date: string,                  // "2026-02-10"
  count: number,                 // 0~20
  lastResetAt: timestamp,
  isGuest: boolean
}
```

### Collection: `leaderboards`

```typescript
// Document ID: "monthly_{YYYY-MM}"
{
  period: "monthly",
  month: string,                 // "2026-02"

  rankings: [
    {
      rank: number,
      designId: string,
      upvoteCount: number,
      ownerUid: string,
      ownerHandle: string,
      imageUrl: string,
      publishedAt: timestamp
    }
  ],

  winnerDesignId: string,
  winnerUid: string,
  winnerHandle: string,
  winnerUpvoteCount: number,
  productionStatus: string,      // "pending" | "in_production" | "shipped" | "delivered"

  snapshotAt: timestamp,
  snapshotMethod: string         // "auto_cron" | "manual_admin"
}
```

### Collection: `users`

```typescript
// Document ID: Firebase Auth UID
{
  uid: string,
  email: string,
  handle: string,                // unique, @nickname
  profileImage?: string,
  bio?: string,

  totalGenerations: number,
  totalPublished: number,
  totalUpvotes: number,

  createdAt: timestamp,
  lastLoginAt: timestamp,

  winnerHistory?: [
    {
      month: string,
      designId: string,
      upvoteCount: number,
      productionStatus: string
    }
  ]
}
```

---

## API Endpoints

### `POST /api/translate`

Auto-translates a prompt into English.

**Request:**
```json
{
  "text": "black leather harness, silver boots",
  "sourceLanguage": "ko"
}
```

**Response:**
```json
{
  "success": true,
  "englishText": "Black leather harness, silver boots",
  "originalText": "...",
  "detectedLanguage": "ko"
}
```

### `POST /api/generate`

Generates KPOP stage outfit images via AI.

**Request:**
```json
{
  "prompt": "black leather harness, silver boots",
  "gender": "female",
  "loraStyle": "concert",
  "vibe": "edgy",
  "visibility": "private"
}
```

**Server-side processing:**
1. Check generation limit (`generationLimits`)
2. Translate prompt (`/api/translate`)
3. Compose final prompt (gender + LoRA + vibe + user prompt)
4. Call fal.ai API (Flux model, 4 images)
5. Download images and upload to Firebase Storage
6. Create Firestore `designs` document
7. Increment `generationLimits` counter

**Response:**
```json
{
  "success": true,
  "designId": "design_abc123",
  "imageUrls": ["https://...", "https://...", "https://...", "https://..."],
  "englishPrompt": "KPOP stage outfit, female, black leather harness...",
  "generatedAt": "2026-02-10T14:32:00Z",
  "remainingGenerations": 15
}
```

### `GET /api/designs/[id]`

Retrieves detail info for a single design.

### `POST /api/upvote/[designId]`

Registers an upvote on a design. (Login required, 1 vote per user per design.)

### `DELETE /api/upvote/[designId]`

Removes an upvote.

### `GET /api/gallery`

Retrieves gallery listing with filters.

**Query params:**
- `gender`: `"male"` | `"female"`
- `loraStyle`: `"formal"`, `"school"`, `"street"`, etc.
- `vibe`: `"edgy"`, `"elegant"`, etc.
- `sortBy`: `"recent"` | `"popular"`
- `page`: 1, 2, 3, ...
- `limit`: 12 (default)

### `POST /api/remix`

Creates a new design based on an existing one.

### `GET /api/leaderboard/monthly`

Retrieves the current monthly ranking.

---

## Environment Variables (`.env.local`)

```bash
# Firebase (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (server-side only)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# fal.ai
FAL_KEY=your_fal_api_key

# Google Cloud Translation
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_TRANSLATION_KEY=your_translation_api_key

# Google Cloud Vision (moderation)
GOOGLE_CLOUD_VISION_KEY=your_vision_api_key

# Next.js
NEXT_PUBLIC_SITE_URL=https://my-style.ai
```

**IMPORTANT:**
- Never commit `.env.local` to Git.
- Only commit `.env.example` with empty placeholder values.

---

## UI/UX Guidelines

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

## Development Workflow

### Step 1: Environment Setup

```bash
# Create the project
npx create-next-app@latest mystyleai --typescript --tailwind --app

# Install dependencies
npm install firebase @fal-ai/serverless-client @google-cloud/translate @google-cloud/vision

# Set up environment variables
cp .env.example .env.local
# Fill in actual keys in .env.local

# Initialize Firebase
firebase login
firebase init firestore
firebase init functions
firebase init storage
```

### Step 2: Firebase Setup

1. Create a project in Firebase Console
2. Enable Firestore Database (test mode, then production mode)
3. Enable Storage
4. Enable Authentication (Email/Password, Google)
5. Deploy Security Rules

### Step 3: Run Dev Server

```bash
npm run dev
```

### Step 4: Build & Deploy

```bash
# Test build
npm run build

# Deploy to Vercel
vercel --prod
```

### Git Conventions

- **Default branch:** `main`
- **Feature branches:** `feature/<description>`
- **Bug fix branches:** `fix/<description>`
- **Commit messages:** Clear, imperative mood (e.g., "Add user profile component")
- **Commit signing:** Enabled (GPG/SSH)

---

## Development Checklist

### Week 1: Foundation + Generation API

- [ ] Firebase project setup
- [ ] Environment variables configured
- [ ] Firebase Auth integration
- [ ] Firestore schema creation
- [ ] Security Rules deployment
- [ ] `POST /api/translate` implementation
- [ ] `POST /api/generate` implementation
- [ ] Generation limit logic

### Week 2: Playground UI + Gallery + Upvote

- [ ] Playground 4-step UI
- [ ] Generation progress indicator UI
- [ ] Generation result display
- [ ] Gallery page (infinite scroll)
- [ ] Gallery filters
- [ ] `GET /api/gallery` implementation
- [ ] `POST /api/upvote` implementation
- [ ] Upvote Cloud Function
- [ ] Design Detail page

### Week 3: Leaderboard + Remix + Landing

- [ ] Leaderboard page
- [ ] `GET /api/leaderboard` implementation
- [ ] Monthly snapshot Cloud Function
- [ ] Winner info submission form
- [ ] Remix feature
- [ ] Landing page
- [ ] Social sharing (KakaoTalk, Instagram, X)
- [ ] OG tag configuration

### Week 4: Moderation + Testing + Deployment

- [ ] Vision API integration (auto-filtering)
- [ ] Report system
- [ ] Admin dashboard (minimal)
- [ ] Banned-word prompt check
- [ ] E2E testing
- [ ] Performance optimization
- [ ] Vercel deployment
- [ ] Monitoring setup (Sentry)
- [ ] Final deployment

---

## Debugging Tips

### Firebase connection issues

```bash
# Check Firebase config
firebase projects:list

# Check Firestore indexes
firebase firestore:indexes

# View logs
firebase functions:log
```

### fal.ai API errors

- Verify API key is correct
- Check rate limits
- Review usage on the fal.ai dashboard

### Image upload failures

- Check Firebase Storage Rules
- Ensure image size is under 10MB
- Verify CORS configuration

---

## AI Assistant Guidelines

### General Principles

1. **Read before writing** — Always read existing code before proposing changes
2. **Minimal changes** — Make only the changes requested; avoid unnecessary refactoring
3. **No over-engineering** — Keep solutions simple and focused on the task
4. **Security first** — Never commit secrets, credentials, or API keys
5. **Test coverage** — Add tests for new functionality when a test framework exists
6. **One task at a time** — Complete one feature fully before moving to the next

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

### Effective Prompting Tips (for the developer)

- **Be specific:** "Build the 4-step selection UI on the Playground page"
- **Name the file:** "Modify `app/playground/page.tsx`"
- **Share errors verbatim:** Copy-paste the full error message
- **One at a time:** Don't request multiple features simultaneously

---

## MVP Success Criteria

### Technical Success

- Login -> Prompt input -> 4 images generated within 10 seconds
- Publish -> Appears in gallery -> Other users can upvote
- Monthly auto-selection of Top 1
- Fully functional on mobile

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

---

*Keep this file up to date as the project evolves. When new tools, frameworks, or conventions are adopted, update the relevant sections.*
