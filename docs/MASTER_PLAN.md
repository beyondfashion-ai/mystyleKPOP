# MyStyleAI: K-POP Fan Fashion Platform Master Plan
**From Prompt to Stage: Design Your Idol's Stage Outfit.**

- **Version:** 2.1 (Final MVP Spec + Growth Features)
- **Date:** 2026-02-12
- **Status:** Development Ready

### Policy Update (2026-02-15)
- ⭐ **Superstar is limited to once per week per account (global).**
- Ranking score uses **`Like + (Superstar × 10)`**.
- UI always displays Like and Superstar separately on thumbnails and detail.

---

## Part 1: Executive Summary & Product Vision

### 1.1 Mission Statement
A K-POP fashion platform designed where fans create stage outfit drafts with just a few lines of text, leading to **Sharing · Competition (Voting) · Reward (Real Production)**.

### 1.2 Market Premise: K-POP is 'Organized Fandom Behavior'
- The K-POP market is not just about passive consumption but operates on a loop of **"Goal Setting (Making #1) → Organized Action (Voting/Streaming) → Achievement (Sense of Accomplishment)"**.
- Existing fandom activities are limited to 'consumption (albums/merch)' or 'simple voting', lacking the experience where **"My creation impacts the artist's reality."**

### 1.3 Strategy: 3-Step Participation Model (Create / Support / Boost)
Do not force every user to be a creator; instead, reflect actual fandom roles in the product.
1.  **Creator:** Designs outfits via prompts and enters the competition.
2.  **Supporter:** Even if they don't design, they vote for their taste/artist's outfit with ❤️ Like.
3.  **Booster:** Uses ⭐ Boost for high-impact support (current live policy: weekly limited boost).

### 1.4 Key Differentiator: R2R (Real-to-Reward)
- The #1 Monthly Ranking design is **manufactured into a real outfit** and delivered to the artist/agency or donated in the fandom's name.
- This is the core engine that proves platform trust not with 'words' but with 'results'.

### 1.5 Pay-to-Win Policy: 'Standardization of Support'
- Usage of paid currency is not 'unfair' but recognized as 'support effort'.
- However, for trust, **Like (Free/1 person 1 vote)** and **Boost (Weighted/Weekly-limited)** are strictly **displayed separately**.

---

## Part 2: Product Specification

### 2.1 Information Architecture (IA)
- `/` **Landing:** 3-Second Understanding (Mission) + Start Button + Hall of Fame (Trust).
- `/studio` **Studio:** Create & Select Representative Image.
- `/gallery` **Gallery:** Explore & Support (Vote).
- `/design/[id]` **Detail:** View Detail, Share, Vote, Boost.
- `/ranking` **Ranking:** Check Monthly Competition Status.
- `/account` **My Page:** My Activity, Currency History (Ledger), Settings.
- `/admin/*` **Admin:** Operations Console (Inaccessible to general users).

### 2.2 User Roles & Permissions
- **Guest:** 1 Trial (Create only), Cannot Save/Vote.
- **Free (Login):** Daily Limit (10), Publish, Save, ❤️ Like participation. Extra generation via Credits (Phase 2+).
- **Superfan (Sub):** Private Save, 🎬 Animate (Video), Ad-free.
- **Booster (Phase 2):** Users who hold and use Credits.

### 2.3 Core UX Details
1.  **Studio (Playground)**
    * **UI:** Left Input (Group/Concept/Keyword) / Right Result (2x2 Grid).
    * **Process:** Input → Generate (4 images) → **Select 1 Representative Image (Mandatory)** → Publish Button Activates.
    * **Reason:** Forcing users to select the best image filters quality and builds attachment.
2.  **Gallery & Detail**
    * **Card:** Thumbnail + ❤️ Like Count + (Phase 2) ⭐ Boost Gauge.
    * **Interaction:** ❤️ Like is strictly limited to 1 per user per design.
    * **Share:** External sharing (Twitter/X) generates a link with the thumbnail.
3.  **Ranking**
    * Resets monthly.
    * UI explicitly states that scoring methods differ by Phase.

### 2.4 Growth Mechanics (Retention & Viral)
1.  **Daily Streak (Attendance Reward):**
    * **Logic:** Completing **"3 Votes"** daily grants a small amount of free credits.
    * **Goal:** Encourage users with high creation fatigue to visit daily, maintaining DAU.
2.  **Share-to-Unlock (Viral Loop):**
    * **Logic:** 1 of the 4 generated images is blurred or high-quality download is locked. Unlocks upon **"Share to Friend"**.
    * **Goal:** Maximize organic inflow without initial marketing costs (adopting viral psychology test mechanics).

