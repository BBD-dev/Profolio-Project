# Build BBD PROFOLIO for Android (APK + Google Play)

## What you get

| Profile | Output | Use |
|---------|--------|-----|
| `preview` | **APK** | Install on phones directly (testing) |
| `production` | **AAB** | Upload to Google Play Console |

Google Play requires **AAB** (not APK) for store releases.

Production API URL is baked in at build time: `http://207.154.248.90`

---

## Why is the APK ~88 MB? Can it be smaller?

**Yes — partially.** A React Native / Expo app is never tiny like a static website app.

| What adds size | Rough share |
|----------------|-------------|
| React Native + Expo runtime | ~30–40 MB |
| Native libraries (Reanimated, gestures, keyboard, etc.) | ~15–25 MB |
| **Universal APK** (arm + x86 for emulators) | doubles native libs |
| JS bundle + fonts (Geist, Ionicons) | ~5–10 MB |

**88 MB is normal** for a full universal APK with Expo SDK 54.

### What we optimized (lighter release)

In `app.json` → `expo-build-properties`:

- **Minify + shrink resources** (ProGuard/R8) — removes unused code
- **ARM-only APK** (`armeabi-v7a`, `arm64-v8a`) — drops x86 emulator libs (~30–40% smaller)
- Removed unused npm packages (`date-fns`, `dayjs`, etc.)

**Expected after rebuild:** APK roughly **45–60 MB** (varies by device).

### Google Play is smaller for users

When you upload **AAB** (`production` profile), Google Play delivers only what each phone needs.

Users typically download **~25–35 MB**, not 88 MB.

| Build | You download | User downloads (Play Store) |
|-------|--------------|-----------------------------|
| APK (`preview`) | ~45–88 MB | same file |
| AAB (`production`) | ~50–70 MB upload | **~25–35 MB** per device |

**For testers:** share APK or web link `http://207.154.248.90:8080`  
**For Play Store:** always use `production` AAB — Google handles size splitting

---

## One-time setup

### 1. Expo account (free)

Create one at https://expo.dev/signup

### 2. Install EAS CLI

```powershell
cd "c:\My Projects\BBD Training\BBD Files\Baraa Project\profolio\app"
npm install
```

### 3. Log in and link project

Already done for this project:
- Expo account: **hussein-mo7**
- EAS project: https://expo.dev/accounts/hussein-mo7/projects/bbd-profolio

If setting up on a new PC:

```powershell
npx eas login
npx eas init
```

### 4. Google Play Console ($25 one-time)

1. https://play.google.com/console
2. Create developer account
3. Create app → **BBD PROFOLIO**
4. Package name must match: **`com.bbdselect.profolio`**

---

## Build APK (testing)

**First build only:** run interactively so EAS can create your Android signing key.

```powershell
cd app
npx eas build --platform android --profile preview
```

When prompted:
1. **Generate a new Android Keystore?** → Yes
2. **Let EAS handle credentials** → Yes

After the first build, you can use:

```powershell
npm run build:apk
```

---

## Build for Google Play (AAB)

```powershell
npm run build:play
```

Or:

```powershell
npx eas build --platform android --profile production
```

Download the **.aab** file when the build completes.

`versionCode` auto-increments on each production build (`autoIncrement: true` in `eas.json`).

---

## Upload to Google Play

### Manual upload

1. Play Console → your app → **Release** → **Production** (or **Internal testing** first)
2. **Create new release**
3. Upload the **.aab** file
4. Complete store listing (see checklist below)
5. Submit for review

### Optional: EAS Submit (after service account)

1. Play Console → **Setup** → **API access** → link Google Cloud project
2. Create service account with Play Console permissions
3. Download JSON key → save as `app/google-play-service-account.json` (gitignored)
4. Update `eas.json` submit section with key path
5. Run:

```powershell
npm run submit:play
```

---

## Google Play checklist (required before publish)

### Store listing
- [ ] App name: **BBD PROFOLIO**
- [ ] Short description (80 chars)
- [ ] Full description
- [ ] App icon 512×512 (use `assets/images/icon.png` resized)
- [ ] Feature graphic 1024×500
- [ ] Phone screenshots (至少 2)

### Policies
- [ ] **Privacy policy URL** (required — app collects name, email, photos, profile data)
  - Host on your site, e.g. `http://207.154.248.90/privacy` or a Notion/Google Doc public link
- [ ] **Data safety** form in Play Console (declare email, photos, account info)

### App content
- [ ] Target audience / age rating questionnaire
- [ ] Content rating questionnaire
- [ ] Declare if app is for organizations/schools (BBD Select graduates)

### Technical
- [ ] Package: `com.bbdselect.profolio`
- [ ] Version: `1.0.0` (user-facing), versionCode managed by EAS
- [ ] Signing: EAS creates upload keystore (keep EAS credentials backed up)

---

## Update app for a new release

1. Bump version in `app.json`:

```json
"version": "1.0.1"
```

2. Rebuild:

```powershell
npm run build:play
```

3. Upload new AAB to Play Console

---

## Change production API URL later

Edit `eas.json` → `production.env.EXPO_PUBLIC_BACKEND_URL` (use HTTPS when you add a domain):

```json
"EXPO_PUBLIC_BACKEND_URL": "https://your-domain.com"
```

Then rebuild.

---

## Troubleshooting

```powershell
npx expo-doctor
npx eas build:list
```

| Issue | Fix |
|-------|-----|
| Build fails on credentials | Run `npx eas credentials` |
| App can't reach server | Check VPS is up; `usesCleartextTraffic` is enabled for HTTP |
| Play rejects HTTP | Add HTTPS + domain (recommended before public launch) |

---

## App identity

| Field | Value |
|-------|--------|
| Android package | `com.bbdselect.profolio` |
| iOS bundle ID | `com.bbdselect.profolio` |
| EAS slug | `bbd-profolio` |

Change package name **only before** first Play Store upload.
