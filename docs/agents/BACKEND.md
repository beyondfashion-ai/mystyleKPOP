# BACKEND — Backend Developer Sub-Agent

> Backend developer agent for the mystyleKPOP repository.
> Role: API endpoints, authentication flows, prompt injection prevention, rate limiting, data parsing.

---

## 1. Role Definition

The BACKEND agent owns **all server-side code** in the mystyleKPOP project:

- Next.js API Route Handlers (`src/app/api/**/route.ts`)
- Firebase Admin SDK operations (Firestore, Auth, Storage)
- External API integrations (fal.ai, Google Cloud Translation, Google Cloud Vision)
- Authentication and authorization logic
- Rate limiting and abuse prevention
- Data validation and parsing (Zod schemas)

**Key rules:**
- All Firestore writes happen server-side only (never from the client)
- Admin role is determined exclusively by Firebase Custom Claims (`admin: true`)
- Counters (like count, generation count) use atomic operations (increment / transaction)

---

## 2. Full API Endpoint List

### 2.1 Public Endpoints (No Auth Required)

| Method | Route | Description | Rate Limit |
|--------|-------|-------------|------------|
| `POST` | `/api/translate` | Translate prompt text (KO/JA/ZH → EN) | 30 req/min/IP |
| `GET` | `/api/designs/[id]` | Get single design detail | 60 req/min/IP |
| `GET` | `/api/gallery` | List published designs (paginated) | 60 req/min/IP |
| `GET` | `/api/ranking` | Get current month ranking (Top 50) | 30 req/min/IP |

### 2.2 Authenticated Endpoints

| Method | Route | Description | Rate Limit |
|--------|-------|-------------|------------|
| `POST` | `/api/generate` | Generate 4 outfit images | 20 req/day/user |
| `POST` | `/api/designs/publish` | Publish a design to gallery | 10 req/hour/user |
| `POST` | `/api/like/[designId]` | Toggle like on a design | 60 req/min/user |
| `GET` | `/api/account/designs` | Get current user's designs | 30 req/min/user |
| `PATCH` | `/api/account/profile` | Update user profile | 10 req/min/user |
| `DELETE` | `/api/account` | Delete user account and data | 1 req/day/user |
| `POST` | `/api/report` | Report a design for moderation | 5 req/hour/user |

### 2.3 Admin Endpoints (Custom Claim Required)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/admin/moderation` | Get moderation queue |
| `POST` | `/api/admin/moderation/[id]` | Take moderation action |
| `GET` | `/api/admin/settings` | Get platform settings |
| `PATCH` | `/api/admin/settings` | Update platform settings |
| `POST` | `/api/admin/winner/[month]` | Confirm monthly winner |

---

## 3. Authentication — Token Verification Pattern

### 3.1 Auth Middleware Helper

```typescript
// src/lib/firebase/verify-token.ts
import { adminAuth } from "./admin";
import { NextRequest } from "next/server";

export interface AuthUser {
  uid: string;
  email: string;
  admin: boolean;
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split("Bearer ")[1];

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      admin: decoded.admin === true,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await verifyAuth(request);
  if (!user) {
    throw new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}

export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request);
  if (!user.admin) {
    throw new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
```

### 3.2 Usage in Route Handler

```typescript
// src/app/api/like/[designId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/firebase/verify-token";

export async function POST(
  request: NextRequest,
  { params }: { params: { designId: string } }
) {
  const user = await requireAuth(request);
  const { designId } = params;

  // ... toggle like logic ...

  return NextResponse.json({ success: true });
}
```

---

## 4. OAuth Flow — Firebase Email/Password

### 4.1 Sign Up Flow

```
Client                          Server (/api/auth/register)           Firebase Auth
  |                                   |                                    |
  |-- POST { email, password, name }->|                                    |
  |                                   |-- createUser(email, password) ---->|
  |                                   |<-- UserRecord (uid) --------------|
  |                                   |-- setCustomClaims(uid, {}) ------>|
  |                                   |-- create users/{uid} doc -------->| Firestore
  |<-- { uid, token } ---------------|                                    |
```

### 4.2 Registration Endpoint

```typescript
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(30).trim(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password, displayName } = parsed.data;

  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });

    // Set default custom claims (no admin, no superfan)
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      admin: false,
      role: "free",
    });

    // Create user profile document
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role: "free",
      stats: { totalGenerations: 0, totalPublished: 0, totalLikesReceived: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ uid: userRecord.uid }, { status: 201 });
  } catch (error: any) {
    if (error.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
```

### 4.3 Admin Claim Assignment (One-Time Script)

