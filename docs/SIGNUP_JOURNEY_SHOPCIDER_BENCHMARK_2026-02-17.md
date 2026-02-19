# Signup Journey Plan (ShopCider Benchmark)

- Date: 2026-02-17
- Scope: Benchmark `shopcider` signup journey and define MyStyleAI signup planning draft
- Source checked:
  - https://www.shopcider.com/login

## 1) What Was Confirmed on ShopCider

Observed on `https://www.shopcider.com/login`:

- One combined entry: `Log in / Join`
- Single primary input: email
- Single primary CTA: `Continue`
- Secondary auth options: `Google`, `Facebook`
- Consent copy shown before completion:
  - By providing email, user accepts `Terms & Conditions` and `Privacy Policy`

Interpretation:

- They remove initial friction by avoiding "create account vs login" branching first.
- They ask for only one commitment at first: email.
- They keep social sign-in visible as an immediate alternative.

## 2) Design Principles To Borrow

- Start from one field, not one form.
- Delay complexity (password/profile fields) until intent is clear.
- Keep auth mode detection system-driven, not user-driven.
- Keep legal consent explicit but lightweight.

## 3) MyStyleAI Target Journey (Planning Draft)

This plan is optimized for current auth stack in `src/context/AuthContext.tsx`:
- available now: email+password, Google
- not available now: Facebook, email OTP/magic link

### Screen A: Unified Entry (`/login`)

Goal:
- Same mental model as ShopCider: one door for login/signup

Components:
- Title: `로그인 / 시작하기`
- Email input only
- Primary button: `계속`
- Divider: `또는`
- Social button: `Google로 계속하기`
- Legal copy with terms/privacy links

Microcopy:
- Helper: `이메일만 입력하면 다음 단계로 안내해드려요.`
- Error: `올바른 이메일 형식을 입력해주세요.`

### Screen B: Account Path Resolution (System decides)

Trigger:
- User clicks `계속` on Screen A

Behavior:
- Check if account exists for this email.
- Existing user -> show `비밀번호 입력` (login path)
- New user -> show `가입 정보 입력` (signup path)

Why:
- No need for user to choose login/signup tabs first.
- Fewer wrong-path errors (`이미 가입된 이메일`, `계정 없음`).

### Screen C1: Existing User Login

Fields:
- Password only (email shown read-only)

CTA:
- `로그인`

Links:
- `비밀번호를 잊으셨나요?` (Phase 2 if reset flow not ready)
- `다른 이메일 사용`

Errors:
- `이메일 또는 비밀번호가 올바르지 않습니다.`
- `로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.`

### Screen C2: New User Signup

Fields:
- Password
- Nickname (optional)

CTA:
- `가입 완료`

Helper:
- `비밀번호는 6자 이상`

Errors:
- `이미 사용 중인 이메일입니다. 로그인으로 진행해주세요.`
- `비밀번호는 6자 이상이어야 합니다.`

### Screen D: First Success Landing

Goal:
- Reduce drop before first value

Behavior:
- Immediately redirect to `/studio` (current product core)
- Show one short welcome toast:
  - `환영해요. 첫 무대의상 디자인을 시작해보세요.`

## 4) Metrics (Must Define Before Build)

- Entry -> Continue click rate
- Continue -> auth success rate
- New user completion time (sec)
- Error rate by step (invalid email, wrong password, duplicate email)
- Google sign-in share (%)

## 5) A/B Test Proposal (From TODO Alignment)

Test goal:
- Find lower-friction order for onboarding vs preset choice

Variant A (`survey-first`):
- Signup complete -> onboarding survey -> preset selection -> studio

Variant B (`preset-first`):
- Signup complete -> preset selection -> onboarding survey -> studio

Primary KPI:
- Day-0 first generation completion rate

Secondary KPI:
- Signup completion rate
- Time to first generation

## 6) Build Phasing

### Phase 1 (Now, no auth provider expansion)

- Replace current login/signup tabs with unified email-first flow
- Keep Google sign-in
- Keep email+password under progressive disclosure

### Phase 2

- Add password reset UX
- Consider passwordless email link/OTP
- Optional: add Facebook/Apple only if strategic value is proven

## 7) Implementation Notes (Codebase Mapping)

- UI page to update: `src/app/login/page.tsx`
- Auth API currently used:
  - `signInWithEmail(email, password)`
  - `signUpWithEmail(email, password, displayName?)`
  - `signInWithGoogle()`
- For system-driven path resolution, add method in auth layer:
  - `fetchSignInMethodsForEmail` (Firebase Auth) to detect existing account path before password step

## 8) Decision Summary

- Keep ShopCider-style low-friction entry: yes
- Copy Facebook provider: no (not in current stack)
- Immediate next build candidate: unified email-first screen + system path resolution

