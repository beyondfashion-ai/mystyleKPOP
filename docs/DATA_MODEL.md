# DATA_MODEL.md — Firestore Schema

> Complete Firestore data model for the MyStyleAI MVP.
> All writes go through the Admin SDK (server-side API routes).

---

## Collection: `designs`

Stores all generated outfit designs.

**Document ID:** auto-generated

```typescript
interface Design {
  // ─── Identity ───
  designId: string;              // Same as document ID
  ownerUid: string;              // Firebase Auth UID of the creator
  ownerHandle: string;           // @nickname (denormalized from users)
  ownerProfileImage?: string;    // Profile image URL (denormalized)

  // ─── Prompt (PRIVATE — never expose to other users) ───
  originalPrompt: string;        // Original input (Korean, Japanese, etc.)
  englishPrompt: string;         // Translated English prompt
  systemPrompt: string;          // Full composed prompt sent to fal.ai

  // ─── Generation Inputs ───
  group?: string;                // Target group/artist name
  concept: string;               // "formal", "street", "concert", "school", "high_fashion", "casual"
  keywords: string;              // User's free-text keywords

  // ─── Generated Images ───
  imageUrls: {
    url: string;                 // Firebase Storage URL
    index: number;               // 0-3
  }[];
  representativeIndex: number;   // Index of the user-selected representative image (0-3), -1 if unselected

  // ─── fal.ai Tracking ───
  generationRequestId: string;   // fal.ai request ID for debugging
  generatedAt: Timestamp;        // When generation completed

  // ─── Visibility ───
  visibility: "private" | "public";
  publishedAt: Timestamp | null; // Set when published via POST /api/designs/publish

  // ─── Engagement (server-managed, atomic) ───
  likeCount: number;             // Cached vote count (atomic increment via POST /api/vote)
  boostCount: number;            // Phase 2: separate from likeCount, always 0 in Phase 1

  // ─── Animation (Superfan feature) ───
  animationUrl?: string;         // URL of animated version, if generated
  hasAnimation: boolean;         // Quick flag for UI rendering

  // ─── Moderation ───
  status: "active" | "hidden" | "removed";
  reportCount: number;

  // ─── Timestamps ───
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Key Indexes

```
designs: visibility ASC, publishedAt DESC                       → Gallery (newest)
designs: visibility ASC, likeCount DESC                         → Gallery (popular)
designs: ownerUid ASC, createdAt DESC                           → My designs
designs: visibility ASC, concept ASC, publishedAt DESC          → Gallery filtered by concept
designs: visibility ASC, concept ASC, likeCount DESC            → Gallery filtered + popular
```

---

## Collection: `votes`

Records individual vote actions. Enforces 1 vote per user per design via document ID.

**Document ID:** `{designId}_{uid}`

```typescript
interface Vote {
  designId: string;
  uid: string;
  createdAt: Timestamp;
}
```

### Why This Pattern

- Document ID `{designId}_{uid}` guarantees uniqueness (no duplicate votes)
- Checking existence is a single document read (fast and cheap)
- Maps directly to `POST /api/vote` endpoint constraint: 1 user, 1 design, 1 time

---

## Collection: `generationLimits`

Tracks daily generation usage per user.

**Document ID:** `{uid}_{YYYY-MM-DD}`

```typescript
interface GenerationLimit {
  uid: string;
  date: string;                  // "2026-02-11"
  count: number;                 // Current count (0 to dailyMax)
  dailyMax: number;              // From adminSettings (e.g., 20)
  isGuest: boolean;              // Guest trial tracking
  createdAt: Timestamp;
  lastGeneratedAt: Timestamp;
}
```

### Usage Flow

1. On `POST /api/generate`, read `{uid}_{today}` document
2. If not exists, create with `count: 0`, `dailyMax` from `adminSettings`
3. If `count >= dailyMax`, reject with 429
4. Otherwise, increment `count` atomically and proceed

---

## Collection: `rankings`

Monthly ranking snapshots. Created by Cloud Function at month-end.

**Document ID:** `monthly_{YYYY-MM}`

```typescript
interface MonthlyRanking {
  period: "monthly";
  month: string;                 // "2026-02"

  rankings: {
    rank: number;                // 1-50
    designId: string;
    likeCount: number;
    boostCount: number;          // Phase 2: separate tally
    totalScore: number;          // Phase 1: same as likeCount
    ownerUid: string;
    ownerHandle: string;
    imageUrl: string;            // Representative image URL
    publishedAt: Timestamp;
  }[];

