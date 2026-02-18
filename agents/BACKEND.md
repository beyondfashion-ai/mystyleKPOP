# BACKEND — Backend Developer Agent (백엔드 개발자)

> You are the **Backend Developer** for the mystyleKPOP platform.  
> You own all API routes, server-side logic, database writes, and external service integrations.

---

## Identity & Scope

- **Role:** Backend Developer
- **Stack:** Next.js API Routes (Route Handlers), Firebase Admin SDK, fal.ai, Zod
- **Authority:** All files under `src/app/api/`, `src/lib/` (server-side), `functions/`
- **Constraint:** ALL Firestore writes MUST go through API routes. No client-side writes.

---

## 1. API Endpoint Registry (전체 API 엔드포인트 목록)

### Phase 1 (MVP) Endpoints

| Method | Route                        | Auth    | Description                        | Rate Limit               |
| ------ | ---------------------------- | ------- | ---------------------------------- | ------------------------ |
| `POST` | `/api/translate`             | No      | Translate prompt to English        | 30/min per IP            |
| `POST` | `/api/generate`              | Yes*    | Generate 4 outfit images           | Daily per-user (default 20) |
| `POST` | `/api/designs/publish`       | Yes     | Select representative + publish    | Owner only               |
| `GET`  | `/api/designs/[id]`          | No      | Get design detail                  | 60/min per IP            |
| `POST` | `/api/vote`                  | Yes     | Toggle like on a design            | 1 per user per design    |
| `GET`  | `/api/gallery`               | No      | List designs with filters          | 60/min per IP            |
| `GET`  | `/api/ranking?period=...`    | No      | Get ranking (`weekly` or `monthly`) | 30/min per IP            |
| `POST` | `/api/report`                | Yes     | Report a design                    | 5/min per user           |
| `PATCH`| `/api/admin/settings`        | Admin   | Update platform settings           | Admin only               |

*Guest gets 1 trial without auth; subsequent calls require login.

> Full request/response specs: see `docs/API_CONTRACTS.md`

---

## 2. Standard Route Handler Template (표준 라우트 핸들러 템플릿)

```typescript
// src/app/api/[endpoint]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/firebase/admin';

// ─── 1. Define Zod Schema (입력 검증 스키마) ───
const RequestSchema = z.object({
  // Define fields here
});

// ─── 2. Handler ───
export async function POST(req: NextRequest) {
  try {
    // ─── Auth Verification (인증 검증) ───
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    const { uid } = authResult;

    // ─── Input Validation (입력 검증) ───
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // ─── Business Logic (비즈니스 로직) ───
    // ...

    // ─── Response ───
    return NextResponse.json({ success: true, data: { /* ... */ } });

  } catch (error) {
    console.error('[API_NAME]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

---

## 3. Auth Verification (OAuth 플로우 / 인증 검증 코드)

### Firebase Admin SDK Init

```typescript
// src/lib/firebase/admin.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { NextRequest } from 'next/server';

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();

// ─── Token Verification Helper (토큰 검증 헬퍼) ───
interface AuthResult {
  success: boolean;
  uid?: string;
  email?: string;
  isAdmin?: boolean;
}

export async function verifyAuth(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { success: false };
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);
    return {
      success: true,
      uid: decoded.uid,
      email: decoded.email,
      isAdmin: decoded.admin === true, // Custom Claims 검증
    };
  } catch {
    return { success: false };
  }
}

// ─── Admin Verification (관리자 검증) ───
export async function verifyAdmin(req: NextRequest): Promise<AuthResult> {
  const result = await verifyAuth(req);
  if (!result.success || !result.isAdmin) {
    return { success: false };
  }
  return result;
}
```

---

## 4. AI Image Generation — Prompt Injection (인테이크 프롬프트 주입 코드)

### System Prompt Construction (시스템 프롬프트 구성)

```typescript
// src/lib/fal/prompt-builder.ts

interface PromptInput {
  group?: string;
  concept: string;
  keywords: string; // Already translated to English
}

// ─── System Prompt (서버에서만 보유, 절대 외부 노출 금지) ───
const SYSTEM_PREFIX = `KPOP stage outfit fashion design, professional fashion photography, 
full body shot, studio lighting, high fashion editorial, fashion runway style`;

const CONCEPT_MODIFIERS: Record<string, string> = {
  formal: 'elegant formal stage outfit, gala event, sophisticated luxury',
  street: 'streetwear inspired stage outfit, urban fashion, trendy casual',
  concert: 'dynamic concert stage outfit, performance wear, energetic',
  school: 'school uniform inspired stage outfit, youthful academic aesthetic',
  high_fashion: 'avant-garde high fashion stage outfit, couture, editorial',
  casual: 'relaxed casual stage outfit, comfortable yet stylish',
};

const NEGATIVE_PROMPT = `nsfw, nude, violence, gore, deformed, ugly, blurry, 
low quality, watermark, text, signature, extra limbs`;

export function buildPrompt(input: PromptInput): {
  prompt: string;
  negativePrompt: string;
} {
  const parts = [SYSTEM_PREFIX];

  if (input.group) {
    parts.push(`inspired by ${input.group} style`);
  }

  parts.push(CONCEPT_MODIFIERS[input.concept] || input.concept);
  parts.push(input.keywords);

  return {
    prompt: parts.join(', '),
    negativePrompt: NEGATIVE_PROMPT,
  };
}
```

### fal.ai Client (fal.ai 클라이언트)

```typescript
// src/lib/fal/client.ts
import * as fal from '@fal-ai/serverless-client';

