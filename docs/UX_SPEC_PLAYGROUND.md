# UX_SPEC_PLAYGROUND.md — Studio Page Specification

> UX specification for the `/studio` page (generation studio).
> Core experience: prompt input -> AI generation -> preview -> publish.
> Layout: **mobile-first single column** (`max-w-md mx-auto`).

---

## Overview

The Studio page guides users through a 4-step generation flow to create KPOP stage outfit designs. The form is always visible, and generated images appear as a preview section below the form.

**UX Priority:** Fast start, form always visible, preview below, multi-image publish support.

---

## Layout: Single Column (Mobile-First)

```
┌──────────────────────────────────────┐
│  Header (fixed top)                  │
├──────────────────────────────────────┤
│  Step 1: Idol Type (3 cols)          │
│  Step 2: Concept Style (3 cols)      │
│  Step 3: Keywords + Hashtags         │
│  Step 4: Image Count (1/2/4)         │
│  [Generate Button]                   │
│                                      │
│  ── 프리뷰 ──  (after generation)    │
│  Image Grid + Checkboxes             │
│  [결과 지우기] [갤러리에 공개]         │
├──────────────────────────────────────┤
│  BottomNav (fixed bottom)            │
└──────────────────────────────────────┘
```

The form is **never hidden** — after generation, the preview section simply appears below the form. Users can modify inputs and regenerate without losing context.

---

## User Flow

```
[Enter Studio]
    │
    ├─ Step 1: Select Idol Type (girlgroup / boygroup / solo)
    │
    ├─ Step 2: Select Concept Style (7 options, girlcrush = girlgroup only)
    │
    ├─ Step 3: Enter Keywords + tap hashtag suggestions
    │       Hashtags append as #tags directly into the textarea
    │
    ├─ Step 4: Select Image Count (1 / 2 / 4)
    │
    ├─ [Generate] button
    │       │
    │       ├─ Loading overlay (~5-10 seconds)
    │       │   Rotating Korean messages
    │       │
    │       └─ Preview section appears below form
    │               │
    │               ├─ Tap any image → fullscreen popup
    │               ├─ Checkbox (top-right) to select/deselect for publish
    │               ├─ First image auto-selected by default
    │               │
    │               └─ Actions:
    │                   ├─ [갤러리에 공개] → Publish modal (bottom sheet)
    │                   ├─ [결과 지우기] → Clear preview, keep form
    │                   └─ [N장 다시 생성하기] → Regenerate (form button text changes)
    │
    └─ Post-Publish: Success screen with share buttons (X, Link, KakaoTalk)
```

---

## Input Section (Steps 1-4)

### Step 1: Idol Type

- **Type:** 3-column button grid (single-select)
- **Options:**

| ID          | Label    | Prompt              | Icon |
| ----------- | -------- | ------------------- | ---- |
| `girlgroup` | 걸그룹   | K-POP girl group    | 👩‍🎤  |
| `boygroup`  | 보이그룹 | K-POP boy group     | 🧑‍🎤  |
| `solo`      | 솔로     | K-POP solo artist   | 🎤   |

- **Default:** `girlgroup`
- **UI:** Black bg when selected, white border when not

### Step 2: Concept Style

- **Type:** 3-column visual card grid (single-select, toggleable)
- **Options:**

| ID          | Label      | Gradient Colors                              | Girl Only |
| ----------- | ---------- | -------------------------------------------- | --------- |
| `cyber`     | 사이버펑크 | violet-600 → purple-700 → blue-900          | No        |
| `y2k`       | Y2K        | pink-400 → fuchsia-300 → yellow-300         | No        |
| `highteen`  | 하이틴     | sky-400 → cyan-300 → pink-200               | No        |
| `sexy`      | 섹시       | rose-600 → red-500 → pink-400               | No        |
| `suit`      | 수트       | slate-700 → gray-600 → slate-800            | No        |
| `street`    | 스트릿     | gray-600 → gray-800 → gray-950              | No        |
| `girlcrush` | 걸크러쉬   | red-800 → rose-900 → gray-900              | **Yes**   |

- Each card has gradient background (7% opacity default, 25% when selected)
- Selected: `ring-2 ring-black`, checkmark icon top-right
- `girlcrush` only visible when idol type = `girlgroup`
- Each concept sends both `mood` (for generation mood) and `prompt` (for style keywords)

### Step 3: Keywords + Hashtags

- **Type:** Textarea (3 rows) + horizontal scrolling hashtag chips
- **Hashtag behavior:**
  - Tapping a hashtag appends `#keyword` directly to the textarea text
  - Tapping again removes it from the textarea
  - Manually deleting from textarea auto-deselects the chip
  - Natural text flow — hashtags mix with free-text input
- **Available hashtags:**

| Label        | Keyword      |
| ------------ | ------------ |
| #무대의상     | 무대의상     |
| #Y2K패션      | Y2K         |
| #스트릿       | 스트릿       |
| #시퀸드레스   | 시퀸 드레스  |
| #크롭탑       | 크롭탑       |
| #오버사이즈   | 오버사이즈   |
| #레더재킷     | 레더 재킷    |
| #네온컬러     | 네온 컬러    |
| #플리츠스커트 | 플리츠 스커트 |
| #하이부츠     | 하이부츠     |

- Character limit: 500
- Keywords stored as comma-separated string in `keywords` field

### Step 4: Image Count

- **Type:** 3-button row (single-select)
- **Options:** 1장 / 2장 / 4장
- **Icons:** `image` / `photo_library` / `grid_view`
- **Default:** 1

### Generate Button

- **Full width, rounded-full, black bg**
- **Label (dynamic):**
  - Before generation: `{N}장 디자인 생성하기`
  - After generation: `{N}장 다시 생성하기`
