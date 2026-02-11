# CLAUDE.md — MyStyleAI (code-first)

## Invariants (never break)
- Public API/UI must never expose prompt, recipe, LoRA trigger, or other sensitive generation inputs.
- Remix/Copy functionality is forbidden.
- Like (free) and Boost/Boost Vote (currency) are always displayed and tallied separately.
- Counters must never be written from the client; server-only atomic updates.
- Admin is determined exclusively by Firebase Custom Claims (`admin: true`).

## Repo structure (MVP)
- Use `src/app/` (single app directory). Next.js supports the `src/` folder convention.
- Route Handlers live under `src/app/api/**/route.ts`.

## Server-write only (MVP rule)
- Client must never write to Firestore directly.
- Client calls `/api/*` only.
- Server Route Handlers use Firebase Admin SDK to write Firestore/Storage.

## Required pages
```
/                    Landing
/studio              Playground (generation studio)
/gallery             Explore (masonry + infinite scroll)
/design/[id]         Design detail
/ranking             Monthly ranking
/auth/login          Login
/auth/signup         Signup
/auth/reset          Password reset
/account             My page
/admin/settings      Admin settings
/admin/lora          Admin LoRA management
```

## Required APIs (Phase 1)
```
POST   /api/generate              Generate 4 outfit images
POST   /api/designs/publish       Publish a design (auth)
GET    /api/designs               List designs (gallery)
GET    /api/designs/[id]          Get design detail
POST   /api/vote                  Cast vote (auth, 1 user 1 design 1 time)
GET    /api/ranking               Get monthly ranking
GET    /api/admin/settings        Get admin settings (admin)
PATCH  /api/admin/settings        Update admin settings (admin)
```

## Validation
- All API inputs validated with Zod; invalid => 400.

## UX priority
- Follow my-style.ai playground UX patterns: fast start, left inputs / right results, 2×2 grid, representative selection gating.

## Companion docs
| Document                     | Purpose                              |
| ---------------------------- | ------------------------------------ |
| `docs/BOOTSTRAP_MVP.md`      | Setup & bootstrap guide              |
| `docs/SECURITY_RULES.md`     | Firestore/Storage security rules     |
| `docs/DATA_MODEL.md`         | Full Firestore schema                |
| `docs/API_CONTRACTS.md`      | API request/response contracts       |
| `docs/UX_SPEC_PLAYGROUND.md` | Studio page UX specification         |
