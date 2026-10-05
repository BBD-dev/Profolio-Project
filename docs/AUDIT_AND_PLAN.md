# BBD PROFOLIO — Pre-Deployment Audit & Improvement Plan

Audit date: 2026-10-05. Scope: mobile app (`app/`), admin dashboard (`front/`), API (`server/`).
Reviewed as QA + full-stack + UI/UX. Every screen, page, route, service and shared component was read.

Legend: **C** critical (broken flow / data loss / security) · **H** high (visible bug) · **M** medium (UX / robustness) · **L** low (polish / cleanup)

---

## 1. Executive summary

| Area | C | H | M | L | Headline problems |
|------|---|---|---|---|-------------------|
| Mobile app | 9 | 14 | 12 | 10 | Uploads send wrong MIME/filename; list screens hang forever on API failure; password eye overflows input; weak validation; no 401 → logout; no request timeout |
| Dashboard | 10 | 18 | 15 | 12 | Core CRUD mutations have no error handling and close dialogs before the request finishes (silent failure / data loss); CV links broken; Emergent/PostHog scripts shipped; auth bootstrap can leave a user without a token |
| Server | 11 | 12 | 14 | 7 | No rate limiting; NoSQL operator injection via query params; drafts publicly readable; `$set: req.body` mass assignment on admin updates; no upload mimetype allowlist; demo seed runs in prod; errors map to 500 |

**Reported issues confirmed:** edit‑profile instability, avatar/cover upload failures, weak validation, password eye icon outside input.

---

## 2. Findings by codebase

### 2.1 Mobile app (`app/`)

**Critical**
- `app/(tabs)/projects.tsx`, `app/(tabs)/graduates.tsx` — `load()` has no try/catch/finally → infinite skeleton when API fails; debounced loads race (stale results win).
- `app/edit-profile.tsx` — image/CV pickers not wrapped in try/catch; uploads always named `avatar.jpg`/`cover.jpg` with `image/jpeg` regardless of actual asset (PNG/HEIC/WebP → server rejection or corrupt type); no double‑submit guard; sequential uploads leave orphans on partial failure.
- `app/graduate/[id].tsx` — Contact button opens `mailto:undefined` (API never sets `links.email`).
- `src/services/apiClient.ts` — no timeout; no 401 handling (zombie sessions).

**High**
- `src/components/Input.tsx` — secure row lacks `minWidth: 0` and reserved right padding → eye renders outside the field (web especially).
- Login/Register — no email format check, no confirm password, no per‑field errors.
- Relative `/api/uploads/...` URLs not resolved against `BASE_URL` on native.
- Detail screens show "Not found" for network errors.
- `AuthContext.refresh()` swallows 401.
- `useToast` context value recreated every render.
- `_layout.tsx` — `LogBox.ignoreAllLogs(true)` hides real errors.

**Medium / Low**
- Almost no `accessibilityLabel`/`accessibilityRole` on icon buttons and tabs.
- Three different header patterns; hardcoded colors; hero not full‑bleed; sections render nothing when empty.
- Cards not memoised; `Dimensions.get` at module scope; FlatList unmounted during loading (scroll reset).
- Dead code: `src/data/*` mocks, `Card.tsx`, `StickyHeader.tsx`, unused imports; version string hardcoded.
- Resume row on public graduate profile is a fake toast.

### 2.2 Admin dashboard (`front/`)

**Critical**
- `GraduateRequests`, `Graduates`, `Projects`, `Categories`, `Homepage` — mutations have **no `onError`**; dialogs close and state resets **before** the mutation settles → silent failures that look like success; double‑submit on confirms.
- `ConfirmDialog` — no loading/disabled; always closes immediately.
- `GraduateRequests.LinkChip` — `/cv/x.pdf` becomes `https:///cv/x.pdf`.
- `AuthContext` — stale `bbd_auth` user kept when token missing → "logged in" with every call 401.
- `apiClient` — hard `window.location.href` on any 401 (including failed login).
- `public/index.html` — Emergent loader + PostHog key shipped to production.

