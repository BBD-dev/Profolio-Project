# BBD PROFOLIO — Restructure Log

This document records every step taken to rebuild the project into a clean monorepo.

---

## What is BBD PROFOLIO?

**BBD PROFOLIO** is a platform by **BBD Select** to showcase verified graduate projects and profiles. It is **not** open social media — only approved BBD Select graduates get editable profiles.

| Client | Folder | Purpose |
|--------|--------|---------|
| **Mobile App** | `app/` | React Native (Expo) — guests browse, graduates manage profiles |
| **Admin Dashboard** | `front/` | React web app — BBD admins manage graduates, projects, content |
| **API Server** | `server/` | Express + MongoDB + Cloudinary — shared backend for both |

**Design:** Navy `#0A1330` + Lime `#C8D62B`, light/dark mode on mobile.

---

## Step 1 — Removed GitHub connections

- Deleted `.git/` from `BBD-Profolio-Project-` (mobile)
- Deleted `.git/` from `Dashbord-Proflio` (dashboard)

Both projects were disconnected from their old Emergent/GitHub remotes. Fresh repos will be created separately for each part when ready.

---

## Step 2 — New folder structure

```
profolio/
├── app/          ← React Native Expo app (was BBD-Profolio-Project-/frontend)
├── front/        ← Admin dashboard website (was Dashbord-Proflio/frontend)
├── server/       ← Express API (NEW — replaces both Python/FastAPI backends)
├── docs/         ← PRD + design guidelines
├── RESTRUCTURE.md
└── README.md
```

**Deleted:**
- `BBD-Profolio-Project-/` (entire old folder including FastAPI backend)
- `Dashbord-Proflio/` (entire old folder including placeholder FastAPI backend)
- Emergent platform files (`.emergent/`, cmd-guard scripts, test reports)
- Both old Python backends (`server.py`, `requirements.txt`)

---

## Step 3 — Cleaned the mobile app (`app/`)

- Renamed package to `bbd-profolio-app`
- Removed Emergent `preinstall` hook and guard scripts
- Removed `scripts/cmd-guard/`, `reset-project.js`, etc.

---

## Step 4 — Cleaned the dashboard (`front/`)

- Renamed package to `bbd-profolio-dashboard`
- Dashboard UI kept as-is (React + CRA + Tailwind + shadcn/ui)
- Currently uses **localStorage mock API** — next phase: connect to Express server

---

## Step 5 — Created Express server (`server/`)

**Stack:** Express, TypeScript, MongoDB (Mongoose), JWT, bcrypt, Cloudinary, Multer, Zod

### API routes

#### Public (mobile app)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/` | Health check |
| POST | `/api/auth/register` | Graduate registration → pending |
| POST | `/api/auth/login` | Login (approved users only) |
| GET | `/api/auth/me` | Current user profile |
| PATCH | `/api/auth/me` | Update own profile |
| GET | `/api/graduates` | List approved graduates (search, paginate) |
| GET | `/api/graduates/featured` | Featured graduates |
| GET | `/api/graduates/latest` | Latest graduates |
| GET | `/api/graduates/:id` | Graduate profile + projects |
| GET | `/api/projects` | List published projects |
| GET | `/api/projects/featured` | Featured projects |
| GET | `/api/projects/latest` | Latest projects |
| GET | `/api/projects/:id` | Project detail |
| GET | `/api/projects/:id/related` | Related projects |
| GET | `/api/categories` | Enabled categories |
| GET | `/api/homepage` | Homepage sections config |
| GET | `/api/settings` | Public platform settings |
| POST | `/api/upload` | Upload file (auth required, Cloudinary) |

#### Admin (dashboard)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/users/pending` | Pending registration requests |
| POST | `/api/admin/users/:id/approve` | Approve graduate |
| POST | `/api/admin/users/:id/reject` | Reject graduate |
| GET | `/api/admin/users` | All graduates |
| PATCH | `/api/admin/users/:id` | Edit graduate |
| DELETE | `/api/admin/users/:id` | Delete graduate |
| GET/POST/PATCH/DELETE | `/api/admin/projects` | Project CRUD |
| GET/POST/PATCH/DELETE | `/api/admin/categories` | Category CRUD |
| PATCH/POST | `/api/admin/homepage` | Homepage section management |
| GET/PATCH | `/api/admin/settings` | Platform settings |
| GET/POST/DELETE | `/api/admin/media` | Media library |
| GET | `/api/admin/dashboard/stats` | Dashboard statistics |
| GET | `/api/admin/dashboard/activity` | Activity log |

