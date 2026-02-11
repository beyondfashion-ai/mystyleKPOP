# API_CONTRACTS.md — API Request/Response Specifications

> Complete API contracts for the MyStyleAI MVP.
> All API routes live in `src/app/api/**/route.ts` (Next.js Route Handlers).
> All write operations require server-side auth validation.
> All inputs validated with **Zod**; invalid => 400.

---

## Authentication

All authenticated endpoints expect a Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

Server-side validation:

```typescript
import { adminAuth } from "@/lib/firebase/admin";

const token = request.headers.get("Authorization")?.replace("Bearer ", "");
const decodedToken = await adminAuth.verifyIdToken(token);
// decodedToken.uid, decodedToken.admin, etc.
```

---

## Validation Pattern

Every route handler validates input with Zod before processing:

```typescript
import { z } from "zod";

const schema = z.object({ /* ... */ });
const parsed = schema.safeParse(body);
if (!parsed.success) {
  return Response.json(
    { success: false, error: parsed.error.flatten(), code: "INVALID_REQUEST" },
    { status: 400 }
  );
}
```

---

## Endpoints

### `POST /api/generate`

Generates 4 KPOP stage outfit images via fal.ai.

**Auth:** Required (except 1 guest trial)

**Zod Schema:**
```typescript
const GenerateSchema = z.object({
  group: z.string().max(100).optional(),
  concept: z.enum(["formal", "street", "concert", "school", "high_fashion", "casual"]),
  keywords: z.string().min(1).max(200),
});
```

**Request:**
```json
{
  "group": "BLACKPINK",
  "concept": "concert",
  "keywords": "black leather harness, silver boots, edgy vibe"
}
```

**Server-Side Processing:**
1. Validate auth token (or check guest trial)
2. Check `generationLimits` for daily cap
3. Translate keywords to English (server-side, internal call)
4. Compose system prompt: concept + group + translated keywords
5. Call fal.ai API (Flux model, 4 images, ~10 seconds)
6. Download images from fal.ai URLs
7. Upload to Firebase Storage (`designs/{designId}/`)
8. Create Firestore `designs` document (`visibility: "private"`, `representativeIndex: -1`)
9. Increment `generationLimits` counter

**Response (200):**
```json
{
  "success": true,
  "designId": "design_abc123",
  "imageUrls": [
    "https://storage.googleapis.com/.../0.webp",
    "https://storage.googleapis.com/.../1.webp",
    "https://storage.googleapis.com/.../2.webp",
    "https://storage.googleapis.com/.../3.webp"
  ],
  "generatedAt": "2026-02-11T14:32:00Z",
  "remainingGenerations": 15
}
```

**Error (429 — Rate Limit):**
```json
{
  "success": false,
  "error": "Daily generation limit reached",
  "code": "RATE_LIMITED",
  "remainingGenerations": 0,
  "resetsAt": "2026-02-12T00:00:00Z"
}
```

---

### `POST /api/designs/publish`

Selects a representative image and publishes a design to the gallery.

**Auth:** Required (owner only)

**Zod Schema:**
```typescript
const PublishSchema = z.object({
  designId: z.string().min(1),
  representativeIndex: z.number().int().min(0).max(3),
});
```

**Request:**
```json
{
  "designId": "design_abc123",
  "representativeIndex": 2
}
```

**Server-Side Processing:**
1. Validate auth token
2. Verify requester is the design owner
3. Verify `representativeIndex` is 0-3
4. Update design: `visibility: "public"`, `representativeIndex`, `publishedAt: now()`
5. Increment `users/{uid}.totalPublished`

**Response (200):**
```json
{
  "success": true,
  "designId": "design_abc123",
  "visibility": "public",
  "representativeIndex": 2,
  "publishedAt": "2026-02-11T14:35:00Z"
}
```

**Error (403):**
```json
{
  "success": false,
  "error": "Not the owner of this design",
  "code": "FORBIDDEN"
}
```

---

### `GET /api/designs`

Lists published designs for the gallery with filters and cursor pagination.

**Auth:** Not required

**Query Parameters:**

| Param     | Type   | Default  | Description                                  |
| --------- | ------ | -------- | -------------------------------------------- |
| `concept` | string | (all)    | Filter by concept                            |
| `sortBy`  | string | "recent" | `"recent"` or `"popular"`                    |
| `cursor`  | string | (none)   | Last document ID for cursor-based pagination |
| `limit`   | number | 12       | Number of results (max 48)                   |

**Response (200):**
```json
{
  "success": true,
  "designs": [
    {
      "designId": "design_abc123",
      "ownerHandle": "@fandesigner",
      "ownerProfileImage": "https://...",
      "representativeImageUrl": "https://...",
      "concept": "concert",
      "likeCount": 42,
      "publishedAt": "2026-02-11T14:35:00Z"
    }
  ],
  "nextCursor": "design_xyz789",
  "hasMore": true
}
```

---

### `GET /api/designs/[id]`

Retrieves a single design's detail.

