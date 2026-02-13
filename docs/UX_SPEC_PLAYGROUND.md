# UX_SPEC_PLAYGROUND.md — Studio Page Specification

> UX specification for the `/studio` page (generation studio).
> Core experience: prompt input -> AI generation -> publish.
> Layout follows the my-style.ai playground pattern: **left inputs / right results**.

---

## Overview

The Studio page guides users through a 3-input generation flow to create KPOP stage outfit designs. The flow is intentionally simple: 3 inputs, 1 button, 4 results, 1 mandatory selection, then publish.

**UX Priority:** Fast start, left inputs / right results, 2x2 grid, representative selection gating.

---

## Layout: Left/Right Split (Desktop)

```
┌─────────────────────────────────────────────────────────┐
│  Left Panel (inputs)          │  Right Panel (results)   │
│                               │                          │
│  [Group/Artist] ............  │  ┌──────┐  ┌──────┐     │
│  [Concept Cards] ............  │  │ img0 │  │ img1 │     │
│  [Keywords] ................  │  └──────┘  └──────┘     │
│  [Generate] .................  │  ┌──────┐  ┌──────┐     │
│  [Remaining: 15/20] ........  │  │ img2 │  │ img3 │     │
│                               │  └──────┘  └──────┘     │
│                               │                          │
│                               │  [Publish] [Regenerate]  │
└─────────────────────────────────────────────────────────┘
```

On mobile, this collapses to a single column: inputs on top, results below.

---

## User Flow

```
[Enter Studio]
    │
    ├─ Step 1: Select Group/Artist (optional)
    │
    ├─ Step 2: Select Concept (required)
    │
    ├─ Step 3: Enter Keywords (required, multilingual)
    │
    ├─ [Generate] button
    │       │
    │       ├─ Loading state (~10 seconds)
    │       │
    │       └─ 4 images in 2×2 grid (right panel)
    │               │
    │               ├─ User MUST select 1 representative image
    │               │
    │               └─ Actions:
    │                   ├─ [Publish] → POST /api/designs/publish (requires login)
    │                   ├─ [Save Private] → My Page (Superfan only)
    │                   └─ [Regenerate] → POST /api/generate again (counts toward limit)
    │
    └─ [Back to inputs] (modify and regenerate)
```

---

## Input Section (Left Panel)

### Step 1: Group/Artist Selection (Optional)

- **Component:** `GroupSelect.tsx`
- **Type:** Searchable dropdown / autocomplete
- **Behavior:**
  - Popular groups shown by default (e.g., BLACKPINK, BTS, Stray Kids, aespa, etc.)
  - User can type to search
  - Can be left empty (generates a generic KPOP outfit)
- **UI:** Chip-style selector with search input

### Step 2: Concept Selection (Required)

- **Component:** `ConceptSelect.tsx`
- **Type:** Visual card grid (single-select)
- **Options:**

| Value          | Label         | Description                    |
| -------------- | ------------- | ------------------------------ |
| `formal`       | Formal        | Award show, gala, red carpet   |
| `school`       | School        | School uniform concept         |
| `street`       | Street        | Casual streetwear              |
| `high_fashion` | High Fashion  | Runway, avant-garde            |
| `concert`      | Concert       | Stage performance, tour outfit |
| `casual`       | Casual        | Everyday, comfortable          |

- **UI:** 2x3 or 3x2 grid of cards with icon/illustration + label
- **Validation:** Must select one before generating

### Step 3: Keywords Input (Required)

- **Component:** `KeywordInput.tsx`
- **Type:** Textarea with character limit
- **Behavior:**
  - Accepts any language (Korean, Japanese, Chinese, English, etc.)
  - Auto-translated to English server-side before generation
  - Character limit: 200 characters
  - Placeholder examples shown (changes based on selected concept)
- **UI:** Textarea with character counter
- **Placeholder examples by concept:**
  - Formal: "Sparkly silver gown with crystal details"
  - Street: "Oversized denim jacket, neon sneakers"
  - Concert: "Black leather harness, silver chains, combat boots"

---

## Generation Section

### Generate Button

- **Label:** "Generate" / "Create My Design"
- **State management:**
  - **Default:** Active (when concept + keywords are filled)
  - **Disabled:** When inputs are incomplete
  - **Loading:** During generation (~10 seconds)
  - **Cooldown:** Brief delay after generation to prevent spam

### Loading State

