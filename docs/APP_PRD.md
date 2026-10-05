# BBD PROFOLIO — Product Requirements Document

## Original Problem Statement
A production-ready mobile platform by **BBD Select** to showcase real student projects and verified graduates. NOT social media, NOT an open portfolio builder. Only verified BBD Select graduates own editable profiles. Guests browse freely. New graduate registration only submits an approval request; accounts stay inactive until an admin approves. Premium SaaS aesthetic (Linear/Notion/GitHub Mobile/Apple HIG). Navy `#0A1330` + Lime `#C8D62B`. Light + Dark mode.

> Note: Requested in Flutter, but this platform only supports Expo/React Native. User agreed to build the identical app in **Expo/React Native + FastAPI + MongoDB**.

## Architecture (clean / modular)
- **Backend** (`/app/backend/server.py`): FastAPI + MongoDB (motor). JWT + bcrypt email/password auth. Register→pending, login→approved-only, `/auth/me`, `PATCH /auth/me`, admin `pending`/`approve`. Seeds admin + demo graduate on startup.
- **Frontend** (`/app/frontend`):
  - `src/theme` — tokens, light/dark colors, ThemeContext (persisted mode)
  - `src/models` — Project, Graduate, User types (mirror future API)
  - `src/data` — mock JSON (projects, graduates)
  - `src/services` — fetch apiClient + authService + projectService/graduateService (ready-to-connect)
  - `src/providers` — AuthContext; `src/hooks` — ToastProvider
  - `src/components` — 17 reusable widgets (Button, Card, SearchBar, SectionHeader, EmptyState, Skeleton, Badge, FilterChip, TechChip, ProjectCard, GraduateCard, ImageGallery, Avatar, Input, Logo, StickyHeader, AppText)
  - `app/` — expo-router: splash, onboarding, (auth) login/register, (tabs) home/projects/graduates/profile, project/[id], graduate/[id], settings, edit-profile

## User Personas
- **Guest** — browses projects, graduates, details, profiles. Cannot edit.
- **Verified Graduate** — logs in, owns an editable profile + projects.
- **BBD Select Admin** — (future dashboard) approves pending graduate requests.

## Core Requirements (static)
Splash→Onboarding→Guest/Login→Home. Exactly 4 tabs. Instant search + multi-select filters. Light/Dark. Logo used unmodified across splash/auth/nav.

## Implemented (2026-07-18)
- ✅ Splash + 3-slide onboarding (persisted flag)
- ✅ 4-tab custom bottom nav (Home, Projects, Graduates, My Profile)
- ✅ Home: hero banner + 4 horizontal carousels + pull-to-refresh + skeletons + error/retry
- ✅ Projects: sticky search (name/tech/category/graduate), multi-select category chips, Clear Filters, cards
- ✅ Project Details: cover/logo/desc/tech/gallery/Live Demo/Download/Website/team/share/related
- ✅ Graduates: sticky search, cards with Available-for-Work badge
- ✅ Graduate Profile: cover/avatar/about/skills/experience/links/resume/projects/share
- ✅ My Profile: guest empty state + logged-in editable profile
- ✅ Email/password JWT auth; register submits pending request; login approved-only
- ✅ Edit Profile: photo/cover (image picker, base64), bio, skills, links, availability, resume, persists via PATCH
- ✅ Settings: Dark Mode + theme segment, Language, About/Contact/Privacy/Terms bottom sheets, Logout
- ✅ Light + Dark mode, Geist typography, navy/lime palette
- ✅ Backend tested 11/11; frontend flows verified

## Backlog
- **P1**: Admin Dashboard UI (backend endpoints already exist); connect projects/graduates to real API (swap mock services); pagination on infinite scroll; resume file upload to object storage.
- **P2**: Google Sign-In option; graduate project creation/editing; saved/bookmarked projects; in-app messaging to contact graduates.

## Next Tasks
1. Build/connect the Admin Dashboard approval flow.
2. Replace mock projectService/graduateService with live endpoints when the projects API is ready.
