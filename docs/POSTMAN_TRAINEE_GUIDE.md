# Postman guide for trainees

## Live collection (Postman cloud)

Open Postman and go to workspace **Hussein Mohammed's Workspace**:

| Item | Name |
|------|------|
| **Collection** | **BBD Profolio API** |
| **Environment (production)** | **BBD Profolio — Staging** → `baseUrl` = `https://bbdprofolio.com` |
| **Environment (local)** | **BBD Profolio — Local** → `baseUrl` = `http://localhost:5000` |

**Steps for trainees**

1. Open the collection **BBD Profolio API**.
2. Top-right: select **BBD Profolio — Staging**.
3. Run **Health check GET /api/** → expect `200`.
4. Follow numbered requests: `1 Public`, `2 Auth`, `3 Upload`, `4 Admin`.
5. After each important call: **Save Response** → **Save as example** (for documentation).

Collection description in Postman explains app vs backend tasks and P0 gaps.

---

## Backup import (JSON files)

If cloud access fails, import from **`postman/`**:

| File | Purpose |
|------|---------|
| `postman/BBD-Profolio-API.postman_collection.json` | All main API requests |
| `postman/BBD-Profolio-Staging.postman_environment.json` | Live API: `https://bbdprofolio.com` |
| `postman/BBD-Profolio-Local.postman_environment.json` | Local API: `http://localhost:5000` |

### Import steps

1. Open Postman → **Import** → drag the 3 files (or select folder `postman/`).
2. Top-right environment → choose **BBD Profolio — Staging**.
3. Run **0 — Start here → Health check**. Expect `200` and `"status": "ok"`.

---

## How the API is organized

```
https://bbdprofolio.com/api/          → health
https://bbdprofolio.com/api/auth/*    → register, login, profile (app)
https://bbdprofolio.com/api/graduates → public graduate lists & profiles
https://bbdprofolio.com/api/projects  → public projects (published only)
https://bbdprofolio.com/api/upload    → avatar, cover, CV (logged-in user)
https://bbdprofolio.com/api/admin/*   → dashboard (admin token only)
```

The **graduate app** (`app.bbdprofolio.com`) calls the **same** `/api` paths (proxied through nginx).

**Auth header (when required):**

```http
Authorization: Bearer <access_token>
```

Login requests in the collection save the token to `{{accessToken}}` automatically.

---

## Errors you will see

| HTTP | Meaning | Example `detail` |
|------|---------|------------------|
| 400 | Validation | Missing field, bad format |
| 401 | Not logged in / bad token | `Not authenticated` |
| 403 | Logged in but not allowed | `Account not approved`, pending login |
| 404 | Not found | Graduate / project missing |
| 409 | Conflict | Email already registered |
| 413 | File too large | Upload limit |
| 429 | Rate limit | Too many login/register attempts |

Body shape is usually:

```json
{ "detail": "Human-readable message" }
```

---

## User statuses (important)

| `status` | Can login? | Can use `/auth/me` PATCH? |
|----------|------------|---------------------------|
| `pending` | No (403 on login) | No |
| `approved` | Yes | Yes |
| `rejected` | No | No |
| `changes_requested` | No | No |

Admin approves via **Admin → Approve request**.

---

## Project statuses

| `status` | Visible on public `/api/projects`? |
|----------|-------------------------------------|
| `published` | Yes |
| `draft` | No |
| `hidden` | No |

Today, **creating/updating projects** is under **`/api/admin/projects`** (admin only).  
The **app trainee** builds UI; the **backend trainee** must add **graduate-owned** project APIs for P0 (see gaps below).

---

## Full flow to test in Postman (both trainees)

1. **Health check**
2. **Register** (use a new test email)
3. **Admin login** → **List requests** → copy `requestId` → **Approve**
4. **Graduate login** → token saved
5. **Me** → **PATCH profile**
6. **Upload avatar** (pick a file in Postman) → copy `url` → **PATCH** `avatar` field if needed
7. **Admin → Create project** with `ownerId` = graduate id, `status`: `published`
8. **Public → Project by id** and **Graduate profile by id** — project appears

Save screenshots or **Save response → Save as example** in Postman for each step.

---

## Gaps vs `trainees.md` (backend must fix — document when done)

Trainees: when you implement these, **update this list** and add requests to the collection.

- [ ] **Multiple specializations** — API uses single string `specialization` today.
- [ ] **Graduate project CRUD** — no `/api/projects` POST/PATCH for owners; only admin routes.
- [ ] **Skills suggestions** — no public search endpoint for skill autocomplete.
- [ ] **Experience array** — check if PATCH `/auth/me` accepts `experience` (verify in code; extend if missing).

---

## Assignments

### App trainee

1. Import collection + staging environment.
2. Run folders **1 — Public** and **2 — Auth**; for each request, add a **saved example response** in Postman.
3. Map each screen in the app to the requests it calls (table in your notes or ticket).
4. When API returns 403 for pending users, confirm the app shows the right message (no infinite loading).

### Backend trainee

1. Import collection; run the **full flow** above on staging.
2. Publish **API contract** doc (can be Postman Collection Documentation: Share → Document).
3. Close items in **Gaps** above; add new requests to the collection for any new endpoints.
4. Keep **`TRAINEE_TASKS.md`** in sync with what is actually implemented.

### Optional: publish Postman docs to the team

In Postman: collection **⋯** → **View documentation** → improve descriptions → **Publish** (team link).  
Or export updated JSON and commit to `postman/`.

---

## Local API

```bash
cd server
cp .env.example .env   # fill Mongo, JWT, etc.
npm install
npm run dev
```

Environment: **BBD Profolio — Local**, `baseUrl` = `http://localhost:5000`.

---

## Security

- Do **not** commit real passwords or production tokens.
- Use `trainee.test@example.com` style emails on staging.
- Admin password comes from **`api.env`** on the server — ask your lead, never paste in GitHub.

---

*Related: `TRAINEE_TASKS.md`, `trainees.md`, `server/src/routes/`*
