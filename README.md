# Profolio-Project

BBD PROFOLIO monorepo — mobile app, admin dashboard, and API in one repository.

Platform by **BBD Select** to showcase verified graduate projects and profiles.

## Structure

```
app/      React Native mobile app (Expo)
front/    Admin dashboard (React)
server/   Express API (MongoDB + Cloudinary)
docs/     Product requirements & design guidelines
```

See [RESTRUCTURE.md](./RESTRUCTURE.md) for the full rebuild log, feature inventory, and API reference.

## Quick start

```bash
# Server
cd server && cp .env.example .env && npm install && npm run dev

# Mobile app
cd app && cp .env.example .env && npm install && npm run dev

# Dashboard
cd front && cp .env.example .env && npm install && npm run dev
```

Requires MongoDB running locally (or Atlas connection string in server `.env`).

**VPS (API + dashboard + local MongoDB):** follow [VPS_DEPLOY_CHECKLIST.md](./VPS_DEPLOY_CHECKLIST.md) step by step. See also [DEPLOY.md](./DEPLOY.md).
