# Content Humanization + SEO Readiness Plan (Homeland Group Mohali) — Updated

## 1) Objectives
- Rewrite **project descriptions/summaries** and **homepage/about story copy** in a **premium, polished** brand voice.
- **Preserve facts exactly** (RERA numbers, sizes, sectors, dates, prices, status/possession claims).
- Apply changes to **`/app/api/seed-data.json`** and ensure the **runtime data stores reflect it** (MySQL as primary store).
- Make the site more **SEO / Google-search ready** with:
  - Per-route titles/descriptions/canonical
  - Correct OG/Twitter metadata
  - Structured data (JSON-LD)
  - Sitemap coverage for project pages
- **New (Deployment reliability / Live correctness):** Ensure the **real Homeland Node/Express backend** answers the live domain so that:
  - `/api/*` routes are served by this app (not a placeholder)
  - MySQL connectivity is visible and resilient
  - Self-hosted images under `/projects/*` render on live pages
  - Owners can confirm live version/build quickly

**Current status:**
- ✅ Content humanization + SEO work: **completed and verified locally**.
- ✅ Backend hardening + status readout: **completed and verified locally**.
- ✅ Database schema + seed content import prepared; app auto-seeds empty tables on startup: **verified locally**.
- ✅ Self-hosted project images bundled and served by the Node service: **verified locally**.
- ❌ **Live domain still serves a generic placeholder API**, so MySQL/images cannot appear live until Hostinger routing/startup config is corrected.

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
1. Rewrite flagship projects first (tone benchmark).
2. Rewrite `site_content.main.history_intro` + `history_full[]` (facts unchanged).
3. Implement reusable `<Seo />` (`frontend/src/components/Seo.js`) using effect-based, in-place updates to prevent duplicates.
4. Verify locally via API + browser (titles/descriptions/canonicals correct; no duplicates).

**Stop/Fix Gate (result):** ✅ Passed.

---

### Phase 2 — V1 App Development: full content humanization + solid SEO baseline
**User stories (V1)**
1. As a visitor, every project page reads naturally and consistently in a premium brand voice.
2. As a visitor, homepage and about page communicate the brand story clearly.
3. As a search engine, each major route has an appropriate title/meta description/canonical.
4. As a user, project pages show structured details (RERA, location, unit types) without factual drift.
5. As an admin/owner, reseeding/refreshing restores the polished default copy consistently.

**Steps (as built)**
1. Humanize all projects in `api/seed-data.json` (10 projects).
2. Humanize company story in `api/seed-data.json`.
3. Wire `<Seo />` across all major routes, projects, and posts.
4. Remove static canonical from `frontend/public/index.html`.
5. Expand `frontend/public/sitemap.xml` to include all project URLs.
6. Confirm frontend production build succeeds.

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
1. Confirm single canonical + single description per page after SPA navigation.
2. Confirm JSON-LD scripts do not accumulate.
3. Spot-check fact integrity (e.g., CP67).
4. Confirm production build passes.

**Phase 3 result:** ✅ Completed locally.

---

### Phase 4 — Live Backend + Database + Images (Hostinger correctness + resilience)
**Goal:** Fix the production blocker where `homelandgroupindia.com/api/*` is answered by a generic placeholder instead of this app.

**User stories (Live readiness)**
1. As an owner, I can open `https://homelandgroupindia.com/api/` and see the Homeland API identity with build/version.
2. As an owner, I can open `https://homelandgroupindia.com/api/health` and see `mysql.ok: true` plus content counts.
3. As a visitor, I can open `/projects` and see 10 projects with images displayed.
4. As an owner, if MySQL is temporarily unreachable, the app still starts and clearly reports **degraded** status rather than silently failing.

**Steps (built in code — verified locally)**
1. **Resilient DB startup** (MySQL init retry/backoff) in `api/db.js`.
2. **Visible status readout**:
   - `/api/` now returns identity + `version/build/started_at`.
   - `/api/version` returns a build marker (service/version/build/node/started_at).
   - `/api/health` reports:
     - MySQL connectivity, resolved DB target, and non-secret wiring info (`host/port/database/user_set/password_set`)
     - Content counts (`projects/posts/faqs/team/updates/uploads/site_content/leads`) so owners can confirm data presence.
3. **Clear boot banner** in runtime logs showing the app started and what it is wired to.
4. Verified end-to-end locally:
   - Auto-seeds empty MySQL from `api/seed-data.json`.
   - Single Node service serves: SPA + `/api/*` + `/projects/*` images + server-side social/SEO meta.
   - Backend tests: 8/8 pass.

