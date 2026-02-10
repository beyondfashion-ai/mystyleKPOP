# BOOTSTRAP_MVP.md — Project Setup Guide

> Step-by-step guide to bootstrap the mystyleai MVP from scratch.

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (comes with Node.js)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Vercel CLI** (`npm install -g vercel`) — for deployment
- A **Firebase project** created in the Firebase Console
- A **fal.ai** account with API key
- A **Google Cloud** project with Translation API and Vision API enabled

---

## Step 1: Create the Next.js Project

```bash
npx create-next-app@latest mystyleai \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --eslint \
  --import-alias "@/*"
```

This creates a Next.js 14+ project with:
- App Router (`src/app/`)
- TypeScript
- Tailwind CSS
- ESLint
- `@/*` import alias mapped to `src/*`

---

## Step 2: Install Dependencies

```bash
cd mystyleai

# Firebase (client + admin)
npm install firebase firebase-admin

# AI image generation
npm install @fal-ai/serverless-client

# Google Cloud APIs
npm install @google-cloud/translate @google-cloud/vision

# Optional: Shadcn/ui setup
npx shadcn-ui@latest init
```

---

## Step 3: Environment Variables

Create `.env.example` (committed to git):

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

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_TRANSLATION_KEY=
GOOGLE_CLOUD_VISION_KEY=

# Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then create `.env.local` (never committed):

```bash
cp .env.example .env.local
# Fill in actual values in .env.local
```

---

## Step 4: Firebase Setup

### 4.1 Firebase Console

1. Go to Firebase Console and create a new project (or select existing)
2. Enable **Authentication** -> Sign-in providers -> Email/Password
3. Enable **Firestore Database** -> Start in test mode (switch to production rules before launch)
4. Enable **Storage** -> Start in test mode

### 4.2 Firebase Admin SDK

1. In Firebase Console -> Project Settings -> Service Accounts
2. Click "Generate new private key"
3. Copy the values into `.env.local`:
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY` (keep the `\n` characters)

### 4.3 Firebase CLI Init

```bash
firebase login
firebase init firestore   # Creates firestore.rules and firestore.indexes.json
firebase init functions    # Creates functions/ directory
firebase init storage      # Creates storage.rules
```

### 4.4 Set Admin Custom Claims

Create a one-time script or use the Firebase Admin SDK:

```typescript
import { getAuth } from "firebase-admin/auth";

// Run once to set admin claims for a user
await getAuth().setCustomUserClaims(ADMIN_UID, { admin: true });
```

---

## Step 5: Firestore Security Rules

Deploy the security rules defined in `docs/SECURITY_RULES.md`:

```bash
firebase deploy --only firestore:rules
```

---

## Step 6: Directory Structure

Create the initial directory structure:

```bash
# Pages
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/signup
mkdir -p src/app/\(main\)/studio
mkdir -p src/app/\(main\)/gallery
mkdir -p src/app/\(main\)/design/\[id\]
mkdir -p src/app/\(main\)/ranking
mkdir -p src/app/\(main\)/account
mkdir -p src/app/admin

# API routes
mkdir -p src/app/api/translate
mkdir -p src/app/api/generate
mkdir -p src/app/api/designs/\[id\]
mkdir -p src/app/api/like/\[designId\]
mkdir -p src/app/api/gallery
mkdir -p src/app/api/ranking

# Components
mkdir -p src/components/ui
mkdir -p src/components/studio
mkdir -p src/components/gallery
mkdir -p src/components/design

# Library
mkdir -p src/lib/firebase
mkdir -p src/lib/fal
mkdir -p src/lib/translation
```

---

## Step 7: Firebase Client Config

Create `src/lib/firebase/config.ts`:

```typescript
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

---

## Step 8: Firebase Admin Config

Create `src/lib/firebase/admin.ts`:

```typescript
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();
```

---

## Step 9: Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000` to verify the app loads.

---

## Step 10: Build Verification

```bash
npm run build
```

Fix any TypeScript or build errors before deploying.

---

## Step 11: Deploy to Vercel

```bash
vercel --prod
```

Set environment variables in Vercel Dashboard -> Settings -> Environment Variables.

---

## Step 12: Deploy Firebase Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

---

## Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] Firebase Auth sign-up/sign-in works
- [ ] Firestore reads work from API routes
- [ ] fal.ai API key is valid (test with a simple generation)
- [ ] Translation API returns results
- [ ] `npm run build` succeeds
- [ ] Vercel deployment is accessible
- [ ] Firebase Functions deploy successfully