  // ─── Winner Info ───
  winnerDesignId: string;
  winnerUid: string;
  winnerHandle: string;
  winnerScore: number;

  // ─── Production Tracking ───
  productionStatus: "pending" | "confirmed" | "in_production" | "shipped" | "delivered";
  winnerInfoSubmittedAt?: Timestamp;
  productionStartedAt?: Timestamp;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;

  // ─── Metadata ───
  scoreFormula: string;          // e.g., "likeCount"
  snapshotAt: Timestamp;
  snapshotMethod: "auto_cron" | "manual_admin";
}
```

---

## Collection: `users`

User profiles and aggregate stats.

**Document ID:** Firebase Auth UID

```typescript
interface User {
  uid: string;
  email: string;
  handle: string;                // Unique @nickname
  profileImage?: string;
  bio?: string;

  // ─── Role ───
  // Note: admin role is in Custom Claims, NOT in this document.
  tier: "free" | "superfan";

  // ─── Aggregate Stats (server-managed) ───
  totalGenerations: number;
  totalPublished: number;
  totalLikesReceived: number;

  // ─── Winner History ───
  winnerHistory: {
    month: string;
    designId: string;
    score: number;
    productionStatus: string;
  }[];

  // ─── Timestamps ───
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Handle Uniqueness

Enforced at the application layer (API route):
1. Before creating/updating handle, query `users` where `handle == newHandle`
2. If result is non-empty and not the current user, reject with 409

---

## Collection: `adminSettings`

Singleton document holding admin-configurable platform settings.

**Document ID:** `current`

```typescript
interface AdminSettings {
  dailyGenerationLimit: number;  // Default: 20
  guestTrialLimit: number;       // Default: 1
  galleryPageSize: number;       // Default: 12
  rankingTopN: number;           // Default: 50
  currentPhase: "phase1" | "phase2a" | "phase2b";
  moderationEnabled: boolean;
  updatedAt: Timestamp;
  updatedBy: string;             // Admin UID who last updated
}
```

Accessed via `GET /api/admin/settings` and `PATCH /api/admin/settings`.

---

## Collection: `loraModels`

LoRA model configurations managed via `/admin/lora`.

**Document ID:** auto-generated

```typescript
interface LoraModel {
  loraId: string;                // Same as document ID
  name: string;                  // Display name (e.g., "Concert Stage")
  triggerWord: string;           // LoRA trigger (PRIVATE — never exposed to users)
  modelUrl: string;              // fal.ai LoRA URL (PRIVATE)
  concept: string;               // Maps to concept enum
  isActive: boolean;             // Whether available for generation
  sortOrder: number;             // Display order in admin UI
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**INVARIANT:** `triggerWord` and `modelUrl` are never exposed in any public API response.

---

## Collection: `reports` (Moderation)

User-submitted reports for content moderation.

**Document ID:** auto-generated

```typescript
interface Report {
  reportId: string;
  designId: string;
  reporterUid: string;
  reason: "inappropriate" | "spam" | "copyright" | "other";
  description?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  action?: "none" | "hidden" | "removed" | "user_warned" | "user_banned";
  createdAt: Timestamp;
}
```

---

## Collection: `moderationLogs` (Audit Trail)

Immutable log of all moderation actions.

**Document ID:** auto-generated

```typescript
interface ModerationLog {
  logId: string;
  adminUid: string;
  action: string;
  targetType: "design" | "user";
  targetId: string;
  reason: string;
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
}
```

---

## Data Flow Diagram

```
Guest/User (Client)
  │
  ├─ Read ──→ Firestore (via Client SDK, rules allow reads)
  │
  └─ Write ──→ Next.js API Route ──→ Firestore (via Admin SDK, bypasses rules)
                    │
                    ├─ Validates input (Zod)
                    ├─ Validates auth token
                    ├─ Checks permissions/limits
                    ├─ Performs atomic writes
                    └─ Returns response

Cloud Functions
  │
  ├─ ranking-snapshot: Monthly cron → snapshot top N → write to rankings
  ├─ update-vote-count: Triggered on votes write → atomic increment on designs.likeCount
  └─ reset-generation-limits: Daily cron → (optional, limits auto-expire by date key)
```