**Auth:** Not required (private designs require owner auth)

**Response (200):**
```json
{
  "success": true,
  "design": {
    "designId": "design_abc123",
    "ownerHandle": "@fandesigner",
    "ownerProfileImage": "https://...",
    "concept": "concert",
    "group": "BLACKPINK",
    "imageUrls": [
      { "url": "https://...", "index": 0 },
      { "url": "https://...", "index": 1 },
      { "url": "https://...", "index": 2 },
      { "url": "https://...", "index": 3 }
    ],
    "representativeIndex": 2,
    "likeCount": 42,
    "boostCount": 0,
    "hasAnimation": false,
    "visibility": "public",
    "publishedAt": "2026-02-11T14:35:00Z",
    "createdAt": "2026-02-11T14:32:00Z"
  },
  "userVoted": false
}
```

**INVARIANT:** `originalPrompt`, `englishPrompt`, and `systemPrompt` are **never** included in the response for non-owner requests.

---

### `POST /api/vote`

Casts a vote on a design (1 user, 1 design, 1 time). Not a toggle — voting is permanent in Phase 1.

**Auth:** Required

**Zod Schema:**
```typescript
const VoteSchema = z.object({
  designId: z.string().min(1),
});
```

**Request:**
```json
{
  "designId": "design_abc123"
}
```

**Server-Side Processing:**
1. Validate auth token
2. Check if `votes/{designId}_{uid}` already exists
3. If exists: return 409 Conflict
4. If not exists: create vote document, atomically increment `designs/{designId}.likeCount`
5. All operations in a Firestore transaction

**Response (200):**
```json
{
  "success": true,
  "designId": "design_abc123",
  "likeCount": 43
}
```

**Error (409 — Already Voted):**
```json
{
  "success": false,
  "error": "Already voted on this design",
  "code": "CONFLICT"
}
```

---

### `GET /api/ranking`

Retrieves the current or specified month's ranking.

**Auth:** Not required

**Query Parameters:**

| Param   | Type   | Default       | Description        |
| ------- | ------ | ------------- | ------------------ |
| `month` | string | current month | `"YYYY-MM"` format |

**Response (200):**
```json
{
  "success": true,
  "month": "2026-02",
  "scoreFormula": "likeCount",
  "daysRemaining": 17,
  "rankings": [
    {
      "rank": 1,
      "designId": "design_abc123",
      "ownerHandle": "@fandesigner",
      "imageUrl": "https://...",
      "likeCount": 142,
      "boostCount": 0,
      "totalScore": 142
    }
  ],
  "totalEntries": 50,
  "winner": null
}
```

---

### `GET /api/admin/settings`

Retrieves current admin-configurable settings.

**Auth:** Required (admin only — `admin: true` Custom Claim)

**Response (200):**
```json
{
  "success": true,
  "settings": {
    "dailyGenerationLimit": 20,
    "guestTrialLimit": 1,
    "galleryPageSize": 12,
    "rankingTopN": 50,
    "currentPhase": "phase1",
    "moderationEnabled": true
  }
}
```

---

### `PATCH /api/admin/settings`

Updates admin-configurable settings.

**Auth:** Required (admin only)

**Zod Schema:**
```typescript
const AdminSettingsSchema = z.object({
  dailyGenerationLimit: z.number().int().min(1).max(100).optional(),
  guestTrialLimit: z.number().int().min(0).max(10).optional(),
  galleryPageSize: z.number().int().min(4).max(48).optional(),
  rankingTopN: z.number().int().min(10).max(100).optional(),
  currentPhase: z.enum(["phase1", "phase2a", "phase2b"]).optional(),
  moderationEnabled: z.boolean().optional(),
});
```

**Request:**
```json
{
  "dailyGenerationLimit": 30
}
```

**Response (200):**
```json
{
  "success": true,
  "settings": {
    "dailyGenerationLimit": 30,
    "guestTrialLimit": 1,
    "galleryPageSize": 12,
    "rankingTopN": 50,
    "currentPhase": "phase1",
    "moderationEnabled": true
  }
}
```

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### Standard Error Codes

| HTTP Status | Code              | Description                       |
| ----------- | ----------------- | --------------------------------- |
| 400         | `INVALID_REQUEST` | Zod validation failed             |
| 401         | `UNAUTHORIZED`    | Missing or invalid auth token     |
| 403         | `FORBIDDEN`       | Insufficient permissions          |
| 404         | `NOT_FOUND`       | Resource not found                |
| 409         | `CONFLICT`        | Duplicate (e.g., already voted)   |
| 429         | `RATE_LIMITED`    | Daily limit exceeded              |
| 500         | `INTERNAL_ERROR`  | Server error                      |

---

## Rate Limits Summary

| Endpoint                | Limit                       |
| ----------------------- | --------------------------- |
| `POST /api/generate`    | Daily per-user (default 20) |
| `POST /api/vote`        | 1 per user per design       |
| `POST /api/designs/publish` | Owner only              |
| `PATCH /api/admin/settings` | Admin only              |
