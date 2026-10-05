import { Types } from "mongoose";
import { AppError } from "../middleware/errorHandler";

/** Coerce an unknown query/body value to a trimmed string (rejects objects/arrays). */
export function asString(value: unknown, max = 200): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

/** Accept only one of the allowed enum values. */
export function asEnum<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  const str = asString(value, 64);
  if (!str) return undefined;
  return (allowed as readonly string[]).includes(str) ? (str as T) : undefined;
}

export function requireEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  label = "value",
): T {
  const v = asEnum(value, allowed);
  if (!v) throw new AppError(`Invalid ${label}. Allowed: ${allowed.join(", ")}`, 400);
  return v;
}

export function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function asStringArray(value: unknown, maxItems = 50, maxLen = 100): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const t = item.trim().slice(0, maxLen);
    if (t && !out.some((x) => x.toLowerCase() === t.toLowerCase())) out.push(t);
    if (out.length >= maxItems) break;
  }
  return out;
}

/** Escape user input before it goes into a $regex. */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function safeRegex(input: string): { $regex: string; $options: string } {
  return { $regex: escapeRegex(input.slice(0, 64)), $options: "i" };
}

export function parsePage(value: unknown, fallback = 1): number {
  const n = parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function parsePageSize(value: unknown, fallback: number, max = 50): number {
  const n = parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(max, n);
}

export function isObjectId(value: unknown): value is string {
  return typeof value === "string" && Types.ObjectId.isValid(value) && /^[a-f\d]{24}$/i.test(value);
}

export function requireObjectId(value: unknown, label = "id"): Types.ObjectId {
  if (!isObjectId(value)) throw new AppError(`Invalid ${label}`, 400);
  return new Types.ObjectId(value);
}

export function objectIdArray(value: unknown, label = "ids"): Types.ObjectId[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new AppError(`${label} must be an array`, 400);
  return value.map((v) => requireObjectId(v, label));
}

const URL_RE = /^https?:\/\/[^\s]+$/i;

export function asUrl(value: unknown, label = "url"): string | undefined {
  const s = asString(value, 2048);
  if (s === undefined) return undefined;
  if (!URL_RE.test(s) && !s.startsWith("/api/uploads/")) {
    throw new AppError(`Invalid ${label}`, 400);
  }
  return s;
}

/** Optional URL that may also be cleared with "" / null. */
export function asOptionalUrl(value: unknown, label = "url"): string | undefined | null {
  if (value === "" || value === null) return "";
  return asUrl(value, label);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function requireEmail(value: unknown): string {
  const s = asString(value, 254)?.toLowerCase();
  if (!s || !EMAIL_RE.test(s)) throw new AppError("A valid email is required", 400);
  return s;
}

export function requirePassword(value: unknown): string {
  if (typeof value !== "string") throw new AppError("Password is required", 400);
  if (value.length < 8) throw new AppError("Password must be at least 8 characters", 400);
  if (value.length > 128) throw new AppError("Password is too long", 400);
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
    throw new AppError("Password must include letters and numbers", 400);
  }
  return value;
}

/** Pick only allowed keys from a body, applying optional per-key coercers. */
export function pickFields<T extends Record<string, unknown>>(
  body: unknown,
  spec: Record<string, (v: unknown) => unknown>,
): Partial<T> {
  const out: Record<string, unknown> = {};
  if (!body || typeof body !== "object") return out as Partial<T>;
  for (const [key, coerce] of Object.entries(spec)) {
    const raw = (body as Record<string, unknown>)[key];
    if (raw === undefined) continue;
    const value = coerce(raw);
    if (value !== undefined) out[key] = value;
  }
  return out as Partial<T>;
}

/** Plain string coercer with max length; empty string clears the field. */
export const str =
  (max = 500) =>
  (v: unknown) =>
    typeof v === "string" ? v.trim().slice(0, max) : undefined;

export const bool = (v: unknown) => asBoolean(v);
export const strArr =
  (maxItems = 50, maxLen = 100) =>
  (v: unknown) =>
    asStringArray(v, maxItems, maxLen);

/** Social links object: only known keys, each a URL or empty. */
const LINK_KEYS = ["github", "linkedin", "behance", "dribbble", "website", "portfolio", "email", "instagram", "twitter", "youtube"] as const;
export function asLinks(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const out: Record<string, string> = {};
  for (const key of LINK_KEYS) {
    const raw = (value as Record<string, unknown>)[key];
    if (raw === undefined || raw === null) continue;
    if (typeof raw !== "string") continue;
    const t = raw.trim().slice(0, 2048);
    if (!t) continue;
    if (key === "email") {
      if (EMAIL_RE.test(t)) out[key] = t.toLowerCase();
      continue;
    }
    out[key] = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  }
  return out;
}
