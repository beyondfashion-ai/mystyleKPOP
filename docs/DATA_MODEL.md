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
  id?: string;                   // Document ID (auto-generated or local UUID)
  ownerUid: string;              // Firebase Auth UID or "anonymous"
  ownerHandle: string;           // Display name (e.g., "Guest Designer")

  // ─── Prompt (PRIVATE — never expose to other users) ───
  originalPrompt: string;        // User's input text (Korean + hashtags)
  englishPrompt: string;         // Same as originalPrompt in MVP (no translation yet)
  systemPrompt: string;          // Same as originalPrompt in MVP

  // ─── Generation Inputs ───
  concept: string;               // Korean label: "사이버펑크", "Y2K", "하이틴", "섹시", "수트", "스트릿", "걸크러쉬", "general"
  keywords: string;              // Comma-separated hashtag keywords (e.g., "네온 컬러,레더 재킷")

  // ─── Images ───
  imageUrls: {
    url: string;                 // fal.ai CDN URL (or Firebase Storage in production)
    index: number;               // 0-based index
  }[];
  representativeIndex: number;   // Always 0 in current implementation

  // ─── Visibility ───
  visibility: "public";          // MVP: all published designs are public
  publishedAt: Timestamp;

  // ─── Engagement (server-managed, atomic) ───
  likeCount: number;             // Like count (atomic increment via POST /api/like/[designId])
  boostCount: number;            // Superstar tally (1 Superstar = ranking weight 10)

  // ─── Moderation ───
  status: "active" | "hidden" | "removed";

  // ─── Timestamps ───
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Notes:**
- `imageUrls` can contain 1-4 images (user selects which to publish from generated results)
- In dev mode without Firebase, designs are stored in `data/designs.json` (local JSON fallback)
- Prompts/recipes are never exposed in gallery or detail API responses

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

## Collection: `boosts`

Tracks Superstar usage per user per design with weekly cooldown.

**Document ID:** `{designId}_{uid}`

```typescript
interface Boost {
  designId: string;
  uid: string;
  count: number;                 // Lifetime boost count from this user to this design
  lastBoostAt: Timestamp;        // Cooldown anchor (must be at least 7 days old to boost again)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Policy

- Stores per-design Superstar history.
- Ranking score uses: `likeCount + (boostCount * 10)`.

---

## Collection: `boostUsers`

Tracks global Superstar cooldown by user.

**Document ID:** `{uid}`

```typescript
interface BoostUser {
  uid: string;
  totalBoostCount: number;       // Lifetime Superstar sends
  lastBoostAt: Timestamp;        // Global cooldown anchor (7 days)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Policy

- One user can send Superstar once every 7 days across the entire platform.

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
    boostCount: number;          // Superstar tally
    totalScore: number;          // likeCount + (boostCount * 10)
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
  scoreFormula: string;          // e.g., "likeCount + (boostCount * 10)"
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

  // ─── Credits (server-managed, atomic) ───
  creditBalance: number;         // Current credit balance

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
  dailyGenerationLimit: number;  // Default: 10
  guestTrialLimit: number;       // Default: 1
  galleryPageSize: number;       // Default: 12
  rankingTopN: number;           // Default: 50
  creditCostPerGeneration: number; // Default: 1 (credits per extra generation)
  adsenseEnabled: boolean;       // Default: false (set to true in Phase 2-A)
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

## Collection: `credits_ledger`

Immutable transaction log for all credit operations (earn, spend, purchase, refund).

**Document ID:** auto-generated

```typescript
interface CreditLedger {
  ledgerId: string;              // Same as document ID
  uid: string;                   // User UID
  type: "earn" | "spend" | "purchase" | "refund";
  amount: number;                // Positive = gain, Negative = deduction
  balance: number;               // Balance after this transaction
  reason: string;                // "daily_streak" | "rewarded_ad" | "generation" | "boost" | "paypal_purchase" | "admin_grant" | "refund"
  relatedId?: string;            // designId, orderId, etc.
  createdAt: Timestamp;
}
```

### Security

- **Read:** Authenticated users can read only their own records (`uid == auth.uid`)
- **Write:** Server-only (Admin SDK). Clients never write to this collection.
- **Immutable:** Once created, ledger entries are never updated or deleted.

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
                    ├─ Checks credit balance (if daily limit exceeded)
                    ├─ Performs atomic writes (incl. credit deduction + ledger entry)
                    └─ Returns response

Cloud Functions
  │
  ├─ ranking-snapshot: Monthly cron → snapshot top N → write to rankings
  ├─ update-vote-count: Triggered on votes write → atomic increment on designs.likeCount
  └─ reset-generation-limits: Daily cron → (optional, limits auto-expire by date key)
```
