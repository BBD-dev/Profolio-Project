import fs from "fs";
import path from "path";
import { env } from "../config/env";

export const BRAND_LOGO_CID = "bbd-logo";
const FILENAME = "bbd-logo.jpeg";

function candidates(): string[] {
  return [
    path.join(__dirname, "../assets", FILENAME),
    path.join(process.cwd(), "src/assets", FILENAME),
    path.join(process.cwd(), "dist/assets", FILENAME),
  ];
}

export function resolveBrandLogoPath(): string | null {
  return candidates().find((p) => fs.existsSync(p)) ?? null;
}

export function readBrandLogo(): { buffer: Buffer; filename: string; contentType: string } | null {
  const file = resolveBrandLogoPath();
  if (!file) return null;
  return {
    buffer: fs.readFileSync(file),
    filename: FILENAME,
    contentType: "image/jpeg",
  };
}

function isPublicHost(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1";
  } catch {
    return false;
  }
}

/** Absolute URL for the bundled logo when the API is publicly reachable. */
export function hostedBrandLogoUrl(): string | null {
  const base = env.publicApiUrl;
  if (!base || !isPublicHost(base)) return null;
  return `${base}/api/brand/logo.jpeg`;
}

export function isRemoteLogoUrl(url?: string | null): boolean {
  const value = url?.trim() || "";
  return /^https?:\/\//i.test(value) && isPublicHost(value);
}