- **Duration:** ~10 seconds
- **UI:**
  - Full-width progress indicator (animated)
  - Encouraging text that rotates: "Creating your design...", "Styling the outfit...", "Almost ready..."
  - Do NOT show a percentage (fal.ai doesn't provide progress %)
  - Prevent user from navigating away (unsaved generation would be lost)

### AdSense Ad Placement (Phase 2-A)

- **Studio loading (10s wait)**: Display ad below progress indicator
  - Ad slot: responsive, max height 250px
  - Does NOT block or delay the generation result
- Ad component: `src/components/ads/AdBanner.tsx`
- Controlled by `adminSettings.adsenseEnabled` flag
- Removed when transitioning to Phase 2-B

---

### Generation Limit Display

- Show remaining generations: "5 of 10 remaining today"
- When daily limit reached (Phase 2+): show credit-based generation option
  - "Daily limit reached. Use 1 Credit to generate." + [Generate with Credit] button
  - Show current credit balance inline
  - If credits insufficient: "Get Credits" button → credit purchase page or rewarded ad
- When limit reached (Phase 1): disable Generate button, show "Come back tomorrow!" or upsell Superfan
- Guest trial: "Try 1 free generation — sign up for more!"

---

## Results Section (Right Panel)

### Image Grid

- **Layout:** 2x2 grid (always, on all breakpoints)
- **Image format:** WebP, optimized for web
- **Image size:** 1024x1024 recommended from fal.ai
- **Interaction:**
  - Click/tap to enlarge (lightbox/modal)
  - Select radio button or tap to choose representative image
  - Selected image has a visible border/highlight (e.g., pink-purple glow)

### Mandatory Representative Selection (Gating)

- **Rule:** User MUST select exactly 1 image as the "representative" before any action
- **UI:** Radio-button overlay on each image, or tap-to-select with highlight
- **Validation:** Publish/Save buttons are **disabled** until selection is made
- **Why:** The representative image is what appears in Gallery and Ranking

### Action Buttons

After selecting a representative image:

| Button           | Visibility    | Auth Required | API Call                       |
| ---------------- | ------------- | ------------- | ------------------------------ |
| **Publish**      | All users     | Yes (Free+)   | `POST /api/designs/publish`    |
| **Save Private** | Superfan only | Yes           | (design stays `visibility: "private"`) |
| **Regenerate**   | All users     | No*           | `POST /api/generate`           |

*Regenerate counts toward daily limit.

### Post-Publish Flow

After publishing:
1. Show success confirmation with animation
2. Display shareable link/card
3. Offer quick actions: "View in Gallery", "Share", "Create Another"

---

## Guest Experience

- Guest lands on Studio page
- All 3 inputs are available
- Generate button shows "Try Free"
- After generation: 4 images displayed in 2x2 grid
- Publish/Save buttons show "Sign up to publish"
- Regenerate is disabled ("Sign up for more generations")
- Clear CTA to sign up

---

## Responsive Behavior

### Mobile (< 768px)

- **Single column:** inputs on top, results below
- Concept cards: 2x3 grid
- Results: 2x2 grid, each image ~45% viewport width
- Action buttons: full-width, stacked vertically
- Floating "Generate" button at bottom when inputs are off-screen

### Tablet (768px - 1024px)

- **Single column**, wider layout
- Concept cards: 3x2 grid
- Results: 2x2 grid
- Action buttons: horizontal row

### Desktop (> 1024px)

- **Two-column layout:** inputs on left, results on right
- Concept cards: 3x2 grid
- Results: 2x2 grid in right column
- Action buttons: horizontal row below results

---

## Error Handling

| Error                    | UI Response                                      |
| ------------------------ | ------------------------------------------------ |
| Generation fails         | "Something went wrong. Please try again." + retry button (does NOT count toward limit) |
| Network timeout          | "Connection lost. Please check your internet."   |
| Daily limit reached      | Disable Generate, show remaining = 0, next reset time |
| Auth expired mid-flow    | Prompt re-login, preserve inputs                 |
| Zod validation fails     | Show inline field errors before submitting        |
| Translation fails        | Fallback: use original text as-is, log warning   |
| Image upload fails       | Retry upload silently (3 attempts), then show error |

---

## Accessibility

- All concept cards have `aria-label` with concept name and description
- Image selection uses proper radio group semantics (`role="radiogroup"`)
- Loading state announced via `aria-live="polite"`
- Generate button has clear disabled state (visual + `aria-disabled`)
- Keyboard: Tab through inputs, Enter to generate, Arrow keys for concept selection
- Screen reader: announce generation progress and completion

---

## Analytics Events

| Event                    | Trigger                          | Properties                    |
| ------------------------ | -------------------------------- | ----------------------------- |
| `studio_viewed`          | Page load                        | `isGuest`, `tier`             |
| `concept_selected`       | Concept card clicked             | `concept`                     |
| `generation_started`     | Generate button clicked          | `concept`, `hasGroup`, `keywordLength` |
| `generation_completed`   | Images loaded                    | `designId`, `durationMs`      |
| `generation_failed`      | Generation error                 | `errorCode`                   |
| `representative_selected`| Image selected                   | `designId`, `index`           |
| `design_published`       | Publish button clicked           | `designId`, `concept`         |
| `design_saved_private`   | Save Private clicked             | `designId`                    |
| `design_regenerated`     | Regenerate clicked               | `previousDesignId`            |
| `guest_signup_prompt`    | Guest hits auth-required action  | `action`                      |
| `credit_generation`      | Generate with Credit clicked     | `designId`, `creditBalance`   |
| `credits_insufficient`   | User sees "Get Credits" prompt   | `creditBalance`               |
