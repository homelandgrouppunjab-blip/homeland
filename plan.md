# Content Humanization + SEO Readiness Plan (Homeland Group Mohali)

## 1) Objectives
- Rewrite **project descriptions/summaries** and **homepage/about story copy** in a **premium, polished** brand voice.
- **Preserve facts exactly** (RERA numbers, sizes, sectors, dates, prices, status/possession claims).
- Apply changes to **`/app/api/seed-data.json`** and ensure the **runtime data stores reflect it** (MySQL as read-store; optional Mongo source-of-truth scenarios).
- Make the site more **SEO / Google-search ready** with:
  - Per-route titles/descriptions/canonical
  - Correct OG/Twitter metadata
  - Structured data (JSON-LD)
  - Sitemap coverage for project pages

**Current status:** All objectives above are **completed and verified locally**.

---

## 2) Implementation Steps

### Phase 1 — Core POC: “SEO rendering + humanized content shows up”
**Goal:** Prove that (a) rewritten content is visible end-to-end and (b) dynamic meta tags can be set per route.

**User stories (POC)**
1. As a visitor, I can open a project page and read a premium, polished summary that still matches the original facts.
2. As a visitor, the browser tab title and meta description match the project I’m viewing.
3. As a crawler, the homepage has indexable fallback content even if JS is disabled.
4. As a marketer, I can verify canonical URL and OpenGraph values for a project page.
5. As a QA tester, I can reseed/refresh content and see copy changes immediately in the UI.

**Steps (as built)**
1. **Rewrite flagship projects first** (used as tone benchmark):
   - Updated `tagline`, `description`, `specifications` wording while keeping all numbers/claims intact.
2. Rewrite **`site_content.main.history_intro`** + `history_full[]` to a premium, polished tone (facts unchanged).
3. Add SEO POC (final approach differs from original plan):
   - Implemented a reusable **`<Seo />`** component at `frontend/src/components/Seo.js`.
   - Uses an **effect-based, in-place head update** strategy to prevent duplicate/conflicting tags in a CRA/SPA environment.
   - Applies SEO on **Home**, **About**, and **ProjectDetail** with project-specific title/description/canonical.
   - Adds JSON-LD injection in `<head>` with cleanup on unmount.
4. Run locally:
   - Verified via API that MySQL returns updated content.
   - Verified in browser that humanized copy renders and that `<title>`, `<meta name="description">`, and `<link rel="canonical">` update correctly.

**Stop/Fix Gate (result):** ✅ Passed. Project page shows humanized content and correct per-page metadata without duplicates.

---

### Phase 2 — V1 App Development: full content humanization + solid SEO baseline
**User stories (V1)**
1. As a visitor, every project page reads naturally and consistently in a premium brand voice.
2. As a visitor, homepage and about page communicate the brand story clearly without sounding auto-generated.
3. As a search engine, each major route has an appropriate title/meta description/canonical.
4. As a user, project pages show structured details (RERA, location, unit types) without any factual drift.
5. As an admin/owner, reseeding/refreshing restores the polished default copy consistently.

**Steps (as built)**
1. **Humanize all projects** in `api/seed-data.json`:
   - Completed across all **10** projects.
   - Updated prose fields (e.g., `description`, `specifications`) while preserving all facts.
2. **Humanize company story** in `api/seed-data.json`:
   - Updated `history_intro` and `history_full` to polished brand copy.
3. **SEO baseline completion (expanded)**:
   - Wired `<Seo />` into these routes/pages:
     - `/` (Home)
     - `/projects` (Projects)
     - `/projects/:slug` (ProjectDetail) + **Residence JSON-LD**
     - `/about` (About)
     - `/contact` (Contact)
     - `/upcoming` (Upcoming)
     - `/insights` (Insights)
     - `/insights/:slug` (PostDetail) + **Article JSON-LD**
     - `/vision` (Vision)
     - `/locations` (Locations)
     - `/rera` (Rera)
     - `/brochures` (Brochures)
     - `/compare` (Compare)
   - Confirmed **no duplicate canonical/description** tags after navigation.
4. **Canonical conflict prevention**:
   - Removed the **static canonical** link from `frontend/public/index.html` to avoid conflicts.
   - Canonicals are now set per-route by `<Seo />`.
5. **Sitemap expansion**:
   - Updated `frontend/public/sitemap.xml` to include all **10** `/projects/<slug>` URLs.
   - Verified `robots.txt` references the sitemap.
6. **Data store alignment / reseed behavior**:
   - Ensured `seed-data.json` is the durable source.
   - Applied changes into the **live MySQL read-store** and also into the **legacy Mongo copies** using narrowly scoped updates (`$set` on text fields only; no drops).
7. **Regression checks**:
   - Confirmed the frontend production build passes (`craco build`).
   - Verified via browser checks and screenshots:
     - Humanized copy is visible.
     - Titles/descriptions/canonicals are correct.
     - SPA navigation updates metadata properly.

**Phase 2 result:** ✅ Completed.

---

### Phase 3 — Hardening + validation (SEO QA + content QA)
**User stories (Hardening)**
1. As a visitor, sharing any page on WhatsApp/Facebook shows correct preview title/description.
2. As a crawler, canonical URLs are consistent (no www vs non-www duplicates).
3. As a QA tester, no page has missing/empty title/description.
4. As a visitor, project pages load fast and do not break due to SEO tag handling.
5. As an owner, I can spot-check that no RERA/price/location facts changed during rewriting.

**Steps (as validated locally)**
1. SEO QA checklist:
   - Confirmed a **single** `description` + **single** `canonical` on pages after refactor.
   - Confirmed per-route canonical updates correctly on SPA navigation.
   - Confirmed JSON-LD scripts inject into `<head>` and do not accumulate across navigations.
2. Content QA checklist:
   - Spot-checked key projects (e.g., CP67) that RERA and structured fields remain unchanged.
3. Build QA:
   - Confirmed CRA/CRACO production build succeeds.

**Phase 3 result:** ✅ Completed locally.

---

## 3) Next Actions
1. **Commit + push changes** to GitHub:
   - `api/seed-data.json`
   - `frontend/src/components/Seo.js`
   - Updated page files with `<Seo />` wiring
   - `frontend/public/index.html` (static canonical removed)
   - `frontend/public/sitemap.xml`
2. **Hostinger deployment validation (must-do before claiming “live SEO works”)**:
   - Redeploy and confirm the production site serves the correct app backend.
   - Validate these on the live domain:
     - `/api/` returns this app’s signature response
     - `/api/health` shows `mysql.ok: true`
     - `/api/projects` returns the seeded projects
   - Validate SEO on live:
     - Check page source/head tags after render (title/description/canonical)
     - Check `/sitemap.xml` accessibility
3. Optional improvements (future):
   - Consider SSR / pre-rendering for social crawlers that do not execute JS (the current solution is optimized for Googlebot).
   - Add automated QA script to ensure every project has non-empty `tagline`/`description` and every route sets canonical.

---

## 4) Success Criteria
- **Copy quality:** Projects + story read premium/polished and consistent.
- **Fact integrity:** No changes to numeric/legal fields (RERA, sizes, sectors, dates, prices).
- **Functional:** Seed-driven content is reflected in MySQL runtime data and visible in the UI.
- **SEO-ready (SPA):**
  - Unique titles/descriptions/canonicals for major routes + project pages
  - No duplicate/conflicting `canonical` or `description`
  - JSON-LD present on project pages and posts
  - Sitemap includes project URLs
- **Build-ready:** Frontend production build completes successfully.
