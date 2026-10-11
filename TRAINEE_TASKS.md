# Tasks for two trainees — App + Backend

From **trainees.md**.  
One person works on the **app** (`app/` — Expo).  
One person works on the **backend** (`server/` — API + MongoDB).

**P0 first.** Both ask the lead on day 1:

- Projects: publish **right away** or **admin approves first**?
- Skills: **pick from API list** or **type your own** too?
- How user knows account was **approved**?

---

# App trainee (`app/`)

**You own:** screens, UI, calling the API, loading/error/empty states, theme (Profolio blue/navy — no lime buttons).

## Your tasks

### P0 — Must work before release

1. **Loading, error, empty**  
   Every list and form: show loading, show error with **Retry**, show empty state.  
   Never show “success” until the API confirms save.

2. **Access request form (UI-04)**  
   - Let user pick **more than one specialization**  
   - Clear field order and validation messages from API  
   - After submit: show pending message (UI-06) in **same theme** as app (dark/light)

3. **Login / guest / register buttons (UI-05)**  
   - Primary: **Create profile / request access**  
   - Secondary: **Log in**  
   - Tertiary: **Explore** (less prominent)

4. **Profile — public & edit (UI-02, UI-09)**  
   - Empty sections: short message or hide on public view; owner sees “complete your profile”  
   - Edit: open the **right section** (not always full edit screen)  
   - One clear **Save** story — no confusing duplicate save buttons  
   - Show what saves on upload vs what needs Save (match backend doc)

5. **Skills (UI-07)**  
   - Search field with **suggestions from API**  
   - Chips to remove; no duplicate skills in UI

6. **Photo (UI-08)**  
   - Change/remove photo from small control on avatar (not a huge Remove button)  
   - Show upload loading overlay

7. **Projects on profile (UI-10)**  
   - Owner: clear **Add project** in My Projects (especially when empty)  
   - Visitor: no add/edit  
   - **Log out** only in Settings — not under projects list

8. **Home & projects empty states (UI-01, UI-03)**  
   - Center icon + text + **Clear filters** in one block on projects screen

9. **Theme (sections 08–09 in trainees.md)**  
   - Primary actions: `#0040FF`, dark background `#030E25`  
   - Remove old **lime** primary buttons  
   - Dialogs/alerts match active theme

10. **Session**  
    - On **401**: logout and send user to login with clear message  
    - Pending user: no full edit flow (respect API errors)

### P1 — After P0

- Profile completion hints for owner  
- Polish spacing, filters, settings UX  

### You deliver

- App runs on staging: **https://app.bbdprofolio.com**  
- Checklist of UI items done (UI-01 … UI-10)  
- Short video or steps for: register → login → edit profile → add project  

### Not your job

- Writing API rules or database logic (backend trainee)  
- Admin dashboard (`front/`) unless lead assigns it  

---

# Backend trainee (`server/`)

**You own:** API, data, permissions, uploads validation, public vs private data.

## Your tasks

### P0 — Must work before release

1. **Map current API**  
   List routes, models, user states (pending/approved), project publish flags.

2. **Access request & auth**  
   - Register with **multiple specializations**  
   - Field errors, duplicate email blocked  
   - Pending users **cannot** edit like approved users  
   - JWT: expired/invalid → **401**

3. **Permissions**  
   - User can only change **own** profile and **own** projects  
   - Enforce on server even if app sends wrong request → **403**

4. **Profile API**  
   - Specializations, skills, bio, experience, links, availability  
   - **Partial update:** one section must not wipe others

5. **Skills API**  
   - Search/suggest endpoint for the app  
   - No duplicate skills stored for same user

6. **Projects API**  
   - Create/update/delete for owner  
   - **Draft vs published** (rule from lead)  
   - Public home/search/list: **only published** projects

7. **Search & lists**  
   - Projects: name, tech, category filters  
   - Graduates: name, specialization, skills  
   - Featured / latest rules written down (how you pick them in DB)

8. **Uploads**  
   - Type + size on server  
   - CV: PDF, max **10 MB**  
   - Failed upload does not break old file URL

9. **Errors**  
   - Same JSON shape everywhere (validation, 401, 403, 404) so app can show messages

### P1 — After P0

- Pagination docs if lists are large  
- Concurrent save / double-submit behavior documented  

### You deliver

- API doc with examples (no secrets)  
- Table: user status → allowed actions  
- Upload rules table  
- Backend sign-off on **trainees.md** section 06 tests  

### Not your job

- App screens and theme (app trainee)  
- Building the mobile web Docker image (lead/DevOps unless assigned)  

---

# API documentation (Postman)

Import **`postman/`** and follow **`docs/POSTMAN_TRAINEE_GUIDE.md`**.  
Both trainees run the full flow and save example responses. Backend keeps the collection updated when APIs change.

---

# Work together (app + backend)

| Topic | Who leads | What to agree |
|--------|-----------|----------------|
| API contract | Backend writes, app reviews | Fields, statuses, errors |
| Multi specialization | Both | Request + profile display |
| Save vs instant upload | Backend documents | App shows correct UX |
| Staging test | Both | Full flow on real staging URL |

**Meeting once per week:** demo register → approve → profile → project → public view.

**Status:** each task → Not started / In progress / Ready for test / Done + PR link.

---

*Source: trainees.md — BBD Profolio handoff v1.1*
