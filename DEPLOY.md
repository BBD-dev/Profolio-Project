# Deploy BBD PROFOLIO (Dashboard + API) on a VPS

Simple Docker setup: **nginx** serves the dashboard and proxies `/api` to the Express server.

```
Browser / Mobile  →  http://YOUR_VPS_IP  (port 80)
                          ├── /          →  React dashboard
                          └── /api/*     →  Express API  →  MongoDB (local, same VPS)
```

MongoDB runs **inside Docker** on the same server. It is **not** exposed to the internet — only the `api` container can talk to it.

## 1. Create a DigitalOcean droplet

- **Image:** Ubuntu 24.04 LTS  
- **Size:** Basic $6/mo (1 GB RAM) is enough to start  
- **Auth:** SSH key (recommended) or password  

Note the **public IP** — you'll use it everywhere as `YOUR_VPS_IP`.

## 2. Open firewall ports

In DigitalOcean → Networking → Firewall (or UFW on the droplet):

| Port | Purpose        |
|------|----------------|
| 22   | SSH            |
| 80   | Dashboard + API |

## 3. Install Docker on the VPS

SSH in:

```bash
ssh root@YOUR_VPS_IP
```

Then:

```bash
curl -fsSL https://get.docker.com | sh
apt-get install -y docker-compose-plugin
docker --version
docker compose version
```

## 4. Get the code on the server

```bash
mkdir -p /opt/profolio
cd /opt/profolio

git clone https://github.com/BBD-dev/Profolio-Project.git .
```

Copy `docker-compose.yml` and env template (from your local monorepo, or create manually):

```bash
# From your PC (PowerShell), copy compose + env example:
scp "path\to\profolio\docker-compose.yml" root@YOUR_VPS_IP:/opt/profolio/
scp "path\to\profolio\.env.docker.example" root@YOUR_VPS_IP:/opt/profolio/
```

On the VPS:

```bash
cd /opt/profolio
cp .env.docker.example api.env
nano api.env   # fill JWT, Cloudinary, admin password, YOUR_VPS_IP in CORS_ORIGINS
```

**Important `.env` values:**

| Variable | Example |
|----------|---------|
| `MONGO_URL` | `mongodb://mongo:27017` (local DB — do not change unless you know why) |
| `DB_NAME` | `bbd-profolio` |
| `JWT_SECRET` | Long random string |
| `CORS_ORIGINS` | `http://YOUR_VPS_IP` |
| `SEED_DEMO` | `false` for production |
| `ADMIN_PASSWORD` | Strong password |

You do **not** need MongoDB Atlas when using this setup. Data is stored in a Docker volume (`mongo_data`) on the VPS.

## 5. Build and start

**Small VPS (1 GB RAM):** add swap first, then build **one service at a time**:

```bash
# Add 2 GB swap (run once)
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h

cd /opt/profolio
docker compose build api
docker compose build web
docker compose up -d
```

Or in one command (needs swap or 2 GB+ droplet):

```bash
cd /opt/profolio
docker compose up -d --build
```

Check status:

```bash
docker compose ps
docker compose logs -f
```

You should see three services: **mongo**, **api**, **web**.

## 6. Verify

- Dashboard: `http://YOUR_VPS_IP`  
- API health: `http://YOUR_VPS_IP/api/` → should return JSON `{ "status": "ok", ... }`  
- Login: admin email + password from `.env`

## 7. Mobile app (later)

Point the app to the same host:

```env
EXPO_PUBLIC_BACKEND_URL=http://YOUR_VPS_IP
```

(No `:5000` — API is on port 80 under `/api`.)

---

## Useful commands

```bash
# Restart after .env changes
docker compose up -d --build

# View logs
docker compose logs -f api
docker compose logs -f web

# Stop
docker compose down

# Update code
cd /opt/profolio/server && git pull
cd /opt/profolio/front && git pull
cd /opt/profolio && docker compose up -d --build
```

---

## Optional: HTTPS with a domain

1. Point `admin.yourdomain.com` A record → `YOUR_VPS_IP`  
2. Install [Caddy](https://caddyserver.com/) or Certbot on the host  
3. Update `CORS_ORIGINS` to `https://admin.yourdomain.com`  
4. Update mobile app URL accordingly  

---

## File layout on VPS

```
/opt/profolio/
├── docker-compose.yml
├── .env
├── server/          ← API (monorepo)
├── front/           ← dashboard (monorepo)
└── app/             ← mobile (monorepo; optional on VPS)
```

Docker volume `mongo_data` holds your database files (persists across restarts).

### Backup MongoDB (recommended)

```bash
docker compose exec mongo mongodump --db=bbd-profolio --out=/data/db/dump
docker cp profolio-mongo-1:/data/db/dump ./mongo-backup-$(date +%F)
```

Replace `profolio-mongo-1` with the actual container name from `docker compose ps`.