---

## Mobile App Features (`app/`)

### Screens

| Screen | Route | Status |
|--------|-------|--------|
| Splash | `/` | ✅ Built |
| Onboarding (3 slides) | `/onboarding` | ✅ Built |
| Login | `/(auth)/login` | ✅ Connected to API |
| Register (request access) | `/(auth)/register` | ✅ Connected to API |
| Home (4 carousels) | `/(tabs)/` | ⚠️ Uses mock projects/graduates |
| Projects list + filters | `/(tabs)/projects` | ⚠️ Mock data |
| Graduates list | `/(tabs)/graduates` | ⚠️ Mock data |
| My Profile | `/(tabs)/profile` | ✅ Auth + mock projects |
| Project detail | `/project/[id]` | ⚠️ Mock data |
| Graduate profile | `/graduate/[id]` | ⚠️ Mock data |
| Edit profile | `/edit-profile` | ✅ API (avatar/cover as base64 today) |
| Settings | `/settings` | ✅ Built (theme, about, logout) |

### Auth flow

1. Graduate registers → status `pending` → cannot login
2. Admin approves in dashboard → status `approved`
3. Graduate logs in → JWT stored in SecureStore
4. Profile edits via `PATCH /api/auth/me`

---

## Dashboard Features (`front/`)

| Page | Purpose | Data source today |
|------|---------|-------------------|
| Login | Admin authentication | Mock (localStorage) |
| Dashboard | Stats, recent activity | Mock |
| Graduate Requests | Approve/reject pending | Mock |
| Graduates | Manage graduate profiles | Mock |
| Projects | CRUD student projects | Mock |
| Categories | Manage specializations | Mock |
| Homepage | Section visibility/order | Mock |
| Media Library | Uploaded assets | Mock |
| Settings | Platform branding/contact | Mock |

**Next phase:** Replace `front/src/services/api.ts` localStorage mocks with real HTTP calls to Express.

---

## Environment variables

### Server (`server/.env`)

```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/bbd-profolio
DB_NAME=bbd-profolio
JWT_SECRET=your-secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_EMAIL=admin@bbdselect.com
ADMIN_PASSWORD=BBDadmin2026!
```

### Mobile app (`app/.env`)

```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:5000
```

### Dashboard (`front/.env`)

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## How to run locally

```bash
# 1. Start MongoDB (local or Atlas)

# 2. Server
cd server
cp .env.example .env   # edit values
npm install
npm run dev            # http://localhost:5000

# 3. Mobile app
cd app
cp .env.example .env
npm install
npm run dev

# 4. Dashboard
cd front
cp .env.example .env
npm install
npm run dev             # http://localhost:3000
```

---

## Phase 2 — Connect dashboard to server ✅

- [x] Created `front/src/services/apiClient.ts` (axios + JWT + upload)
- [x] Replaced localStorage mocks in `front/src/services/api.ts` with live HTTP
- [x] Real admin login via `POST /auth/login` (admin role required)
- [x] Session restore via `GET /auth/me` on page load
- [x] All dashboard pages wired: Requests, Graduates, Projects, Categories, Homepage, Media, Settings, Dashboard stats
- [x] Media library supports Cloudinary file upload
- [x] Removed demo data reset from Settings

### Run dashboard

```bash
# Terminal 1 — server
cd server && npm run dev

# Terminal 2 — dashboard
cd front && npm install && npm run dev
# Login: admin@bbdselect.com / BBDadmin2026! (from server .env)
```

---

## What's next (planned phases)

### Phase 3 — Connect mobile app to server
- [ ] Replace mock `projectService` / `graduateService` with live API
- [ ] Use Cloudinary upload instead of base64 for images
- [ ] Upload resume PDF properly

### Phase 4 — Separate Git repos
- [ ] Create repo for `server/`
- [ ] Create repo for `app/`
- [ ] Create repo for `front/`

---

## Default seed accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@bbdselect.com` | `BBDadmin2026!` |
| Demo graduate | `grad@bbdselect.com` | `Password123!` |

Created automatically on server startup when env vars are set.