**Steps (owner action in Hostinger hPanel — required to go live)**
1. **Hostinger Node.js Application Settings**
   - Application root: **repo root** (`./`)
   - Entry/startup file: **`app.js`**
   - Build command: **`npm run build`**
   - Node version: **20 or 22**
   - Do **not** set `PORT`
2. **Environment variables (Hostinger)**
   - Set a complete MySQL env set (recommended `MYSQL_*`):
     - `MYSQL_HOST` (typically `localhost` on Hostinger)
     - `MYSQL_PORT=3306`
     - `MYSQL_USER`
     - `MYSQL_PASSWORD`
     - `MYSQL_DATABASE=u771530361_homeland`
   - Auth:
     - `JWT_SECRET`
     - `ADMIN_USERNAME`
     - `ADMIN_PASSWORD`
   - Ensure frontend build env does **not** set `REACT_APP_BACKEND_URL` (keep same-origin `/api`).
   - Do not set `MONGO_URL` unless you intentionally want Mongo→MySQL mirroring.
3. **Deploy & cache**
   - Pull/redeploy the latest commit.
   - Restart the Node app.
   - Purge Hostinger CDN/cache after changes.
4. **Live verification (in order)**
   - `https://homelandgroupindia.com/api/`
     - Must show `Homeland Group Mohali API` + build/version fields.
   - `https://homelandgroupindia.com/api/version`
     - Must show `service: homeland-api` etc.
   - `https://homelandgroupindia.com/api/health`
     - Must show `mysql.ok: true` and content counts.
   - `https://homelandgroupindia.com/api/projects`
     - Must return 10 projects.
   - `https://homelandgroupindia.com/projects/cp67.jpg`
     - Must return HTTP 200 image.

**Stop/Fix Gate (Phase 4):**
- ✅ Pass when the live domain’s `/api/` returns this app’s identity and `/api/health` shows `mysql.ok:true` with correct counts.
- If still seeing placeholder JSON (`{"code":200,"data":{}}` or generic 404s), the requests are not hitting this app:
  - Collect and share **Hostinger runtime/application logs** (not build logs).
  - Re-check root/startup file.
  - If necessary: delete and recreate the Node.js application in hPanel pointing at repo root + `app.js`.
  - Confirm no conflicting/legacy deployment (e.g., Vercel or placeholder Node app) is mapped to the domain.

---

## 3) Next Actions
1. **Commit + push** (code + content + reliability work):
   - Backend hardening:
     - `api/db.js` (retry/backoff + `status()`)
     - `api/index.js` (`/api/version`, enriched `/api/health`, boot banner)
   - Frontend + content:
     - `api/seed-data.json` (self-hosted image paths + polished content)
     - `frontend/public/projects/*` (10 images)
     - `frontend/public/sitemap.xml` (includes `/whats-new`)
     - `frontend/src/pages/WhatsNew.js` + `frontend/src/data/buildHistory.js` (if included in this release)
     - `BUILD_HISTORY.md`
2. **Hostinger deployment validation** (must-do before claiming “live works”):
   - Ensure Hostinger runs **repo root + `app.js`**.
   - Add env vars.
   - Restart + purge CDN.
   - Validate live endpoints:
     - `/api/`, `/api/version`, `/api/health`, `/api/projects`, `/projects/cp67.jpg`
3. **If placeholder persists**:
   - Share Hostinger **runtime/application logs**.
   - Confirm domain mapping (non-www + www behavior).
   - Disconnect/disable any conflicting legacy deployment (e.g., Vercel).

---

## 4) Success Criteria
- **Copy quality:** Projects + story read premium/polished and consistent.
- **Fact integrity:** No changes to numeric/legal fields.
- **Functional data:** MySQL connects and content exists:
  - `/api/health` shows `mysql.ok:true` and content counts (projects=10, posts=4, faqs=5, team=7, site_content=1).
- **Images visible:** `/projects/*` assets load on live site and project cards/pages show images.
- **SEO-ready:**
  - Unique titles/descriptions/canonicals
  - No duplicate/conflicting meta
  - JSON-LD present on project pages and posts
  - Sitemap includes project URLs + `/whats-new`
- **Build-ready:** Frontend production build completes successfully.
- **Live correctness:**
  - `homelandgroupindia.com/api/` returns this app’s identity and build marker (not placeholder responses).
  - Runtime logs include `[boot] homeland-api ...` banner confirming the correct process is running.
