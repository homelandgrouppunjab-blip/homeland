# plan.md — Homeland Group Mohali (Elite-Class Real Estate Website)

## 1) Objectives
- Deliver a premium, high-performance, SEO-friendly marketing website for **Homeland Group Mohali** with luxury **black + gold texture** + platinum accents.
- Provide a **comfortable full CMS/admin dashboard** to manage projects, RERA, brochures, media, maps, team, company content, and leads anytime.
- Implement a robust portfolio: listings, filters, featured projects, detail pages (gallery/video/brochure/map), compare view, upcoming projects, RERA index, brochure center, enquiry capture.
- Store enquiry leads in MongoDB and surface them in admin (email notification deferred).

## 2) Implementation Steps

### Phase 1 — Build V1 directly (no POC needed)
**User stories (V1 core):**
1. As a visitor, I can view a luxury home page hero slider and jump to key CTAs (Enquiry / Projects / Brochures).
2. As a visitor, I can browse all projects with filters (status/type/location) and clearly see **RERA numbers**.
3. As a visitor, I can open a project detail page with gallery, brochure download, amenities, and a map pin.
4. As a visitor, I can submit an enquiry with validation and get a clear success confirmation.
5. As an admin, I can log in and add/edit projects (including RERA, brochure, gallery, map coords) and view leads.

**Backend (FastAPI + MongoDB)**
- Create models/schemas: `Project`, `Lead`, `SiteContent`, `TeamMember`, `ReraCertificate`, `AdminUser`.
- Seed placeholder data for required projects:
  - Homeland Heights; Homeland Regalia (Featured); Homeland Unity CP67; Homeland Global Park (Featured); Homeland New Chandigarh.
  - Upcoming: Homeland Amritsar; Homeland Commercial cum Residential at YPS Chowk Mohali; Homeland Group Housing Phase 8 near Fortis Hospital Mohali.
- REST API under `/api`:
  - Public: projects list/detail, featured, search/filter; site content; team; RERA index; brochure list.
  - Leads: create lead (public), list leads (admin).
  - Admin auth: JWT login/refresh; protected CRUD for all entities.
- Validation + basic anti-spam controls on enquiries (rate limit by IP + honeypot field).

**Frontend (React)**
- Public site pages:
  - Home (hero slider with all projects + featured blocks + company sections)
  - About/History, Benchmark, Vision & Team
  - Projects listing (filters + search + chips) + Featured Properties
  - Project Detail (media slider + lightbox, brochure download, RERA prominence, stats, amenities, video embed, Leaflet map + landmarks)
  - Compare view (table/columns, sorting)
  - Upcoming Projects
  - Brochure Center (search/filter)
  - RERA/FAQ page (RERA list + cert download links)
  - Enquiry/Contact (project dropdown incl “Any”, requirement type, budget optional, preferred contact time)
  - Locations & Maps (Leaflet map with pins + hover quick-card)
- Design system:
  - Black + gold textured sections, platinum accents, glassmorphism cards, premium serif headings + clean sans body.
  - Reusable components: cards, badges (Featured/Hot), tabs/accordions, sliders, modals, chips, breadcrumb, CTA blocks.
- SEO/perf:
  - Semantic layout, meta tags, OpenGraph, JSON-LD for Organization/RealEstateAgent + breadcrumbs.
  - Lazy-load images, responsive srcset, route-based code splitting.
  - Generate sitemap + robots.

**Admin dashboard (React)**
- Admin login (JWT) + protected routes.
- “Comfortable editing” UX:
  - Projects CRUD with sections (Basics, RERA, Pricing/Units, Amenities, Media, Brochure, Map/landmarks, Featured flags).
  - Media management (URL-based for v1; structured gallery editor).
  - SiteContent editor (History, Benchmarks, Vision pillars).
  - Team editor (add/reorder, short bio + expanded bio).
  - RERA certificates editor (list + download link fields).
  - Leads inbox (search, filter by project/date; lead detail drawer).

**Checkpoint: V1 E2E testing**
- Run one full pass: browse/filter → detail → brochure click → map load → enquiry submit → lead appears in admin.

---

### Phase 2 — Harden + polish (production readiness)
**User stories (polish):**
1. As a visitor, I experience fast loads with smooth transitions and no layout shifts.
2. As a visitor, I can keyboard-navigate every interactive element with clear focus states.
3. As an admin, I can safely edit content without breaking the site (field constraints + previews).
4. As an admin, I can reorder projects and featured sections to control the homepage narrative.
5. As a marketing user, I can copy/share SEO-friendly project URLs with correct preview cards.

- Accessibility pass (WCAG AA): aria labels, focus rings, contrast, skip links.
- Stronger input validation (server+client), sanitization, consistent error UX.
- Add preview mode for project pages from admin (draft vs published).
- Add analytics event hooks (page views, brochure clicks, enquiry submits) as stubs.
- Security: tighten CORS, JWT expiry/refresh, admin password hashing, basic audit fields.

**Checkpoint: E2E regression test**
- Test CRUD flows + public pages, ensure no broken routes/assets.

---

### Phase 3 — Optional expansions (post-v1)
**User stories (optional):**
1. As a visitor, I can download brochures after optionally submitting a lead.
2. As an admin, I receive email notifications for new leads.
3. As a visitor, I can read news/blog updates.
4. As a visitor, I can view 360 tours when available.
5. As an admin, I can create landing pages for campaigns (UTM-ready).

- Optional email notifications (SMTP credentials required).
- Blog/News module (CMS-managed) + SEO templates.
- 360 tours field support + richer media blocks.
- Role-based admin (Editor vs Admin) if needed.

## 3) Next Actions
1. Produce design direction (tokens/components) for black+gold texture + platinum look and apply across pages.
2. Implement backend schemas + seed data + APIs + JWT admin auth.
3. Implement public frontend routes + core components + Leaflet maps.
4. Implement admin dashboard CRUD + leads inbox.
5. Run E2E test pass and fix until stable.

## 4) Success Criteria
- Public site: all specified pages render, responsive, premium look/feel, fast, accessible.
- Portfolio: filters, featured badges, project detail media + brochure links + Leaflet maps work.
- Enquiry: validated submissions stored in MongoDB and visible in admin.
- Admin: comfortable CRUD for all content types; changes reflect immediately on public site.
- SEO basics: clean URLs, metadata, JSON-LD, sitemap/robots present; no broken links.
