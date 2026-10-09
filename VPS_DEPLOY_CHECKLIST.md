# VPS deploy checklist (local MongoDB in Docker)

Use this with your mentor step by step. Replace `YOUR_VPS_IP` with the droplet’s public IPv4.

**What runs on the server**

| Service    | Port | Purpose                          |
|-----------|------|----------------------------------|
| `web`     | 80   | Admin dashboard + `/api` proxy   |
| `api`     | internal | Express API                  |
| `mongo`   | internal | MongoDB (Docker volume only) |
| `mobile-web` (optional) | 8080 | Expo web for testing — `docker compose --profile app-test` |

---

## Step 1 — VPS basics

- [ ] Ubuntu 22.04 or 24.04 LTS
- [ ] Note **public IP** → `YOUR_VPS_IP`
- [ ] Firewall / cloud firewall: allow **22**, **80** (and **8080** only if you use app-test)
- [ ] SSH works: `ssh root@YOUR_VPS_IP` (or your sudo user)

---

## Step 2 — Docker on the VPS

```bash
curl -fsSL https://get.docker.com | sh
apt-get install -y docker-compose-plugin
docker --version && docker compose version
```

---

## Step 3 — Swap (recommended on 1 GB RAM)

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h
```

---

## Step 4 — Clone the monorepo

```bash
mkdir -p /opt/profolio
cd /opt/profolio
git clone https://github.com/BBD-dev/Profolio-Project.git .
```

If the repo is private, use a deploy key or `git clone` with HTTPS + token.

---

## Step 5 — Create `api.env` (secrets stay on the server)

```bash
cd /opt/profolio
cp .env.docker.example api.env
nano api.env
```

**Must set (use your real IP):**

| Variable | Value |
|----------|--------|
| `MONGO_URL` | `mongodb://mongo:27017` (leave as-is for local Docker DB) |
| `DB_NAME` | `bbd-profolio` |
| `JWT_SECRET` | 32+ random characters (generate on PC: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `PUBLIC_API_URL` | `http://YOUR_VPS_IP` |
| `PUBLIC_APP_URL` | `http://YOUR_VPS_IP:8080` if using app-test; otherwise your app URL later |
| `CORS_ORIGINS` | `http://YOUR_VPS_IP` and add `,http://YOUR_VPS_IP:8080` if using app-test |
| `ADMIN_EMAIL` | e.g. `admin@bbdselect.com` |
| `ADMIN_PASSWORD` | strong password (created on first API boot) |

**Copy from your local `server/.env` if you already use them:**

- `CLOUDINARY_*` (recommended for production uploads)
- `RESEND_API_KEY` + `EMAIL_FROM` (approval emails)

Do **not** commit `api.env`. Do **not** create a file named `.env` in `/opt/profolio` for Compose (use `api.env` only).

---

## Step 6 — Build and start (dashboard + API + Mongo)

```bash
cd /opt/profolio
docker compose build api
docker compose build web
docker compose up -d
docker compose ps
```

Wait until `api` and `web` are **healthy**.

**Optional — mobile web test on port 8080:**

```bash
docker compose --profile app-test build mobile-web
docker compose --profile app-test up -d
```

---

## Step 7 — Verify

```bash
curl -s http://127.0.0.1/api/
```

From your PC browser:

- Dashboard: `http://YOUR_VPS_IP`
- API: `http://YOUR_VPS_IP/api/`
- Login with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `api.env`
- App web (if enabled): `http://YOUR_VPS_IP:8080`

First boot creates: categories, homepage sections, settings, **admin user only** (no demo data).

---

## Step 8 — After deploy

**Update code later:**

```bash
cd /opt/profolio && git pull && docker compose up -d --build
```

**Logs:**

```bash
docker compose logs -f api
docker compose logs -f web
```

**Backup Mongo (local volume):**

```bash
docker compose exec mongo mongodump --db=bbd-profolio --out=/data/db/dump
docker cp $(docker compose ps -q mongo):/data/db/dump ./mongo-backup-$(date +%F)
```

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| Build OOM | Ensure swap (Step 3); build `api` then `web` separately |
| 502 / API down | `docker compose logs api` — often `JWT_SECRET` or Mongo not ready |
| CORS errors | `CORS_ORIGINS` must match exact browser URL (http + IP, no trailing slash) |
| Uploads fail without Cloudinary | Set `CLOUDINARY_*` or files use VPS disk volume `upload_data` |

---

## Mobile app (native) after VPS is live

In `app/.env` or EAS secrets:

```env
EXPO_PUBLIC_BACKEND_URL=http://YOUR_VPS_IP
```

No `:5000` — the API is on port 80 under `/api`.
