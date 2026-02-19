# Onboarding Personalization Plan

- Date: 2026-02-17
- Goal: Collect user taste during signup and immediately personalize the Studio ("making room") generation flow
- Status: Planning draft (implementation-ready)

## 1) Product Goal

During signup, ask a short set of preference questions (style, color, favorite idols/groups) and convert answers into:
- prefilled Studio inputs
- personalized prompt chips
- recommended concept and idol type defaults

Success means users reach first generation faster with less typing.

## 2) Friction Budget

Keep signup lightweight:
- hard limit: 5 questions
- target completion time: under 45 seconds
- at least 2 questions skippable

This keeps ShopCider-like low friction while adding personalization value.

## 3) Signup Journey (Personalization Added)

### Step A. Unified Auth Entry
- Email -> Continue
- Google option
- system decides login vs signup path

### Step B. Account Creation
- Password (+ optional nickname)
- Account created

### Step C. Personalization Quick Survey (new)
- Show as "30-second setup"
- 5 short cards, one question per card
- progress indicator: `1/5 ... 5/5`
- allow `건너뛰기`

### Step D. Immediate Studio Personalization
- Redirect to `/studio`
- Apply survey result automatically:
  - idol type default
  - concept preselect
  - favorite group tag prefill
  - starter prompt generated from selected style and colors

## 4) Question Set (v1)

Q1. Favorite idol type (single select)
- `걸그룹`, `보이그룹`, `둘 다`
- mapping:
  - 걸그룹 -> `idolType=girlgroup`
  - 보이그룹 -> `idolType=boygroup`
  - 둘 다 -> keep current default + no forced lock

Q2. Favorite idols/groups (multi select + optional free text)
- max 3
- examples: `IVE`, `aespa`, `NewJeans`, `BTS`, `SEVENTEEN`, custom text
- mapping:
  - first selected value -> prefill `groupTag`
  - full list -> user profile preference memory

Q3. Preferred style mood (single select)
- `Y2K`, `하이틴`, `스트릿`, `수트`, `걸크러쉬`, `미래지향적`
- mapping:
  - set `conceptStyle` default in Studio

Q4. Favorite color palette (multi select, max 2)
- `블랙/실버`, `핑크/화이트`, `레드/블랙`, `블루/화이트`, `네온 믹스`, `파스텔`
- mapping:
  - injected as color tokens in starter prompt

Q5. Stage vibe preference (single select)
- `화려한 콘서트`, `시크/럭셔리`, `귀엽고 밝게`, `다크/강렬`
- mapping:
  - appended as mood clause in starter prompt

## 5) Prompt Personalization Rules

Build a starter prompt at first Studio entry:

`{favorite_group_or_idol} style, {selected_style_keywords}, {color_palette_keywords}, {stage_vibe_keywords}`

Example:
- Inputs: `aespa`, `미래지향적`, `블랙/실버`, `다크/강렬`
- Starter prompt:
  - `aespa style, futuristic stage outfit, black and silver palette, intense dark concert vibe`

Rules:
- Keep under 160 chars for first-fill prompt text
- no copyrighted song/album phrase injection
- user can edit freely before generation

## 6) Data Model Extension (`users/{uid}`)

Add field:

```ts
interface UserPersonalization {
  onboardingCompleted: boolean;
  onboardingVersion: "v1";
  favoriteIdolType?: "girlgroup" | "boygroup" | "both";
  favoriteGroups?: string[]; // max 3
  preferredConcept?: "cyber" | "y2k" | "highteen" | "street" | "suit" | "girlcrush";
  preferredColors?: string[]; // max 2
  preferredStageVibe?: "glam" | "chic" | "bright" | "dark";
  starterPrompt?: string;
  updatedAt: Timestamp;
}
```

Store under:
- `users/{uid}.personalization`

## 7) API Plan

### `POST /api/users/personalization`
- auth required
- validates survey payload (zod)
- writes `users/{uid}.personalization`
- returns computed `starterPrompt`

### `GET /api/users/personalization`
- auth required
- returns saved personalization

Validation constraints:
- `favoriteGroups.length <= 3`
- `preferredColors.length <= 2`
- sanitize custom idol/group text (length + allowed chars)

## 8) Studio Integration Plan

File focus: `src/app/studio/page.tsx`

On first load for logged-in users:
1. fetch personalization
2. if exists and local state still default:
   - set `idolType`
   - set `conceptStyle`
   - set `groupTag`
   - inject `starterPrompt` into prompt/tag input
3. show toast:
   - `취향 기반으로 메이킹룸을 맞춰뒀어요.`

Do not overwrite user edits after first interaction.

## 9) Experiment Plan

A/B test only for signup users:

- Variant A: personalization survey immediately after signup
- Variant B: enter Studio first, show survey after first generation

Primary KPI:
- first generation completion rate (D0)

Secondary KPI:
- signup completion rate
- time-to-first-generation
- generation count in first session

## 10) Analytics Events

- `signup_personalization_started`
- `signup_personalization_completed`
- `signup_personalization_skipped`
- `studio_personalization_applied`
- `starter_prompt_edited_before_generate`
- `first_generation_completed`

## 11) Rollout Sequence

Phase 1:
- implement survey UI + save endpoint + studio prefill

Phase 2:
- improve recommendation quality from behavior (generated concepts, liked posts)

Phase 3:
- dynamic preset packs by fandom cluster

## 12) Non-Goals (v1)

- no heavy quiz (10+ questions)
- no mandatory personalization gate
- no model fine-tuning per user

