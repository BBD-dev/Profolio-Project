# Web version (test in browser + share link)

The same app runs in the browser — no install needed.

## Test locally on your PC

```powershell
cd app

# Point at your VPS API
$env:EXPO_PUBLIC_BACKEND_URL="http://207.154.248.90"
npm run web
```

Open http://localhost:8081

Or build static files:

```powershell
$env:EXPO_PUBLIC_BACKEND_URL="http://207.154.248.90"
npm run build:web
npx serve dist
```

Open the URL `serve` prints (usually http://localhost:3000).

---

## Share with others (VPS)

After deploy, the mobile app web version is at:

**http://207.154.248.90:8080**

Send that link — works on phone browser, tablet, or desktop.

| URL | Purpose |
|-----|---------|
| http://207.154.248.90 | Admin dashboard |
| http://207.154.248.90:8080 | **Mobile app (web)** |
| http://207.154.248.90/api/ | API |

### Deploy on VPS

1. Clone app repo next to server/front (see `server/deploy/VPS.md`)
2. Copy updated `docker-compose.yml` from server repo
3. Open port **8080** in DigitalOcean firewall
4. Build:

```bash
cd /opt/profolio
docker compose build mobile-web --progress=plain
docker compose up -d mobile-web
```

### Update web app after code changes

```bash
cd /opt/profolio/app && git pull
cd /opt/profolio && docker compose up -d --build mobile-web
```

---

## Notes

- Web uses the same login/register/projects as the native app
- Photo upload works in modern browsers
- For best experience, still recommend the **APK** on Android
- Add `http://207.154.248.90:8080` to server `CORS_ORIGINS` in `api.env` if API calls fail from browser
