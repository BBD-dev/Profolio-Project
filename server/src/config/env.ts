import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const jwtSecret = required("JWT_SECRET");
if (jwtSecret.length < 32) {
  const msg = "JWT_SECRET must be at least 32 characters";
  if (isProduction) throw new Error(msg);
  console.warn(`[env] WARNING: ${msg}`);
}

const corsOrigins = (process.env.CORS_ORIGINS || (isProduction ? "" : "*"))
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (isProduction && (corsOrigins.length === 0 || corsOrigins.includes("*"))) {
  console.warn("[env] WARNING: CORS_ORIGINS should list explicit origins in production");
}

export const env = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv,
  isProduction,
  mongoUrl: required("MONGO_URL"),
  dbName: process.env.DB_NAME || "bbd-profolio",
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  corsOrigins,
  /** Public base URL of this API (used to build absolute URLs for local uploads). */
  publicApiUrl: (process.env.PUBLIC_API_URL || "").replace(/\/$/, ""),
  /** Where graduates log in (used in emails). */
  publicAppUrl: (process.env.PUBLIC_APP_URL || "").replace(/\/$/, ""),
  email: {
    resendApiKey: process.env.RESEND_API_KEY || "",
    from: process.env.EMAIL_FROM || "",
    replyTo: process.env.EMAIL_REPLY_TO || "",
  },
};

export const cloudinaryEnabled =
  Boolean(env.cloudinary.cloudName) &&
  Boolean(env.cloudinary.apiKey) &&
  Boolean(env.cloudinary.apiSecret);

export const emailEnabled = Boolean(env.email.resendApiKey) && Boolean(env.email.from);
