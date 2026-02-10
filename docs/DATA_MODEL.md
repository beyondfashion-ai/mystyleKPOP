# DATA_MODEL.md — Firestore Schema

> Complete Firestore data model for the mystyleai MVP.
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
  concept: string;               // "formal", "street", "concert", "school", "high_fashion"
  keywords: string;              // User's free-text keywords

  // ─── Generated Images ───
  imageUrls: {
    url: string;                 // Firebase Storage URL
    index: number;               // 0-3
  }[];
  representativeIndex: number;   // Index of the user-selected representative image (0-3)

  // ─── fal.ai Tracking ───
  generationRequestId: string;   // fal.ai request ID for debugging
  generatedAt: Timestamp;        // When generation completed

  // ─── Visibility ───
  visibility: "private" | "public";
  publishedAt: Timestamp | null; // Set when visibility changes to "public"

  // ─── Engagement (server-managed, atomic) ───
  likeCount: number;             // Cached count (synced by Cloud Function or atomic increment)
  boostCount: number;            // Phase 2: separate from likeCount, always 0 in Phase 1

  // ─── Animation (Superfan feature) ───
  animationUrl?: string;         // URL of animated version, if generated
  hasAnimation: boolean;         // Quick flag for UI rendering

  // ─── Moderation ───
  status: "active" | "hidden" | "removed";  // Moderation status
  reportCount: number;           // Number of reports received

  // ─── Timestamps ───
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Key Indexes

```
designs: visibility ASC, publishedAt DESC      → Gallery (newest)
designs: visibility ASC, likeCount DESC        → Gallery (popular)
designs: ownerUid ASC, createdAt DESC          → My designs
designs: visibility ASC, concept ASC, publishedAt DESC  → Gallery filtered by concept
```

---

## Collection: `likes`

Records individual like actions. Enforces 1 like per user per design via document ID.

**Document ID:** `{designId}_{uid}`

```typescript
interface Like {
  designId: string;
  uid: string;
  createdAt: Timestamp;
}
```

### Why This Pattern

- Document ID `{designId}_{uid}` guarantees uniqueness (no duplicate likes)
- Checking existence is a single document read (fast and cheap)
- Deleting a like is a single document delete

---

## Collection: `generationLimits`

Tracks daily generation usage per user.

**Document ID:** `{uid}_{YYYY-MM-DD}`

```typescript
interface GenerationLimit {
  uid: string;
  date: string;                  // "2026-02-11"
  count: number;                 // Current count (0 to dailyMax)
  dailyMax: number;              // Maximum allowed (e.g., 20)
  isGuest: boolean;              // Guest trial tracking
  createdAt: Timestamp;
  lastGeneratedAt: Timestamp;    // Last generation timestamp
}
```

### Usage Flow

1. On generation request, read `{uid}_{today}` document
2. If not exists, create with `count: 0`
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
    totalScore: number;          // Phase 1: same as likeCount; Phase 2-B: likeCount + boostCount
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
  winnerInfoSubmittedAt?: Timestamp;    // When winner submitted shipping info
  productionStartedAt?: Timestamp;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;

  // ─── Metadata ───
  scoreFormula: string;          // Human-readable formula, e.g., "likeCount"
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
  // Note: admin role is in Custom Claims, NOT here.
  // This field is for display/billing purposes only.
  tier: "free" | "superfan";

  // ─── Aggregate Stats (server-managed) ───
  totalGenerations: number;
  totalPublished: number;
  totalLikesReceived: number;

  // ─── Winner History ───
  winnerHistory: {
    month: string;               // "2026-02"
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
2. If result is non-empty and not the current user, reject with 409 Conflict

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

  // ─── Resolution ───
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  reviewedBy?: string;           // Admin UID
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
  action: string;                // "hide_design", "remove_design", "warn_user", "ban_user", etc.
  targetType: "design" | "user";
  targetId: string;              // designId or userId
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
                    ├─ Validates auth token
                    ├─ Checks permissions/limits
                    ├─ Performs atomic writes
                    └─ Returns response

Cloud Functions
  │
  ├─ ranking-snapshot: Monthly cron → snapshot top 50 → write to rankings
  ├─ update-like-count: Triggered on likes write → atomic increment on designs.likeCount
  └─ reset-generation-limits: Daily cron → (optional, limits auto-expire by date key)
```