```typescript
// scripts/set-admin.ts
// Run via: npx ts-node scripts/set-admin.ts <uid>
import { adminAuth } from "../src/lib/firebase/admin";

async function setAdmin(uid: string) {
  await adminAuth.setCustomUserClaims(uid, { admin: true, role: "admin" });
  console.log(`Admin claim set for user: ${uid}`);
}

const uid = process.argv[2];
if (!uid) {
  console.error("Usage: npx ts-node scripts/set-admin.ts <uid>");
  process.exit(1);
}
setAdmin(uid);
```

---

## 5. Prompt Injection Prevention

### 5.1 Input Sanitization for AI Generation

All user input that reaches the fal.ai prompt must be sanitized to prevent prompt injection attacks.

```typescript
// src/lib/security/sanitize-prompt.ts

/**
 * Sanitize user-provided keywords before injecting into the AI generation prompt.
 * Strips any attempt to override the system prompt or inject control tokens.
 */
export function sanitizePrompt(input: string): string {
  let sanitized = input;

  // Remove common injection patterns
  const injectionPatterns = [
    /ignore\s+(previous|above|all)\s+instructions?/gi,
    /system\s*:/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|.*?\|>/g,           // Control tokens like <|endoftext|>
    /<<SYS>>.*?<<\/SYS>>/gs,
    /```[\s\S]*?```/g,      // Code blocks (potential injection vector)
    /\{\{.*?\}\}/g,         // Template injection
  ];

  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, "");
  }

  // Limit length to prevent token overflow
  sanitized = sanitized.slice(0, 500).trim();

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, " ");

  return sanitized;
}
```

### 5.2 Structured Prompt Template

```typescript
// src/lib/fal/build-prompt.ts
import { sanitizePrompt } from "@/lib/security/sanitize-prompt";

interface PromptInput {
  groupName: string;
  concept: string;
  keywords: string;          // User's free-text input (potentially dangerous)
  translatedKeywords: string; // Already translated to English
}

export function buildGenerationPrompt(input: PromptInput): string {
  const safeKeywords = sanitizePrompt(input.translatedKeywords);

  // Fixed structure — user input is confined to the keywords slot only
  return [
    `A full-body fashion photograph of a KPOP idol stage outfit.`,
    `Group/Artist: ${input.groupName}.`,
    `Concept: ${input.concept}.`,
    `Details: ${safeKeywords}.`,
    `High quality, editorial fashion photography, studio lighting, white background.`,
  ].join(" ");
}
```

### 5.3 Prompt Injection Rules

| Rule | Description |
|------|-------------|
| Never concatenate raw user input | Always pass through `sanitizePrompt()` first |
| Fixed prompt structure | User input fills a designated slot, never the system instruction |
| Length cap | Max 500 characters for user keywords |
| No code blocks | Strip markdown code fences from user input |
| Log suspicious inputs | Log any input that triggers sanitization for audit |

---

## 6. Rate Limiting Logic

### 6.1 Rate Limiter Implementation

```typescript
// src/lib/security/rate-limiter.ts
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;          // Time window in milliseconds
  identifier: string;        // User UID or IP address
  endpoint: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { maxRequests, windowMs, identifier, endpoint } = config;
  const now = Date.now();
  const windowStart = now - windowMs;
  const docId = `${endpoint}_${identifier}`;

  const ref = adminDb.collection("rateLimits").doc(docId);

  return adminDb.runTransaction(async (transaction) => {
    const doc = await transaction.get(ref);
    const data = doc.data();

    if (!data || data.windowStart < windowStart) {
      // New window
      transaction.set(ref, {
        count: 1,
        windowStart: now,
        endpoint,
        identifier,
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt: new Date(now + windowMs),
      };
    }

    if (data.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(data.windowStart + windowMs),
      };
    }

    transaction.update(ref, { count: FieldValue.increment(1) });
    return {
      allowed: true,
      remaining: maxRequests - data.count - 1,
      resetAt: new Date(data.windowStart + windowMs),
    };
  });
}
```

### 6.2 Daily Generation Limit

```typescript
// src/lib/security/generation-limit.ts
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const DEFAULT_DAILY_LIMIT = 20;

export async function checkGenerationLimit(uid: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const docId = `${uid}_${today}`;
  const ref = adminDb.collection("generationLimits").doc(docId);

  // Get admin settings for configurable limit
  const settingsDoc = await adminDb.collection("adminSettings").doc("global").get();
  const dailyLimit = settingsDoc.data()?.dailyGenerationLimit ?? DEFAULT_DAILY_LIMIT;

  return adminDb.runTransaction(async (transaction) => {
    const doc = await transaction.get(ref);

    if (!doc.exists) {
      transaction.set(ref, { uid, date: today, count: 1 });
      return { allowed: true, used: 1, limit: dailyLimit };
    }

    const current = doc.data()!.count;
    if (current >= dailyLimit) {
      return { allowed: false, used: current, limit: dailyLimit };
    }

    transaction.update(ref, { count: FieldValue.increment(1) });
    return { allowed: true, used: current + 1, limit: dailyLimit };
  });
}
```

