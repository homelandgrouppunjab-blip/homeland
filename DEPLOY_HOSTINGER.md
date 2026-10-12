## Deploy Homeland Group on Hostinger (React + Node API + MongoDB Atlas)

This hosts the **current** app (no rewrite): the Node/Express API in `/api` serves
both the REST API (`/api/*`) **and** the built React frontend as a single process.
Database is **MongoDB Atlas** (free cloud). Uploads are stored in MongoDB, so no
persistent disk is required.

> Next.js is NOT required to deploy this app. If you later want a full Next.js
> rewrite for SSR, that is a separate project.

---

## 0) Prerequisites
- A **Hostinger VPS** (recommended) OR a Hostinger Cloud/Business plan with **Node.js app** support.
- A domain (can be your Hostinger domain).
- A **MongoDB Atlas** free cluster.
- Your code pushed to **GitHub** (use "Save to GitHub" in Emergent).

---

## 1) Create the MongoDB Atlas database
1. https://www.mongodb.com/atlas → create a free **M0** cluster.
2. **Database Access** → add a user (username + password).
3. **Network Access** → add IP `0.0.0.0/0` (or your VPS IP).
4. **Connect → Drivers** → copy the connection string:
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

---

## OPTION A — Hostinger VPS (recommended)

### A1. Connect & install Node
```bash
ssh root@YOUR_VPS_IP
# install Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git nginx
npm i -g pm2 yarn
```

### A2. Get the code & install
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git homeland
cd homeland

# install + build frontend (same-origin /api, so NO backend URL needed)
cd frontend
yarn install
# make sure no preview URL leaks into the build:
printf "REACT_APP_BACKEND_URL=\n" > .env
yarn build
cd ..

# install API deps
cd api
yarn install
cd ..
```

### A3. Configure the API environment
Create `/var/www/homeland/api/.env`:
```
MONGO_URL=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=homeland
JWT_SECRET=PUT_A_LONG_RANDOM_STRING_HERE
ADMIN_EMAIL=admin@homelandgroup.org
ADMIN_PASSWORD=ChooseAStrongPassword
JWT_EXPIRE_MINUTES=1440
PORT=8001
# AI assistant + website chatbot (Emergent universal LLM key). Required for the
# chatbot and the admin AI design assistant. You can replace it with your own
# OpenAI/Anthropic/Google key setup later if you prefer.
# Paste your own key value here on the server — do NOT commit real keys to Git.
EMERGENT_LLM_KEY=your-emergent-llm-key-here
# Site-visit reminder emails (Emergent Managed Email / Resend). The email key is
# provisioned by Emergent — paste its value on the server; never commit it.
EMERGENT_EMAIL_KEY=your-emergent-email-key-here
EMAIL_FROM_NAME=Homeland Group
# Inbox that receives the morning site-visit reminders (your sales team/admin).
REMINDER_EMAIL=sales@yourdomain.com
# Timezone used for the 7am reminder schedule.
REMINDER_TZ=Asia/Kolkata
```
The API auto-detects the built frontend at `../frontend/build` and serves it, so a
single process serves the whole site plus `/api`.

### A4. Start with PM2
```bash
cd /var/www/homeland/api
pm2 start index.js --name homeland
pm2 save
pm2 startup        # run the command it prints, to auto-start on reboot
```
Test locally on the VPS: `curl http://localhost:8001/api/` → should return the health JSON.

### A5. Nginx reverse proxy + domain
Create `/etc/nginx/sites-available/homeland`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 20M;   # allow brochure/image uploads

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable + reload:
```bash
ln -s /etc/nginx/sites-available/homeland /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### A6. Point the domain
In **Hostinger → Domains → DNS Zone**, add an **A record**:
`@  →  YOUR_VPS_IP` and `www → YOUR_VPS_IP` (TTL Auto).

### A7. Free SSL (HTTPS)
```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot installs the certificate and auto-renews.

### A8. Verify
- `https://yourdomain.com/` → site loads
- `https://yourdomain.com/api/` → health JSON
- `https://yourdomain.com/projects/homeland-regalia` (refresh works — SPA fallback)
- `https://yourdomain.com/admin/login` → log in with your ADMIN_EMAIL/PASSWORD

### A9. Updating later
```bash
cd /var/www/homeland
git pull
cd frontend && yarn install && yarn build && cd ..
cd api && yarn install && pm2 restart homeland
```

---

## OPTION B — Hostinger Cloud/Business managed "Node.js app" (hPanel + GitHub)  ← recommended for Cloud Startup
This uses Hostinger's automated pipeline (it runs install + build + start for you).

1. **Push to GitHub first** ("Save to GitHub" in Emergent). The pipeline deploys from the repo.
2. In **hPanel → Websites → Add Website → Node.js Web App**, connect your **GitHub repo** and
   branch **main**.
3. On the **Deploy settings** screen set exactly:
   - **Application root directory:** `/` (leave empty — the root `package.json` is here)
   - **Package manager:** auto (it detects `yarn.lock` → Yarn). Do NOT upload `node_modules`.
   - **Build command / script:** `build`  (root script builds the React app **and** installs the API)
   - **Entry / startup file:** `api/index.js`
   - **Output directory:** `frontend/build`
   - **Node version:** **20** (or 22)
4. Add **Environment variables** (hPanel → your Node app → Environment):
   - `MONGO_URL` = your MongoDB connection string
   - `DB_NAME` = `homeland`
   - `JWT_SECRET` = a long random string
   - `ADMIN_EMAIL` = your admin email
   - `ADMIN_PASSWORD` = a strong password
   - `JWT_EXPIRE_MINUTES` = `1440`
   - `EMERGENT_LLM_KEY` = your key (for chatbot + AI design)
   - `EMERGENT_EMAIL_KEY` = your Emergent email key (for site-visit reminders)
   - `EMAIL_FROM_NAME` = `Homeland Group`
   - `REMINDER_EMAIL` = your sales/admin inbox (receives the morning reminders)
   - `REMINDER_TZ` = `Asia/Kolkata`
   - **Do NOT set `REACT_APP_BACKEND_URL`** (blank = same-origin `/api`).
   - You usually do **not** need to set `PORT` — the app defaults to **3000**, which is what
     Hostinger proxies to. If Hostinger injects a different `PORT`, the app honors it automatically.
5. Click **Deploy** and watch **Deployments → logs**.
6. Map your domain to the app, then verify the same URLs as A8 (`/`, `/api/`, a deep link refresh,
   `/admin/login`).

> Shared/Web (PHP-only) hosting **cannot** run this Node app. Use a Node-capable plan (Cloud/Business) or VPS.

---

## First run
On the first request the API **auto-seeds** your empty Atlas database from
`api/seed-data.json` (9 projects, content, team, FAQs, posts) and creates the admin
account. Existing data is never overwritten.

## Notes
- **Uploads** go into MongoDB and are served at `/api/uploads/<file>` — they survive
  restarts and need no disk/object store. Keep `client_max_body_size` in Nginx ≥ your
  largest upload.
- **Same-origin API:** the frontend calls `/api` on the same domain, so there is no
  CORS or backend-URL configuration to manage.
- **Security:** never commit `api/.env`. Use strong `JWT_SECRET` and `ADMIN_PASSWORD`.
