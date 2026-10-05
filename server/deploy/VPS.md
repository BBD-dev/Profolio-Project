# VPS staging deploy

`/opt/profolio` is the folder on the droplet. Code comes from GitHub. This is for **testing on the VPS** before a later Android release.

## URLs

| URL | What |
|-----|------|
| http://207.154.248.90 | Admin dashboard |
| http://207.154.248.90:8080 | Mobile app (web) |
| http://207.154.248.90/api/ | API health (`{"status":"ok"}`) |

Open **80** and **8080** in the DigitalOcean firewall.

---

## Test on your PC first (before VPS)

Do this on Windows with two terminals. Do **not** deploy until these pass.

### Terminal 1 — API

```powershell
cd "c:\My Projects\BBD Training\BBD Files\Baraa Project\profolio\server"
npm run dev
```

You should see `BBD PROFOLIO API running on http://localhost:5000`.

```powershell
curl.exe http://localhost:5000/api/
```

Expect: `{"message":"BBD PROFOLIO API","status":"ok"}`

### Terminal 2 — mobile web

`app/.env` must be:

```
EXPO_PUBLIC_BACKEND_URL=http://localhost:5000
```

```powershell
cd "c:\My Projects\BBD Training\BBD Files\Baraa Project\profolio\app"
npm run web
```

Open http://localhost:8081

### Terminal 3 — dashboard (optional)

```powershell
cd "c:\My Projects\BBD Training\BBD Files\Baraa Project\profolio\front"
npm run dev
```

Open http://localhost:3000

### Local checklist

1. Dashboard login (admin from `server/.env`)
2. Mobile: register a new graduate
3. Dashboard → Graduate Requests → Approve (watch for welcome-email toast)
4. Mobile: log in as that graduate
5. Edit profile: bio, skills, photo, cover, PDF CV → Save
6. Open the CV from My Profile
7. Open a project (Apps shows Install App → Coming soon)

If email toast says it is not configured, add `RESEND_API_KEY` and `EMAIL_FROM` in `server/.env` and restart the API. The sending domain must be verified in Resend.

---

## VPS layout after clone

```
/opt/profolio/            ← clone BBD-dev/Profolio-Project here
├── docker-compose.yml    ← from server/deploy/docker-compose.yml
├── api.env               ← secrets, not in git
├── server/
├── front/
└── app/
```

---

## Deploy / update on the VPS

Push **Profolio-Project** from your PC, then on the VPS:

```bash
# First time only: git clone https://github.com/BBD-dev/Profolio-Project.git /opt/profolio

cd /opt/profolio && git pull

cd /opt/profolio
cp server/deploy/docker-compose.yml .
# First time: cp server/deploy/.env.docker.example api.env && nano api.env
rm -f .env

docker compose up -d --build
docker compose ps
curl -s http://127.0.0.1/api/
```

### Required `api.env` fields

Copy values from local `server/.env` where needed. **Do not commit this file.**

- `JWT_SECRET` — 32+ random chars
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- `PUBLIC_API_URL=http://207.154.248.90`
- `PUBLIC_APP_URL=http://207.154.248.90:8080`
- `CORS_ORIGINS=http://207.154.248.90,http://207.154.248.90:8080`
- `RESEND_API_KEY` / `EMAIL_FROM` — same as local if you want approval emails
- `CLOUDINARY_*` — optional; otherwise files stay on the VPS disk volume
- Default `MONGO_URL=mongodb://mongo:27017` is a **new empty database** on the VPS. Paste your Atlas URI only if you want the same data as local.

---

## After VPS is up — test again

Same checklist as local, using:

- Dashboard: http://207.154.248.90
- App: http://207.154.248.90:8080

If images/CVs 404, check `PUBLIC_API_URL` and `docker compose logs api`.
If the browser blocks API calls, check `CORS_ORIGINS`.
If approve works but no email, check `docker compose logs api | grep email`.
