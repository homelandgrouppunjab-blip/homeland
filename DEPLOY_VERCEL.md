# Deploying Homeland Group to Vercel

This app is now Vercel-ready. The backend has been rewritten from Python/FastAPI to a
**Node.js REST API using the native MongoDB driver** (no Python). The React frontend is
unchanged and calls the API on the same origin (`/api`).

## Repo layout (Vercel)
```
/api
  index.js         # Express app — all REST endpoints (Node + mongodb driver)
  seed-data.json   # Initial data seeded into an empty database (your current content)
  package.json     # API dependencies
/frontend          # React app (Create React App)
vercel.json        # Build + routing config
```

## What runs where
- `/api/*`  → Node serverless function (`api/index.js`)
- everything else → the built React app (`frontend/build`)

## 1. Create a MongoDB Atlas database
1. Create a free cluster at https://www.mongodb.com/atlas
2. Create a database user + password.
3. Network Access → allow `0.0.0.0/0` (or Vercel egress IPs).
4. Copy the connection string, e.g.
   `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`

## 2. Push this repo to GitHub
Use "Save to GitHub" in Emergent (or `git push`) to your own repository.

## 3. Import the repo into Vercel (project: homeland2)
- New Project → Import your GitHub repo.
- Framework preset: **Other** (the included `vercel.json` handles the build).
- Root Directory: **repository root** (leave default).

## 4. Set Environment Variables (Vercel → Project → Settings → Environment Variables)
| Key | Value |
|-----|-------|
| `MONGO_URL` | your Atlas connection string |
| `DB_NAME` | e.g. `homeland` |
| `JWT_SECRET` | a long random string |
| `JWT_EXPIRE_MINUTES` | `1440` (optional) |
| `ADMIN_EMAIL` | your admin login email |
| `ADMIN_PASSWORD` | your admin login password |

Notes:
- Do **NOT** set `REACT_APP_BACKEND_URL` on Vercel — the frontend uses same-origin `/api`.
- On first request, the API seeds an empty database from `api/seed-data.json` and creates
  the admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Existing data is never overwritten.

## 5. Deploy
Click **Deploy**. After it finishes:
- Public site: `https://<your-domain>`
- Admin: `https://<your-domain>/admin/login`
- API health check: `https://<your-domain>/api/`

## File uploads
Admin uploads (images/PDFs) are stored **inside MongoDB** and served from
`/api/uploads/<filename>` — no external storage service required. (Max 15 MB/file.)

## Local development (optional)
```
# API
cd api && yarn install
MONGO_URL="mongodb://localhost:27017" DB_NAME="homeland" JWT_SECRET="dev" \
  ADMIN_EMAIL="admin@homelandgroup.org" ADMIN_PASSWORD="Homeland@2013" node index.js
# (serves on http://localhost:8002/api)

# Frontend
cd frontend && yarn install && yarn start
```
