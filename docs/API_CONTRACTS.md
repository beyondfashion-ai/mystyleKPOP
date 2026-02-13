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

Generates 1-4 KPOP stage outfit images via fal.ai (Flux 2 Turbo).

**Auth:** Not enforced in MVP (guest trial supported)

**Request Body:**
```json
{
  "prompt": "크롭탑 #네온컬러 #레더재킷",
  "idolType": "K-POP girl group",
  "conceptStyle": "Futuristic, electric, digital",
  "conceptPrompt": "cyberpunk, futuristic, metallic textures, tech-wear",
  "imageCount": 4
}
```

| Field          | Type   | Required | Description                                          |
| -------------- | ------ | -------- | ---------------------------------------------------- |
| `prompt`       | string | Yes      | User keywords + hashtags (max 2000 chars)            |
| `idolType`     | string | No       | "K-POP girl group" / "K-POP boy group" / "K-POP solo artist" |
| `conceptStyle` | string | No       | Mood keywords from concept selection                 |
| `conceptPrompt`| string | No       | Style keywords from concept selection                |
| `imageCount`   | number | No       | 1, 2, or 4 (default: 1, max: 4)                     |

**Server-Side Processing:**
1. Validate prompt exists and length ≤ 2000
2. Check FAL_KEY configured
3. For each image: build natural language prompt with random pose/angle/framing
4. Call fal.ai `fal-ai/flux-2/turbo` with `guidance_scale: 3.5`, `num_inference_steps: 8`, unique random seed
5. Return generated image URLs directly (fal.ai CDN)

**Response (200):**
```json
{
  "urls": [
    "https://fal.media/.../image1.png",
    "https://fal.media/.../image2.png"
  ]
}
```

**Error (400):** `{ "error": "Prompt is required" }`
**Error (500):** `{ "error": "No images generated" }`

---

### `POST /api/designs/publish`

Creates a new design document and publishes it to the gallery. Supports multiple images.

**Auth:** Optional (uses token if available, falls back to body uid)

**Request Body:**
```json
{
  "imageUrl": "https://fal.media/.../image1.png",
  "imageUrls": [
    "https://fal.media/.../image1.png",
    "https://fal.media/.../image2.png"
  ],
  "prompt": "크롭탑 #네온컬러",
  "concept": "사이버펑크",
  "keywords": "네온 컬러,레더 재킷",
  "ownerUid": "user123",
  "ownerHandle": "KpopFan99"
}
```

| Field         | Type     | Required | Description                                    |
| ------------- | -------- | -------- | ---------------------------------------------- |
| `imageUrl`    | string   | Yes*     | Single image URL (legacy, used if imageUrls missing) |
| `imageUrls`   | string[] | Yes*     | Multiple selected image URLs                   |
| `prompt`      | string   | Yes      | User prompt text                               |
| `concept`     | string   | No       | Concept label (Korean)                         |
| `keywords`    | string   | No       | Comma-separated hashtag keywords               |
| `ownerUid`    | string   | No       | Fallback if no auth token                      |
| `ownerHandle` | string   | No       | Fallback display name                          |

*At least one of `imageUrl` or `imageUrls` is required.

**Server-Side Processing:**
1. Try verify auth token; fall back to body uid
2. Build design data with all selected images as `imageUrls` array
3. Save to Firestore (Admin SDK → client SDK → local JSON fallback)

**Response (200):**
```json
{
  "success": true,
  "designId": "abc123def456"
}
```

**Fallback:** When Firebase is not configured, saves to `data/designs.json` (dev only).

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

### `GET /api/credits`

Retrieves the authenticated user's credit balance and recent transaction history.

**Auth:** Required

**Query Parameters:**

| Param   | Type   | Default | Description                    |
| ------- | ------ | ------- | ------------------------------ |
| `limit` | number | 20      | Number of recent transactions  |

**Response (200):**
```json
{
  "success": true,
  "creditBalance": 48,
  "transactions": [
    {
      "ledgerId": "ledger_abc123",
      "type": "spend",
      "amount": -1,
      "balance": 48,
      "reason": "generation",
      "relatedId": "design_xyz789",
      "createdAt": "2026-02-11T15:00:00Z"
    }
  ]
}
```

---

### `POST /api/credits/purchase`

Initiates a credit purchase via PayPal. Available in Phase 2-B.

**Auth:** Required

**Zod Schema:**
```typescript
const CreditPurchaseSchema = z.object({
  package: z.enum(["starter", "basic", "value", "pro"]),
});
```

**Package Map:**

| Package  | Credits | Price  |
| -------- | ------- | ------ |
| starter  | 50      | $0.99  |
| basic    | 150     | $2.49  |
| value    | 500     | $6.99  |
| pro      | 1,200   | $12.99 |

**Request:**
```json
{
  "package": "basic"
}
```

**Response (200):**
```json
{
  "success": true,
  "paypalOrderId": "ORDER_ABC123",
  "approvalUrl": "https://www.paypal.com/checkoutnow?token=...",
  "creditsToAdd": 150,
  "price": "$2.49"
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
    "dailyGenerationLimit": 10,
    "guestTrialLimit": 1,
    "galleryPageSize": 12,
    "rankingTopN": 50,
    "creditCostPerGeneration": 1,
    "adsenseEnabled": false,
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
  creditCostPerGeneration: z.number().int().min(1).max(10).optional(),
  adsenseEnabled: z.boolean().optional(),
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
    "creditCostPerGeneration": 1,
    "adsenseEnabled": false,
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
| 402         | `INSUFFICIENT_CREDITS` | Not enough credits for extra generation |
| 403         | `FORBIDDEN`       | Insufficient permissions          |
| 404         | `NOT_FOUND`       | Resource not found                |
| 409         | `CONFLICT`        | Duplicate (e.g., already voted)   |
| 429         | `RATE_LIMITED`    | Daily limit exceeded              |
| 500         | `INTERNAL_ERROR`  | Server error                      |

---

## Rate Limits Summary

| Endpoint                | Limit                       |
| ----------------------- | --------------------------- |
| `POST /api/generate`    | Daily per-user (default 10), then credit-based |
| `POST /api/vote`        | 1 per user per design       |
| `POST /api/designs/publish` | Owner only              |
| `PATCH /api/admin/settings` | Admin only              |
