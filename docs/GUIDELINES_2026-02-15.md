# GUIDELINES (2026-02-15)

## Purpose

This document captures the current live product/engineering rules agreed and implemented in this session.

---

## Policy Decisions

### Superstar Policy
- Superstar weight: `1 Superstar = 10 Likes`
- Usage limit: **once per week per account (global)**
- Cooldown handling:
  - button can be tapped even when unavailable
  - cooldown popup appears
  - next available time is shown in popup

### Ranking & Exposure
- Ranking score formula: `likeCount + (boostCount * 10)`
- Gallery popular sorting must follow the same weighted score logic
- Tie-breaker recommendation: higher `likeCount`

### Metric Visibility
- Show both Like and Superstar on key thumbnails/cards:
  - gallery cards
  - landing best pick cards
  - mypage design thumbnails
  - design detail related/recommended thumbnails
  - ranking list items

---

## Implemented Technical Rules

### Boost API Contract (`/api/boost/[designId]`)
- `POST`:
  - increments only by 1 per valid request
  - checks global weekly cooldown by user (`boostUsers/{uid}`)
  - returns `BOOST_COOLDOWN` (429) with `nextAvailableAt` when blocked
- `GET`:
  - returns `boosted`, `userBoostCount`, `canBoost`, `nextAvailableAt`

### Data Model Additions
- `boosts/{designId_uid}`:
  - per-design lifetime count
- `boostUsers/{uid}`:
  - global cooldown anchor (`lastBoostAt`)
  - lifetime total count

### UI Behavior (Design Detail)
- Superstar button states:
  - available: "주간 슈퍼스타 보내기"
  - unavailable: "이번 주 사용 완료"
- on unavailable tap: show cooldown popup (not silent fail)

---

## UX Cleanup Decisions

- Removed persistent Superstar policy text block from detail page to reduce clutter.
- Kept policy discoverability via contextual popup and disabled-state labeling.

---

## Ads Implementation Status

- Current mode: mock ad placeholder supported.
- Live AdSense switch available via env flags.
- Studio loading ad dwell controls currently hardcoded.
- TODO: move ad dwell controls to admin settings (tracked in `docs/TODO.md`).

---

## Verification Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] Gallery popular order matches weighted ranking expectation
- [ ] Superstar cooldown works across different designs for same account
- [ ] Cooldown popup appears with next available time
- [ ] Like + Superstar both visible on key card surfaces

