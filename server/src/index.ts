import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env, emailEnabled, cloudinaryEnabled } from "./config/env";
import { connectDb, disconnectDb } from "./config/db";
import { bootstrapDatabase } from "./bootstrap/index";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { UPLOAD_ROOT } from "./utils/localUpload";
import { resolveBrandLogoPath } from "./brand/logo";
import path from "path";

import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import graduatesRoutes from "./routes/graduates.routes";
import projectsRoutes from "./routes/projects.routes";
import categoriesRoutes, { categoriesAdminRoutes } from "./routes/categories.routes";
import homepageRoutes, { homepageAdminRoutes } from "./routes/homepage.routes";
import settingsRoutes, { settingsAdminRoutes } from "./routes/settings.routes";
import mediaRoutes from "./routes/media.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import uploadRoutes from "./routes/upload.routes";
import requestsRoutes from "./routes/requests.routes";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    // Uploaded images/CVs are consumed by the dashboard + mobile web from other origins.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(morgan(env.isProduction ? "combined" : "dev"));
app.use(
  cors({
    origin: env.corsOrigins.includes("*") || env.corsOrigins.length === 0 ? true : env.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { detail: "Too many requests, please slow down" },
});

app.use("/api", apiLimiter);

const brandLogoPath = resolveBrandLogoPath();
if (brandLogoPath) {
  app.get("/api/brand/logo.jpeg", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.setHeader("Content-Type", "image/jpeg");
    res.sendFile(path.resolve(brandLogoPath));
  });
}

app.use(
  "/api/uploads",
  express.static(UPLOAD_ROOT, {
    maxAge: "7d",
    index: false,
    dotfiles: "deny",
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  }),
);

const api = express.Router();
api.use(authRoutes);
api.use("/graduates", graduatesRoutes);
api.use("/projects", projectsRoutes);
api.use("/categories", categoriesRoutes);
api.use("/homepage", homepageRoutes);
api.use("/settings", settingsRoutes);
api.use("/upload", uploadRoutes);
api.use("/admin/requests", requestsRoutes);
api.use("/admin/categories", categoriesAdminRoutes);
api.use("/admin/homepage", homepageAdminRoutes);
api.use("/admin/settings", settingsAdminRoutes);
api.use("/admin/media", mediaRoutes);
api.use("/admin/dashboard", dashboardRoutes);
api.use("/admin", adminRoutes);

app.use("/api", api);
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await connectDb();
  await bootstrapDatabase();

  const server = app.listen(env.port, () => {
    console.log(`BBD PROFOLIO API running on http://localhost:${env.port} (${env.nodeEnv})`);
    console.log(`  uploads: ${cloudinaryEnabled ? "cloudinary" : "local disk"}`);
    console.log(`  email:   ${emailEnabled ? "resend" : "disabled (set RESEND_API_KEY + EMAIL_FROM)"}`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n${signal} received — shutting down`);
    server.close(async () => {
      await disconnectDb().catch(() => undefined);
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;
