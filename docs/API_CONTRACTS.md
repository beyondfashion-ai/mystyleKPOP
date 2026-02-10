# API_CONTRACTS.md — API Request/Response Specifications

> Complete API contracts for the mystyleai MVP.
> All API routes live in `src/app/api/**/route.ts` (Next.js Route Handlers).
> All write operations require server-side auth validation.

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

## Endpoints

### `POST /api/translate`

Translates a user prompt into English.

**Auth:** Not required

**Request:**
```json
{
  "text": "검은색 가죽 하네스, 은색 부츠",
  "sourceLanguage": "auto"
}
```

| Field            | Type   | Required | Description                          |
| ---------------- | ------ | -------- | ------------------------------------ |
| `text`           | string | Yes      | Original prompt text                 |
| `sourceLanguage` | string | No       | ISO 639-1 code or "auto" (default)   |

**Response (200):**
```json
{
  "success": true,
  "englishText": "Black leather harness, silver boots",
  "originalText": "검은색 가죽 하네스, 은색 부츠",
  "detectedLanguage": "ko"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Text is required"
}
```

---

### `POST /api/generate`

Generates 4 KPOP stage outfit images via fal.ai.

**Auth:** Required (except 1 guest trial)

**Request:**
```json
{
  "group": "BLACKPINK",
  "concept": "concert",
  "keywords": "black leather harness, silver boots, edgy vibe",
  "visibility": "public"
}
```

| Field        | Type   | Required | Description                              |
| ------------ | ------ | -------- | ---------------------------------------- |
| `group`      | string | No       | Target group/artist name                 |
| `concept`    | string | Yes      | "formal", "street", "concert", "school", "high_fashion" |
| `keywords`   | string | Yes      | Free-text keywords (any language)        |
| `visibility` | string | No       | "public" (default) or "private" (Superfan only) |

**Server-Side Processing:**
1. Validate auth token (or check guest trial)
2. Check `generationLimits` for daily cap
3. Translate keywords to English (`/api/translate`)
4. Compose system prompt: concept + group + translated keywords
5. Call fal.ai API (Flux model, 4 images, ~10 seconds)
6. Download images from fal.ai URLs
7. Upload to Firebase Storage (`designs/{designId}/`)
8. Create Firestore `designs` document (with `representativeIndex: -1` until user selects)
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
  "remainingGenerations": 0,
  "resetsAt": "2026-02-12T00:00:00Z"
}
```

---

### `PATCH /api/designs/[id]`

Updates a design (e.g., select representative image, change visibility).

**Auth:** Required (owner only)

**Request:**
```json
{
  "representativeIndex": 2,
  "visibility": "public"
}
```

| Field                 | Type   | Required | Description                        |
| --------------------- | ------ | -------- | ---------------------------------- |
| `representativeIndex` | number | No       | 0-3, index of representative image |
| `visibility`          | string | No       | "public" or "private"              |

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

---

### `GET /api/designs/[id]`

Retrieves a single design's detail.

**Auth:** Not required (but private designs require owner auth)

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
  "userLiked": false
}
```

**Note:** `originalPrompt`, `englishPrompt`, and `systemPrompt` are **never** included in the response for non-owner requests.

---

### `POST /api/like/[designId]`

Toggles a like on a design. If already liked, removes the like.

**Auth:** Required

**Response (200 — liked):**
```json
{
  "success": true,
  "action": "liked",
  "likeCount": 43
}
```

**Response (200 — unliked):**
```json
{
  "success": true,
  "action": "unliked",
  "likeCount": 42
}
```

**Server-Side Processing:**
1. Validate auth token
2. Check if `likes/{designId}_{uid}` exists
3. If exists: delete document, decrement `designs/{designId}.likeCount`
4. If not exists: create document, increment `designs/{designId}.likeCount`
5. All operations in a Firestore transaction (atomic)

---

### `GET /api/gallery`

Lists published designs with filters and pagination.

**Auth:** Not required

**Query Parameters:**

| Param    | Type   | Default    | Description                                    |
| -------- | ------ | ---------- | ---------------------------------------------- |
| `concept` | string | (all)     | Filter by concept                              |
| `sortBy` | string | "recent"   | "recent" or "popular"                          |
| `cursor` | string | (none)     | Last document ID for cursor-based pagination   |
| `limit`  | number | 12         | Number of results (max 48)                     |

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

### `GET /api/ranking/monthly`

Retrieves the current or specified month's ranking.

**Auth:** Not required

**Query Parameters:**

| Param  | Type   | Default       | Description                  |
| ------ | ------ | ------------- | ---------------------------- |
| `month` | string | current month | "YYYY-MM" format             |

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

For past months with confirmed winners:
```json
{
  "winner": {
    "designId": "design_abc123",
    "ownerHandle": "@fandesigner",
    "score": 142,
    "productionStatus": "delivered"
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

| HTTP Status | Code                    | Description                          |
| ----------- | ----------------------- | ------------------------------------ |
| 400         | `INVALID_REQUEST`       | Missing or invalid parameters        |
| 401         | `UNAUTHORIZED`          | Missing or invalid auth token        |
| 403         | `FORBIDDEN`             | Insufficient permissions             |
| 404         | `NOT_FOUND`             | Resource not found                   |
| 409         | `CONFLICT`              | Duplicate resource (e.g., handle)    |
| 429         | `RATE_LIMITED`           | Daily limit exceeded                 |
| 500         | `INTERNAL_ERROR`        | Server error                         |

---

## Rate Limits Summary

| Endpoint          | Limit                          |
| ----------------- | ------------------------------ |
| `/api/generate`   | Daily per-user (default 20)    |
| `/api/like`       | 1 per user per design          |
| `/api/translate`  | Reasonable rate (middleware)   |
| `/api/gallery`    | Reasonable rate (middleware)   |