---

## Part 3: Operations & Monetization Roadmap

### 3.1 Monetization Model
1.  **Subscription (Superfan Pass):** Selling Convenience (Private Save, Animate). Does not directly affect competition.
2.  **Currency (Credits):** Selling Influence (Enhanced Exposure, Voting Rights).
3.  **Generation Credits:** Additional image generation beyond daily free limit of 10 (1 generation = 1 Credit, ~$0.01-0.02/credit).
4.  **Google AdSense:** Display advertising revenue (Phase 2-A). Removed or minimized in Phase 2-B.

### 3.1.1 Credit Package Pricing (Phase 2-B)
"Low Barrier" strategy: Priced at the lowest level compared to competitors to minimize entry friction.

| Package | Credits | Price | Per Credit | Note |
|---|---|---|---|---|
| Starter | 50 Credits | $0.99 | $0.020 | First purchase incentive |
| Basic | 150 Credits | $2.49 | $0.017 | Expected most popular |
| Value | 500 Credits | $6.99 | $0.014 | Heavy user value |
| Pro | 1,200 Credits | $12.99 | $0.011 | Maximum discount |

### 3.2 Phase Roadmap (Confirmed)
* **Phase 1 (MVP):**
    * Ranking based **only on ❤️ Like (Free)**.
    * Validate basic Create/Share/Vote loop.
    * Daily free generation limit: 10. No credit system yet.
* **Phase 2-A (Traffic & Learning):**
    * **Introduce Free Currency (Ads/Missions).**
    * **Enable Google AdSense:** Display ads in Gallery (every 8th card) and Studio loading screen.
    * **Rewarded Ads:** Watch ad → earn free Credits for extra image generations.
    * Users can spend free Credits for **extra image generations** beyond daily limit (10/day).
    * Open ⭐ Boost: Not reflected in ranking score, used only for **"Trending Top Exposure"**.
    * Educate users on the behavior of "Collecting credits to push my artist".
* **Phase 2-B (Revenue):**
    * **Introduce Paid Currency + Remove/minimize Ads.**
    * **Paid Generation Credits:** Purchase Credits via PayPal (Starter: 50/$0.99 ~ Pro: 1200/$12.99).
    * **Remove/minimize Google AdSense ads.**
    * Extra image generations beyond daily limit (10) cost 1 Credit each.
    * Introduce ⭐ Boost Vote: **Currency = 1 Vote** (Reflected in Ranking Score).
    * Transition with announcement: "From this season, Boost reflects in scores."

---

## Part 4: Governance & Security

### 4.1 Data Integrity Principle (Server-write Only)
- **Clients (Browsers) can NEVER directly Write to Firestore DB.**
- All write operations (Create, Vote, Use Currency) differ strictly through **API Routes (`src/app/api/*`)**.
- This fundamentally blocks prompt leakage, counter manipulation, and abnormal currency acquisition.

### 4.2 Admin Privileges (Custom Claims)
- Admin authority is judged solely by Firebase Auth **Custom Claims (`admin: true`)**, not DB fields.
- Double verification via Security Rules and API Middleware.

### 4.3 Transparency Policy
- **Private Prompts:** Protect creator efforts and prevent copycat services.
- **Separate Display:** Show Like (Fandom Size) and Boost (Fandom Power/Capital) separately to defend against "bought with money" criticism.
- **Logs (Ledger):** All currency acquisition/usage/refund history is recorded in `credits_ledger` collection as basis for dispute resolution.

---

## Part 5: Execution Plan

### 5.1 Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Auth/DB:** Firebase Auth, Firestore, Storage
- **AI Model:** fal.ai (Flux/LoRA) - **Server-side call mandatory**
- **Validation:** Zod (API Input Validation)

### 5.2 Folder Structure (Standardized)
- **Root:** `public/`, `docs/` (Documentation), `CLAUDE.md` (AI Rules)
- **Source:** `src/app/` (Single App Router Structure)
- **API:** `src/app/api/**/route.ts`

### 5.3 Documentation Package (docs/ folder)
Specific implementation guides follow these files:
1.  `docs/BOOTSTRAP_MVP.md`: Project initial setup and folder structure commands.
2.  `docs/SECURITY_RULES.md`: Firestore security rules (Server-write only policy).
3.  `docs/DATA_MODEL.md`: DB schema and index design.
4.  `docs/API_CONTRACTS.md`: API request/response specs (Zod schemas).
5.  `docs/UX_SPEC_PLAYGROUND.md`: Studio UX detailed flow.