- **Disabled:** When prompt is empty or during generation
- **Loading state:** Spinner + "생성 중..."

---

## Preview Section

Appears below the form after generation. Separated by a divider with label "프리뷰".

### Image Grid

- **1 image:** Full width, `aspect-[3/4]`
- **2+ images:** 2-column grid, `aspect-[3/4]` each
- **Tap image:** Opens fullscreen popup (no separate zoom icon needed)
- **Selection:**
  - Each image has a round checkbox (top-right corner)
  - `bg-black text-white` when selected, `bg-white/80 border-gray-300` when not
  - **First image auto-selected** by default after generation
  - Multiple images can be selected for publish
  - Counter shown: "공개할 이미지를 선택하세요 (1/4)"

### Fullscreen Popup

- Fixed overlay, `z-[70]`, `bg-black/90`
- Close button (top-right)
- Image displayed at `aspect-[3/4]`, `object-contain`
- Bottom button to toggle selection: "공개 목록에 추가" / "선택됨"

### Action Buttons

- **Row of 2 buttons:**
  - `결과 지우기` — Clears preview, keeps form intact
  - `갤러리에 공개` / `{N}장 공개` — Opens publish modal
- Toast shown if no images selected: "공개할 이미지를 선택해주세요"

---

## Publish Modal (Bottom Sheet)

- **Trigger:** "갤러리에 공개" button
- **z-index:** `z-[60]` (above BottomNav)
- **Structure:** 3-part flex-col layout
  1. **Header (fixed):** Drag handle + title + close button
  2. **Content (scrollable):** Image preview + tags + title input + description input
  3. **Button (fixed bottom):** "갤러리에 공개하기" with `border-t`, `pb-6`
- **Image preview:**
  - 1 image: full-width square
  - 2+ images: 2-column square grid
- **Fields:**
  - Concept & hashtag chips (read-only summary)
  - Title input (optional, 50 chars max)
  - Description textarea (optional, 200 chars max)
- **Publishes:** All selected images as `imageUrls` array

---

## Publish Success Screen

- Full page replacement (not a modal)
- Shows published images (single or grid)
- "공개 완료" badge
- Share buttons:
  - "친구에게 공유하기" (Web Share API / fallback to link copy)
  - X (Twitter), 링크 복사, 카카오톡 (3-column grid)
- Navigation: "디자인 보기" / "새로 만들기"

---

## Loading Overlay

- Fixed fullscreen, `bg-white/95 backdrop-blur-sm`, `z-50`
- Large spinner (64px)
- Title: "AI가 디자인하는 중..."
- Rotating messages (every 3 seconds):
  1. 실루엣과 스테이지 무드를 잡고 있어요...
  2. 패브릭 텍스처, 컬러, 광택을 조합 중...
  3. 퍼포먼스에 어울리는 디테일을 구성 중...
  4. 악세서리를 매치하고 컨셉을 다듬는 중...
  5. 마지막 터치: 더 대담하고 선명하게...

---

## AI Generation Details

### Model

- **fal-ai/flux-2/turbo** via `@fal-ai/client`
- Parameters: `image_size: "square_hd"`, `num_inference_steps: 8`, `guidance_scale: 3.5`
- Each image gets a unique random `seed`

### Prompt Composition

Natural language prompt built per image with randomized elements:

```
A {idolType} wearing a K-pop stage costume, {userKeywords}.
Style: {conceptPrompt}.
Mood: {conceptMood}.
{randomFraming}, {randomPose}, {randomAngle}.
Broadcast photography, telephoto 85-135mm f/2.8 lens, sharp focus on face and outfit.
Vibrant stage lighting, rim lighting, bright backlights, bokeh background.
Vivid color saturation, soft glow on skin, blurred geometric stage lights in background.
```

### Randomization Pools (per image)

- **10 Poses:** standing confident, walking mid-stride, sitting on stool, leaning against wall, looking over shoulder, kneeling dramatic, dancing mid-move, hands in pockets, pointing at camera, arms raised
- **6 Angles:** eye level, low angle, high angle, three-quarter left, three-quarter right, frontal
- **4 Framings:** full body head-to-toe, full body vertical, wide shot with environment, medium-full knees up

---

## Page Style

```
Container: bg-white text-black antialiased pb-24 min-h-screen font-korean
Content:   max-w-md mx-auto pt-[80px] px-5
Buttons:   rounded-full (primary: bg-black text-white)
Cards:     rounded-xl, border border-gray-200
Inputs:    rounded-xl, border border-gray-200, focus:ring-2 focus:ring-black
```

---

## Error Handling

| Error                    | UI Response                                      |
| ------------------------ | ------------------------------------------------ |
| Generation fails         | Toast: "오류가 발생했습니다. 다시 시도해주세요." (4s) |
| No images selected       | Toast: "공개할 이미지를 선택해주세요" (3s)          |
| Publish fails            | Toast: error message (4s)                        |
| No prompt entered        | Generate button disabled (opacity-40)             |

---

## Analytics Events

| Event                    | Trigger                          | Properties                    |
| ------------------------ | -------------------------------- | ----------------------------- |
| `studio_viewed`          | Page load                        | `isGuest`, `tier`             |
| `concept_selected`       | Concept card clicked             | `concept`                     |
| `generation_started`     | Generate button clicked          | `concept`, `idolType`, `imageCount` |
| `generation_completed`   | Images loaded                    | `imageCount`, `durationMs`    |
| `generation_failed`      | Generation error                 | `errorCode`                   |
| `image_selected`         | Checkbox toggled                 | `index`, `selectedCount`      |
| `design_published`       | Publish confirmed                | `imageCount`, `concept`       |
| `share_clicked`          | Share button on success screen   | `method` (x, link, kakao)    |