### 6.3 Rate Limit Response Headers

```typescript
// Include in all rate-limited responses
function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": result.resetAt.toISOString(),
  };
}
```

---

## 7. Data Parsing — Zod Schemas

### 7.1 Request Validation Schemas

```typescript
// src/lib/validation/schemas.ts
import { z } from "zod";

// === Generate ===
export const GenerateRequestSchema = z.object({
  groupName: z.string().min(1).max(100),
  concept: z.enum([
    "formal", "street", "concert", "school",
    "high-fashion", "casual", "retro", "futuristic",
  ]),
  keywords: z.string().max(500).optional().default(""),
});

// === Publish ===
export const PublishRequestSchema = z.object({
  designId: z.string().min(1),
  representativeIndex: z.number().int().min(0).max(3),
});

// === Profile Update ===
export const ProfileUpdateSchema = z.object({
  displayName: z.string().min(1).max(30).trim().optional(),
  bio: z.string().max(200).trim().optional(),
});

// === Report ===
export const ReportSchema = z.object({
  designId: z.string().min(1),
  reason: z.enum(["inappropriate", "spam", "copyright", "other"]),
  details: z.string().max(500).optional(),
});

// === Gallery Query ===
export const GalleryQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  sort: z.enum(["newest", "popular"]).optional().default("newest"),
  concept: z.string().optional(),
});

// === Ranking Query ===
export const RankingQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(), // YYYY-MM format
});
```

### 7.2 Validation Helper

```typescript
// src/lib/validation/validate.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    throw NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  return result.data;
}

export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const result = schema.safeParse(searchParams);

  if (!result.success) {
    throw NextResponse.json(
      { error: "Invalid query parameters", details: result.error.flatten() },
      { status: 400 }
    );
  }

  return result.data;
}
```

---

## 8. Error Response Format

All API errors follow a consistent structure:

```typescript
// Standard error response
interface ApiError {
  error: string;          // Human-readable error message
  code?: string;          // Machine-readable error code
  details?: unknown;      // Validation details (Zod flatten output)
}

// HTTP status code usage
// 400 — Validation error
// 401 — Not authenticated
// 403 — Not authorized (missing admin claim, etc.)
// 404 — Resource not found
// 409 — Conflict (duplicate like, email already exists)
// 429 — Rate limit exceeded
// 500 — Internal server error
```

---

## 9. Atomic Counter Operations

```typescript
// src/lib/firebase/counters.ts
import { adminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Atomically increment or decrement a counter field.
 * Used for likeCount, boostCount, generation stats.
 */
export async function incrementCounter(
  collection: string,
  docId: string,
  field: string,
  delta: number
) {
  await adminDb.collection(collection).doc(docId).update({
    [field]: FieldValue.increment(delta),
  });
}

// Usage: Like toggle
// await incrementCounter("designs", designId, "likeCount", 1);   // +1 on like
// await incrementCounter("designs", designId, "likeCount", -1);  // -1 on unlike
```

---

## 10. Content Moderation — Google Cloud Vision

```typescript
// src/lib/moderation/safe-search.ts
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();

interface ModerationResult {
  safe: boolean;
  flags: string[];
}

export async function moderateImage(imageUrl: string): Promise<ModerationResult> {
  const [result] = await client.safeSearchDetection(imageUrl);
  const safe = result.safeSearchAnnotation;

  if (!safe) {
    return { safe: true, flags: [] };
  }

  const flags: string[] = [];
  const blocked = ["LIKELY", "VERY_LIKELY"];

  if (blocked.includes(safe.adult ?? "")) flags.push("adult");
  if (blocked.includes(safe.violence ?? "")) flags.push("violence");
  if (blocked.includes(safe.racy ?? "")) flags.push("racy");

  return {
    safe: flags.length === 0,
    flags,
  };
}
```

---

## 11. Security Rules Summary

| Rule | Enforcement |
|------|-------------|
| No client-side Firestore writes | All mutations through API routes only |
| Admin via Custom Claims only | `adminAuth.verifyIdToken()` → check `admin: true` |
| Atomic counters | `FieldValue.increment()` for all count fields |
| Input validation | Zod schemas on every endpoint |
| Prompt sanitization | `sanitizePrompt()` before AI generation |
| Rate limiting | Per-endpoint limits enforced server-side |
| Token verification | `verifyIdToken()` on every authenticated request |
| Prompt privacy | Never return `prompt` or `recipe` fields in public API responses |
| CORS | Restrict to `my-style.ai` domain in production |

---

*This document is the primary reference for the BACKEND agent in all server-side implementation tasks.*
