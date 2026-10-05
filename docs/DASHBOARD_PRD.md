# BBD PROFOLIO — Admin Dashboard (PRD)

## Original Problem Statement
Build a modern premium SaaS Admin Dashboard for **BBD PROFOLIO**, the official administration panel for a mobile app that showcases verified graduates and their real projects built during training at **BBD Select**. Frontend-only — the backend (Node/Express/TS/MongoDB) will be built later by another team. No backend, no DB, no server auth. Use clean mock data behind a structured API service layer that can be swapped for real REST APIs without changing the UI.

## User Choices
- Auth: **mock login** — any email/password works (pre-filled demo).
- Stack: **TypeScript** (delivered on CRA/craco toolchain; Vite not possible under the read-only supervisor that runs `yarn start`).
- Persistence: **localStorage** (changes persist across refresh).
- Images: realistic **stock images**.
- Scope: **all pages** built.

## Architecture
- **React 19 + TypeScript** (CRA + craco), Tailwind, shadcn/ui, framer-motion, lenis, recharts, TanStack Query, React Router, sonner.
- Design tokens: navy `#0A1330` primary, lime `#C8D62B` accent; fonts Outfit (headings) + Plus Jakarta Sans (body).
- **Service layer**: `src/services/api.ts` — promise-based, per-resource APIs (requests, graduates, projects, categories, homepage, media, settings, dashboard) with simulated latency. Backed by `src/services/storage.ts` (localStorage seed/CRUD) and `src/data/seed.ts`. Swappable for REST with no UI changes.
- Auth: `src/context/AuthContext.tsx` (mock, localStorage `bbd_auth`), guarded routes in `src/App.tsx`.
- Layout: persistent `Sidebar` + `Topbar` + animated page transitions (`DashboardLayout`).

## Implemented (2026-06)
- **Login** — split-screen kinetic brand panel (masked line reveal, marquee), demo form.
- **Dashboard** — stat cards, category mini-stats, projects-by-category chart, activity timeline, recent requests/projects, quick actions.
- **Graduate Requests** — cards, filters/search/sort, details drawer, approve/reject (confirm) + request-changes (note); approval auto-creates a graduate.
- **Graduates** — cards, filters/search, edit sheet (bio/skills/socials/status/availability), hide/activate/deactivate/available toggle, delete; shows assigned projects.
- **Projects** — cards, full create/edit dialog, category select, graduate assignment (auto-links to profiles), duplicate/publish/hide/feature/delete.
- **Categories** — cards, enable/disable, create/edit/delete (extensible, no code change).
- **Homepage** — section visibility toggles + reorder with live mobile phone preview.
- **Media Library** — filtered grid, preview, upload (URL), delete.
- **Settings** — tabbed (General/Branding/Social/Contact/Legal), color pickers, reset demo data.
- Empty states, loading skeletons, confirmation dialogs, toasts throughout.

## Verification
- Testing agent: 100% of tested frontend flows pass; end-to-end approve→create-graduate and project→graduate linking verified; localStorage persistence verified. No blocking bugs.

## Backlog / Next
- **P1**: Drag-and-drop reorder for homepage sections; bulk actions on tables; CSV export.
- **P1**: Real file upload via object storage (currently URL-based) when backend arrives.
- **P2**: Dark mode toggle (tokens already defined); pagination for large lists; analytics date-range.
- **P2**: Tidy remaining shadcn Label/Input TS typing warnings for a fully clean production build.
- **Integration handoff**: replace `src/services/api.ts` internals with REST calls (types in `src/types` already match intended API contract).