**High**
- No `isError` UI on most list pages; no pagination anywhere.
- Validation thin: empty names/emails allowed, URLs unchecked, changes‑note optional, media >10 MB not blocked.
- Graduates edit omits avatar/cover/CV; Projects category select includes disabled categories; Categories can't send slug.
- Logout doesn't clear React Query cache. "Forgot password" fakes a success toast. Topbar search does nothing; notification dot always on.
- Global focus‑ring removal → keyboard a11y regression; icon buttons lack `aria-label`.
- Dead: `src/data/seed.ts`, `src/services/storage.ts`, `useLenis`, visual‑edits in `craco.config.js`; TS checker disabled in build.

**Medium / Low**
- `staleTime: 0` + `refetchOnMount: "always"` → refetch thrash. No route code‑splitting.
- Status actions shown on terminal states without confirm; Projects status menu ambiguous; Homepage has grip icon but no DnD; brand colors never applied; mobile nav lacks pending badge.
- Unused deps (`swr`, `lodash`, `date-fns`, `dayjs`, `lenis`…), duplicate Google Fonts, dead dark‑mode CSS, `any` casts.

### 2.3 API server (`server/`)

**Critical**
- No rate limiting on `/auth/login`, `/auth/register`.
- `req.query.graduateStatus` / `req.query.status` passed straight to Mongo filters → operator injection.
- Public `GET /projects/:id` returns **drafts**.
- `PATCH /admin/projects/:id`, `/admin/categories/:id`, `/admin/homepage/:id` do `$set: req.body` (mass assignment).
- Upload: no mimetype/extension allowlist; admin delete can destroy any Cloudinary publicId.
- `seedDatabase()` runs on every boot; `SEED_DEMO=true` default in `.env.example`; demo password logged.
- Docker runs as root, no healthcheck; Mongo without auth; no `JWT_SECRET` strength check.

**High**
- `errorHandler` maps CastError/ValidationError/dup‑key to 500; no JSON 404; no ObjectId validation.
- No unhandledRejection / SIGTERM handling.
- Helmet default CORP blocks cross‑origin `/api/uploads`; `CORS_ORIGINS=*` + credentials.
- Unescaped `$regex` search (ReDoS); NaN pagination.
- Password policy min 6; `/api/uploads` fully public (CVs); local files never deleted; absolute URL built from forwarded headers.
- Public `/homepage` returns hidden sections.
- `zod` installed but unused — every write route lacks schema validation.

**Medium / Low**
- `syncGraduateProjectIds` N+1 and full scan on empty input; unbounded admin lists; sequential dashboard counts; regex search ignores text index.
- Duplicated resource‑type helper; unused `optionalAuth`, `syncAllGraduateProjectIds`; `API.md` drift; no structured logging.

---

## 3. New feature — approval email (Resend)

Hook point: `server/src/routes/requests.routes.ts` → `PATCH /admin/requests/:id/status`, after the update succeeds.

- `approved` → branded "You're in" email: welcome, what they can do, **Log in** CTA (`PUBLIC_APP_URL`).
- `changes_requested` → include admin note + how to update.
- `rejected` → polite notice (optional).
- Config: `RESEND_API_KEY`, `EMAIL_FROM`, `PUBLIC_APP_URL`. Email failures are logged, never fail the admin action.
- Template: navy `#0A1330` + lime `#C8D62B`, inline CSS, mobile‑safe table layout, plain‑text fallback.

---

## 4. Phased plan

### Phase 1 — Critical stability & security (now)
**Server**
1. `express-rate-limit` on auth routes.
2. Sanitise query params (string + enum allowlist); escape regex; clamp pagination.
3. Public project detail/related → `published` only; public homepage → `visible` only.
4. Field allowlists for admin project/category/homepage PATCH.
5. Upload `fileFilter` mimetype allowlist; restrict delete to `bbd-profolio/` prefix or local files; delete local files.
6. `errorHandler`: CastError/ValidationError/11000 mapping; JSON 404; ObjectId guard middleware.
7. Helmet CORP cross‑origin for uploads; CORS strict in production.
8. Seed only when `NODE_ENV !== production` or `RUN_SEED=true`; stop logging passwords; `JWT_SECRET ≥ 32`.
9. Process handlers (unhandledRejection, SIGTERM) + graceful shutdown.
10. Dockerfile: non‑root, uploads dir, HEALTHCHECK.

