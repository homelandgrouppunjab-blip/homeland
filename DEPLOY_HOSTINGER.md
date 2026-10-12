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
EMERGENT_LLM_KEY=sk-emergent-c59225f4352395e3e8
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

## OPTION B — Hostinger Cloud/Business "Node.js app" (hPanel)
If your plan has Node.js app support (no VPS):
1. In **hPanel → Advanced → Node.js**, create an app:
   - **Application root:** the `api` folder of the repo
   - **Startup file:** `index.js`
   - **Node version:** 20.x
2. Upload the repo (Git or File Manager). Before uploading, build the frontend
   locally (`cd frontend && yarn build`) and include `frontend/build` in the upload,
   OR build on the server if a terminal is available.
3. Set the Node app **Environment variables** (same keys as A3: `MONGO_URL`,
   `DB_NAME`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_EXPIRE_MINUTES`, `EMERGENT_LLM_KEY`).
   Do **not** set `REACT_APP_BACKEND_URL`.
4. Run `yarn install` (or `npm install`) in the `api` folder via the panel's "Run NPM install".
5. Start the app. Map your domain to the app in the panel.
6. Verify the same URLs as A8.

> Shared/Web (PHP-only) hosting **cannot** run this Node app. Use VPS or a Node-capable plan.

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
