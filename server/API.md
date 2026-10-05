# BBD PROFOLIO — API Reference

Base URL: `http://localhost:5000/api`

Auth header for protected routes: `Authorization: Bearer <token>`

---

## Auth (mobile app + dashboard admin)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | — | Health check |
| POST | `/auth/register` | — | Graduate registration → `pending` |
| POST | `/auth/login` | — | Login (approved users + admin) |
| GET | `/auth/me` | User | Current profile |
| PATCH | `/auth/me` | User | Update own profile |

### Register body
```json
{
  "email", "password", "full_name",
  "specialization?", "headline?", "phone?", "university?",
  "about?", "skills?", "links?", "social?", "avatar?"
}
```

---

## Public — Graduates (mobile app)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/graduates` | Paginated list (`search`, `page`, `pageSize`, `featured`) → `{ items, total, page, pageSize, hasMore }` |
| GET | `/graduates/featured` | Featured graduates |
| GET | `/graduates/latest?limit=6` | Latest graduates |
| GET | `/graduates/:id` | Profile + published projects |

---

## Public — Projects (mobile app)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/projects` | Paginated list (`search`, `categories`, `page`, `pageSize`, `featured`, `ownerId`) |
| GET | `/projects/featured` | Featured projects |
| GET | `/projects/latest?limit=6` | Latest projects |
| GET | `/projects/owner/:ownerId` | Projects by graduate |
| GET | `/projects/:id` | Project detail |
| GET | `/projects/:id/related?limit=4` | Related projects |

---

## Public — Content

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/categories` | Enabled categories |
| GET | `/homepage` | Homepage sections (visibility/order) |
| GET | `/settings` | Public platform settings |

---

## Upload (authenticated)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/upload` | User | Multipart `file` + `field` (avatar, cover, logo, gallery, project, cv, document, media) → Cloudinary |
| DELETE | `/upload/:publicId` | Admin | Delete from Cloudinary |

---

## Admin — Registration Requests (dashboard)

| Method | Route | Maps to dashboard |
|--------|-------|-------------------|
| GET | `/admin/requests` | `requestsApi.list` |
| GET | `/admin/requests/:id` | `requestsApi.get` |
| PATCH | `/admin/requests/:id/status` | `requestsApi.setStatus` — body: `{ status, note? }` |

**Status values:** `pending`, `approved`, `rejected`, `changes_requested`

---

## Admin — Graduates (dashboard)

| Method | Route | Maps to dashboard |
|--------|-------|-------------------|
| GET | `/admin/users` | `graduatesApi.list` — approved graduates only |
| GET | `/admin/users/:id` | `graduatesApi.get` |
| PATCH | `/admin/users/:id` | `graduatesApi.update` |
| POST | `/admin/users/:id/toggle-available` | `graduatesApi.toggleAvailable` |
| DELETE | `/admin/users/:id` | `graduatesApi.remove` |

**Graduate visibility:** `graduateStatus`: `active` | `inactive` | `hidden`

---

## Admin — Projects (dashboard)

| Method | Route | Maps to dashboard |
|--------|-------|-------------------|
| GET | `/admin/projects` | `projectsApi.list` |
| GET | `/admin/projects/:id` | `projectsApi.get` |
| POST | `/admin/projects` | `projectsApi.create` |
| PATCH | `/admin/projects/:id` | `projectsApi.update` |
| POST | `/admin/projects/:id/duplicate` | `projectsApi.duplicate` |
| DELETE | `/admin/projects/:id` | `projectsApi.remove` |

---

## Admin — Categories (dashboard)

| Method | Route | Maps to dashboard |
|--------|-------|-------------------|
| GET | `/admin/categories` | `categoriesApi.list` (includes disabled) |
| POST | `/admin/categories` | `categoriesApi.create` |
| PATCH | `/admin/categories/:id` | `categoriesApi.update` |
| DELETE | `/admin/categories/:id` | `categoriesApi.remove` |

---

## Admin — Homepage (dashboard)

| Method | Route | Maps to dashboard |
|--------|-------|-------------------|
| GET | `/homepage` | `homepageApi.list` (public read) |
| PATCH | `/admin/homepage/:id` | `homepageApi.update` |
| POST | `/admin/homepage/reorder` | `homepageApi.reorder` — body: section array |

---

## Admin — Media (dashboard)

| Method | Route | Maps to dashboard |
|--------|-------|-------------------|
| GET | `/admin/media` | `mediaApi.list` |
| POST | `/admin/media` | `mediaApi.create` (after upload) |
| DELETE | `/admin/media/:id` | `mediaApi.remove` |

---

## Admin — Settings (dashboard)

| Method | Route | Maps to dashboard |
|--------|-------|-------------------|
| GET | `/admin/settings` | `settingsApi.get` |
| PATCH | `/admin/settings` | `settingsApi.update` |

---

## Admin — Dashboard stats

| Method | Route | Maps to dashboard |
|--------|-------|-------------------|
| GET | `/admin/dashboard/stats` | `dashboardApi.stats` |
| GET | `/admin/dashboard/activity` | `dashboardApi.activity` |

---

## Feature coverage checklist

| Feature | Server | Dashboard UI | Mobile app |
|---------|--------|--------------|------------|
| Auth register/login | ✅ | 🔜 connect | ✅ connected |
| Pending approval flow | ✅ | 🔜 connect | ✅ |
| Changes requested + note | ✅ | 🔜 connect | — |
| Graduate CRUD | ✅ | 🔜 connect | — |
| Graduate visibility (active/inactive/hidden) | ✅ | 🔜 connect | public sees active only |
| Project CRUD + duplicate | ✅ | 🔜 connect | 🔜 connect |
| Category management | ✅ | 🔜 connect | 🔜 connect |
| Homepage sections | ✅ | 🔜 connect | 🔜 connect |
| Media library | ✅ | 🔜 connect | — |
| Platform settings | ✅ | 🔜 connect | partial (settings screen) |
| Dashboard stats/activity | ✅ | 🔜 connect | — |
| File upload (Cloudinary) | ✅ | 🔜 connect | 🔜 connect |
| Featured curation | ✅ | 🔜 connect | 🔜 connect |
| Project ↔ graduate sync | ✅ auto | — | — |

**Next step:** Connect `front/src/services/api.ts` to these endpoints.
