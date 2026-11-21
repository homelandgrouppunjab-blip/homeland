# Homeland Group Mohali — Build History

A chronological record of how **homelandgroupindia.com** was built and improved.
This document is the shareable, offline version of the on-site **"What's New"**
page (`/whats-new`). Entries are grouped newest-first. Approximate stage labels
are used where exact dates aren't tracked.

The public page shows the user-friendly descriptions below. This document also
carries the *internal notes* (indented) that are not shown on the public page.

---

## Milestones at a glance

- **10 projects, beautifully presented** — every development, from CP67 to The Edition, has rich copy, galleries and detail pages.
- **Self-hosted project imagery** — all official project visuals are served by the site for speed and reliability.
- **Search-ready and shareable** — per-page SEO, a full sitemap, and rich link previews.
- **Smarter enquiries & live chat** — city-aware forms, one-tap WhatsApp/call, and an on-site chatbot.

---

## Changelog

### November 2026 · Polish — Performance & code-quality pass
Ran a full review of the site's code for speed and reliability. Tidied up how
lists and images render, removed developer debug output from the live site, and
confirmed the whole site builds cleanly with no warnings.

> Internal: replaced array-index React keys with stable keys (Home, HeroSlider,
> ProjectMap); added a production-silent `logger` utility and routed all
> `console.*` calls through it; memoized the `load` callback in `AdminUpdates`;
> verified `SocialEmbed` XSS mitigation (DOMPurify + HTTPS provider allowlist).
> Production build compiles with 0 warnings.

### November 2026 · Polish — "What's New" build history
Added the `/whats-new` page so the history of the site is visible in one place:
a milestones summary plus a filterable, dated changelog. Linked from the footer.

> Internal: content sourced from `frontend/src/data/buildHistory.js`; page at
> `frontend/src/pages/WhatsNew.js`; added to `sitemap.xml` and the backend
> dynamic sitemap. Admin-only detailed view and a "living log" editor are
> planned as Phases 2 and 3.

### November 2026 · Reliability — Project images moved in-house
The ten official project renders are now stored and served by the website itself
instead of relying on an external site, so images load faster and never break.

> Internal: images downloaded to `frontend/public/projects/` and referenced by
> local paths in `api/seed-data.json` (e.g. `/projects/cp67.jpg`). They ship to
> `frontend/build/projects/` on `npm run build`.

### November 2026 · Reliability — Safe content database import
Prepared a one-click content import for the live database that refreshes all
projects, posts, team and site content while leaving enquiries and user accounts
untouched. It can be re-run any time without losing data.

> Internal: `hostinger_import.sql` at the repo root. Uses
> `CREATE TABLE IF NOT EXISTS` + `INSERT ... ON DUPLICATE KEY UPDATE` for content
> tables only; performs **no DROP** and never touches `leads`, `users`, `admins`,
> `site_visits` or `user_sessions`. Import via phpMyAdmin → Import tab.

### November 2026 · Content — Consistent contact details
Set a single official support email and phone number across the footer, enquiry
forms and chatbot, so visitors always see the same way to reach the team.

### November 2026 · Security — More secure admin sign-in
Moved the admin login to a secure, cookie-based session. Managing the site is now
safer and stays signed in reliably over a secure (HTTPS) connection.

> Internal: admin login sets a secure, httpOnly cookie; frontend uses credentialed
> requests instead of a localStorage bearer token. Requires HTTPS in production.

### November 2026 · Experience — On-site chatbot & quick answers
Added a friendly chat assistant that answers common questions about projects,
locations and visits in clean, easy-to-read replies, and hands over to the team
with one tap to call, WhatsApp or email.

### November 2026 · Experience — City-aware enquiry forms
Enquiry forms let visitors pick a city first and then see only the relevant
projects. The chosen city travels through to the team and the WhatsApp message.

### November 2026 · Experience — One-tap WhatsApp & call
Standardised the contact number and added floating call and WhatsApp buttons that
work cleanly on desktop and mobile, with a thank-you acknowledgement and a saved
lead for every enquiry.

### November 2026 · Reach — Rich link previews
Shared project/article links now show a proper title, description and image
preview instead of a bare link — generated on the server so it always works.

### November 2026 · Reach — Built-in SEO engine
Added per-page titles and descriptions, a single clean web address per page, an
automatic sitemap covering all projects, and structured data that helps Google
understand the developer and its projects.

### November 2026 · Content — Insights & articles
Wrote and published a set of polished insight articles about the projects and the
region, each with its own shareable page.

### November 2026 · Content — Hand-written project stories
Rewrote all ten project descriptions and the company history in warm, premium
language — keeping every factual detail (RERA numbers, sizes, locations) exactly
accurate.

### November 2026 · Launch — Website foundation
Built the full Homeland Group website — home, projects, project detail pages,
about, vision, locations, brochures, RERA & FAQ, insights and contact — in a
consistent dark, luxury style with gold accents.

---

*To add a new entry: prepend it here and to `frontend/src/data/buildHistory.js`
(the public page reads from that file). A later phase will add an admin editor so
new entries can be published without editing code.*