fal.config({ credentials: process.env.FAL_KEY });

interface GenerationResult {
  images: { url: string; width: number; height: number }[];
  seed: number;
}

export async function generateImages(
  prompt: string,
  negativePrompt: string,
  count: number = 4
): Promise<GenerationResult> {
  const result = await fal.subscribe('fal-ai/flux/dev', {
    input: {
      prompt,
      negative_prompt: negativePrompt,
      image_size: 'square_hd', // 1024x1024
      num_images: count,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      enable_safety_checker: true,
    },
  });

  return result as GenerationResult;
}
```

---

## 5. Rate Limiting Logic (사용량 제한 로직)

### Generation Limit Check (생성 제한 확인)

```typescript
// src/lib/limits.ts
import { adminDb } from './firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const LIMITS_COLLECTION = 'generationLimits';

interface LimitResult {
  allowed: boolean;
  remaining: number;
  dailyMax: number;
  resetsAt: string;
}

export async function checkGenerationLimit(
  uid: string,
  isGuest: boolean = false
): Promise<LimitResult> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const docId = `${uid}_${today}`;
  const docRef = adminDb.collection(LIMITS_COLLECTION).doc(docId);

  // ─── Get admin settings for limit (관리자 설정에서 제한값 조회) ───
  const settingsDoc = await adminDb.collection('adminSettings').doc('current').get();
  const settings = settingsDoc.data();
  const dailyMax = isGuest
    ? (settings?.guestTrialLimit ?? 1)
    : (settings?.dailyGenerationLimit ?? 20);

  // ─── Atomic read-then-increment (원자적 읽기 후 증가) ───
  const result = await adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(docRef);

    if (!doc.exists) {
      tx.set(docRef, {
        uid,
        date: today,
        count: 1,
        dailyMax,
        isGuest,
        createdAt: FieldValue.serverTimestamp(),
        lastGeneratedAt: FieldValue.serverTimestamp(),
      });
      return { allowed: true, remaining: dailyMax - 1 };
    }

    const data = doc.data()!;
    if (data.count >= dailyMax) {
      return { allowed: false, remaining: 0 };
    }

    tx.update(docRef, {
      count: FieldValue.increment(1),
      lastGeneratedAt: FieldValue.serverTimestamp(),
    });
    return { allowed: true, remaining: dailyMax - data.count - 1 };
  });

  // Calculate reset time (midnight UTC of next day)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    ...result,
    dailyMax,
    resetsAt: tomorrow.toISOString(),
  };
}
```

---

## 6. Data Parsing Helpers (데이터 파싱 코드)

### Firestore Document → API Response

```typescript
// src/lib/parsers.ts
import { Timestamp } from 'firebase-admin/firestore';

// ─── Convert Firestore Timestamp → ISO string ───
export function toISO(ts: Timestamp | null | undefined): string | null {
  if (!ts) return null;
  return ts.toDate().toISOString();
}

// ─── Design document → public response (프롬프트 절대 미포함) ───
export function toPublicDesign(doc: FirebaseFirestore.DocumentData, isOwner: boolean = false) {
  const data = doc;
  const result: Record<string, unknown> = {
    designId: data.designId,
    ownerUid: data.ownerUid,
    ownerHandle: data.ownerHandle,
    group: data.group,
    concept: data.concept,
    imageUrls: data.imageUrls,
    representativeIndex: data.representativeIndex,
    likeCount: data.likeCount,
    boostCount: data.boostCount,
    hasAnimation: data.hasAnimation,
    visibility: data.visibility,
    publishedAt: toISO(data.publishedAt),
    createdAt: toISO(data.createdAt),
  };

  // ─── CRITICAL: Prompt is ONLY included for owner (프롬프트는 소유자에게만) ───
  if (isOwner) {
    result.originalPrompt = data.originalPrompt;
    result.englishPrompt = data.englishPrompt;
  }

  return result;
}
```

---

## 7. Security Rules (보안 원칙)

1. **Server-Write Only:** No client SDK writes to Firestore, ever
2. **Admin = Custom Claims:** `admin: true` in Firebase Auth Custom Claims only
3. **Atomic Counters:** All counters (likeCount, boostCount) use `FieldValue.increment()`
4. **Prompt Privacy:** `originalPrompt`, `englishPrompt`, `systemPrompt` never in public API responses
5. **Input Validation:** Every API route validates with Zod BEFORE any DB operation
6. **Rate Limiting:** Check limits in transaction BEFORE performing expensive operations

---

## Reference Documents (참고 문서)

| Document                  | Purpose                           |
| ------------------------- | --------------------------------- |
| `docs/API_CONTRACTS.md`   | Full API request/response specs   |
| `docs/DATA_MODEL.md`      | Firestore schema & indexes        |
| `docs/SECURITY_RULES.md`  | Firestore security rules          |
| `CLAUDE.md §3`            | Architecture decisions            |
| `CLAUDE.md §11`           | API endpoint summary              |
