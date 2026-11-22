# Make homelandgroupindia.com Fully Live: Backend, Database & Images

Fix the real reason the live site shows no data or images: the app's own
backend is not the program answering the domain, so nothing can read the
database. This makes the correct backend start reliably, connect to MySQL, and
serve the website and its images as one service on Hostinger.

## Who it's for
- The site owner and Homeland team, who need the live site to show projects, content and images.
- Visitors and prospective buyers, who currently land on a site whose data and pictures don't load.
- Whoever maintains the site later and needs a fast way to confirm it's healthy and running the latest version.

## What the review actually found (and what the earlier outside report got wrong)
A deep read of the current code shows the project is already in good shape and
is a plain single Node service with MySQL. Several claims in the pasted outside
report were written from handoff notes, not the code, and do not apply here:

- The backend is Node/Express, not Python/FastAPI. Hostinger's Node hosting can run it as-is.
- The database layer is already MySQL. MongoDB is only an optional, off-by-default mirror; the site does not need MongoDB, a rewrite, Atlas, Render, or a VPS.
- On first start against an empty database, the app creates its tables and loads the standard content automatically, so an empty Hostinger database is expected and fine — no data move from the old system is required.
- Project images are bundled with the site itself, so they ship with every build; they are not missing from the package.
- There is no leftover Vercel or Next.js configuration in the project, and the preview-only settings file is excluded from what reaches Hostinger.

The genuine problems are all about how the app launches and connects on the host:

1. **Start-up/port gap (most likely core cause).** The server only "opens for traffic" in some launch modes. Depending on how Hostinger is set to start the app, it can load but never actually listen — so the domain falls back to Hostinger's generic placeholder (which is exactly the response seen live). This needs to be made bullet-proof so the app serves traffic no matter how Hostinger starts it.
2. **Database connection details must be exact.** If the database name, user or password on the host don't match precisely (the notes mention both "u771530361_homeland" and "u771530361_homelandgroup"), the app connects to nothing and the site stays empty. The exact name must be confirmed and set.
3. **Stale/static upload risk.** If an old pre-built copy of the site was uploaded by hand, it can keep pointing at a dead address. The host must build and serve the current app, not a leftover upload.

## Core features and experience
- **The correct backend answers the domain**: `homelandgroupindia.com` serves this project's own API, so projects, content and images load.
- **Reliable start-up**: the app begins serving the website no matter how the host launches it, and keeps serving even if the database is briefly unreachable, instead of silently handing the domain to a placeholder.
- **Database connected and self-filling**: on first run it creates its tables and loads the standard content if the database is empty.
- **Images display**: the self-hosted project images load on the live site.
- **A simple health/version readout**: a plain status view shows whether the database is connected, how much content is present, and a version marker, so the owner can confirm at a glance that the live site is the latest code and the database is linked.
- **A precise, click-by-click Hostinger checklist**, matched against the live runtime logs, to confirm start-up file, build step, environment values (including the exact database name), and to replace the placeholder with the real app.

## User flow
- The owner opens `homelandgroupindia.com` and sees projects, content and images loading normally.
- The owner opens the status view and sees "database connected", content counts and the current version — confirming the live site is healthy and up to date.
- If something breaks later, the same status view and the start-up logs show what is wrong, rather than the site quietly serving a blank/placeholder page.

## UI/UX feel
- The public website is unchanged — same dark, premium theme, gold accents and existing pages. This work makes it function; it does not restyle anything.
- The health/version readout is a plain, minimal technical page for the owner/maintainer, not a designed public page.

## Implementation phases

**Phase 1 (built now): Get the live site working — backend, database, images**
- Make the app start and serve traffic reliably under every way Hostinger may launch it, and keep serving in a clear "degraded" state (not a placeholder) if the database is temporarily down.
- Keep the health/version readout and clear start-up logging so the running version and database status are visible.
- Confirm the database connects (creating tables and loading standard content if empty) and that project images display on the live domain.
- Diagnose the live failure against the Hostinger runtime logs and provide the exact panel settings — start-up file, build command, and the precise database name/user/password values — to replace the placeholder with the real app.
- Flag any conflicting or leftover deployment pointed at the domain for the owner to remove.

**Phase 2 (later): Monitoring and self-check**
- Lightweight ongoing health monitoring/alerting so downtime or a lost database connection is noticed early, without manual checking.

**Phase 3 (later): Durability**
- Durable media hosting and routine database backups so images and data stay safe and fast as the site grows.

## Assumptions
- Hosting stays on Hostinger Cloud Startup as a single Node service with MySQL; no rewrite, no MongoDB, and no move to other hosting — the code already supports this, so the alternative split-hosting path from the outside report is not pursued.
- The old Vercel/MongoDB setup is retired and not part of the live site; no data needs to be pulled from it, because the app loads its standard content on first run.
- The exact Hostinger database name, user and password are not yet confirmed; the plan includes finding the exact name in the host panel and setting it precisely, rather than guessing between the two names in the notes.
- The actual Hostinger panel changes, the database import (if the owner wants the ready-made content loaded instead of the automatic defaults), and removing any conflicting deployment are done by the owner; this plan provides the code fixes, the diagnosis and the exact steps.
- Fixing how the app starts and connects is expected to resolve the database and image problems together, since both come from the real backend not being live.
- Secrets (database password, admin login, any keys) are provided only through the secure method, never pasted in chat.
- The public site's design and existing features are not changed; only start-up reliability, the status readout, and the deployment configuration are addressed.
