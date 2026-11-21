# Homeland Group — Hostinger Deployment Guide

This app = React frontend (`/frontend`) + Node/Express API (`/api`) + MySQL. The
Express server also serves the built frontend and `/api/*` from the SAME domain.

---

## 1. Hostinger Node.js app settings (hPanel → Website → Node.js)

| Setting            | Value                                  |
|--------------------|----------------------------------------|
| Application root   | repository root (`./`)                 |
| Startup file       | `app.js`                               |
| Build command      | `npm run build`                        |
| Node version       | 22 (or 20)                             |
| PORT               | **leave unset** (Hostinger injects it) |

After any code change: **Pull the latest commit → Restart app → Purge CDN cache.**

---

## 2. Environment variables (hPanel → Node.js → Environment)

Database (use ONE complete set — the `MYSQL_*` set is recommended):

```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=u771530361_homeland
MYSQL_PASSWORD=<your db password>
MYSQL_DATABASE=u771530361_homeland
```

Admin + auth (needed for /admin/login, secure cookies require HTTPS):

```
JWT_SECRET=<long random string>
ADMIN_USERNAME=<your admin user>
ADMIN_PASSWORD=<your admin password>
```

Frontend build: `REACT_APP_BACKEND_URL` must be **blank/unset** so the site calls
`/api` on its own domain. Do NOT set MONGO_URL (MySQL is the primary DB).

---

## 3. Images — now self-hosted (durable)

All 10 official project images are bundled in the repo at `frontend/public/projects/`
and ship into `frontend/build/projects/` on `npm run build`. The database now points
`hero_image` / gallery to local paths like `/projects/cp67.jpg`, so images no longer
depend on any external website. Nothing extra to configure — just deploy the build.

---

## 4. Database content import (SAFE — keeps your leads & users)

File: `hostinger_import.sql` (repo root).

- It only CREATEs tables if missing and UPSERTS site content, projects, posts,
  FAQs, team, updates and uploads.
- It performs **no DROP** and never touches `leads`, `users`, `admins`,
  `site_visits` or `user_sessions`. Existing enquiries stay intact.
- It is safe to re-run any time.

Import steps (hPanel → Databases → phpMyAdmin):
1. Select the `u771530361_homeland` database on the left.
2. Open the **Import** tab → choose `hostinger_import.sql` → **Go**.
3. (SSH alternative) `mysql -u u771530361_homeland -p u771530361_homeland < hostinger_import.sql`

---

## 5. Verify live (in order)

1. `https://homelandgroupindia.com/api/`            → `{"message":"Homeland Group Mohali API","status":"ok"}`
2. `https://homelandgroupindia.com/api/health`      → includes `"mysql":{"ok":true}`
3. `https://homelandgroupindia.com/api/projects`    → array of 10 projects
4. `https://homelandgroupindia.com/projects`        → cards with images
5. Open one project → hero + gallery images load

If `/api/` still returns a generic `{"status":404,"message":"The requested resource
wasn't found."}`, the domain is NOT yet routed to this Node app — re-check the
Application root / Startup file above, confirm the latest commit is deployed, and
purge the CDN cache. Share the **runtime (application) logs**, not build logs, if it
persists.