**Mobile app**
1. Pass real `mimeType`/`fileName` from pickers; infer extension; parallel uploads; `savingRef` guard; try/catch pickers.
2. `try/catch/finally` + error/retry state + request sequencing on Projects/Graduates.
3. `Input` secure layout fix (`minWidth: 0`, reserved right padding, absolute toggle).
4. `apiClient`: timeout via `AbortController`; 401 → clear token + emit logout; upload errors read `message` too.
5. Login/Register/Edit validation: email regex, confirm password, URL check, max lengths, per‑field errors.
6. `resolveMediaUrl()` for relative upload paths; Avatar `onError` fallback.
7. Graduate contact email (server adds `email` to public graduate shape); resume opens `cvUrl`.
8. Remove `LogBox.ignoreAllLogs`.

**Dashboard**
1. All mutations: `onError` toast, `isPending` disables, close/reset **only** in `onSuccess`.
2. `ConfirmDialog` with `loading` + async confirm.
3. `LinkChip` URL builder fix.
4. Auth bootstrap: drop stale user if no token; `queryClient.clear()` on logout; 401 handling without hard reload loop.
5. Remove Emergent/PostHog from `index.html`, visual‑edits from craco; delete `seed.ts`/`storage.ts`.

### Phase 2 — UX, forms, states
- App: per‑field errors, keyboard submit chain, empty states per home section, unified `ScreenHeader`, token colors, memoised cards, `useWindowDimensions`, a11y labels/roles, remove avatar/cover/CV actions.
- Dashboard: `QueryError` + empty states on every list; validation (required/email/URL/size); Graduates edit gets avatar/cover/CV upload; disabled categories filtered; slug editing; `staleTime` 30–60 s; lazy routes; `aria-label`s; restore `:focus-visible`; mobile pending badge; remove fake controls (search, notif dot, forgot password).
- Server: Zod schemas on all write routes; pagination on admin lists; `.lean()` + projections; `Promise.all` dashboard counts; shared helpers; structured logger.

### Phase 3 — Approval email (Resend)
- `server/src/config/env.ts` vars → `server/src/services/email.ts` (Resend SDK, HTML + text templates) → call from requests route. Dashboard shows "Email sent" / "Email not configured" hint.

### Phase 4 — Performance & cleanup
- App: FlatList kept mounted, image sizing, remove dead mocks/components/deps.
- Dashboard: prune unused deps, dedupe fonts, dark‑mode decision, code‑split.
- Server: indexes for sort/filter, aggregation for `syncGraduateProjectIds`, capped Activity.

### Phase 5 — Design polish (system‑wide)
- 4/8 pt spacing scale, type ramp (title/heading/body/label/caption), consistent radius (12/16), button hierarchy (primary/secondary/ghost/destructive), unified badge tones, skeletons that match layout, consistent empty/success/error states, dark‑mode parity in app.

### Phase 6 — Testing & staging
- API smoke script (auth → upload → profile → admin approve → email).
- App: web + Android manual matrix (login, register, edit profile w/ PNG/HEIC/PDF, lists offline, detail 404 vs network).
- Dashboard: each CRUD + failure path (kill API mid‑action).
- VPS staging via `server/deploy/docker-compose.yml` (api + web + mobile‑web), nginx `client_max_body_size`, Mongo auth, env review, `SEED_DEMO=false`.

### Phase 7 — Production readiness
- Secrets rotation, HTTPS/domain, backups for Mongo + uploads volume, log retention, EAS production build (AAB), Play listing assets.

---

## 5. Tracking

Progress is tracked in this file's companion checklist as fixes land. Items are referenced by codebase + file path above.
