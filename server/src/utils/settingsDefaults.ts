import { ISettings } from "../models/Settings";
import { AppError } from "../middleware/errorHandler";
import { EMAIL_RE } from "./validation";

export const DEFAULT_SETTINGS = {
  platformName: "BBD PROFOLIO",
  logo: "",
  primaryColor: "#0A1330",
  accentColor: "#C8D62B",
  social: {
    instagram: "https://instagram.com/bbdselect",
    twitter: "https://x.com/bbdselect",
    linkedin: "https://linkedin.com/company/bbdselect",
    youtube: "https://youtube.com/@bbdselect",
  },
  contactEmail: "hello@bbdselect.com",
  contactPhone: "+962 6 500 1200",
  address: "King Hussein Business Park, Amman, Jordan",
  privacyPolicy:
    "BBD PROFOLIO respects your privacy. We only collect data required to showcase verified graduate profiles and projects. Contact us if you want your data removed.",
  terms:
    "By using BBD PROFOLIO you agree to display accurate professional information. Profiles are verified by BBD Select administrators before publication.",
};

export function serializeSettings(s: ISettings) {
  return {
    platformName: s.platformName || DEFAULT_SETTINGS.platformName,
    logo: s.logo || "",
    primaryColor: s.primaryColor || DEFAULT_SETTINGS.primaryColor,
    accentColor: s.accentColor || DEFAULT_SETTINGS.accentColor,
    social: {
      instagram: s.social?.instagram || "",
      twitter: s.social?.twitter || "",
      linkedin: s.social?.linkedin || "",
      youtube: s.social?.youtube || "",
    },
    contactEmail: s.contactEmail || "",
    contactPhone: s.contactPhone || "",
    address: s.address || "",
    privacyPolicy: s.privacyPolicy || "",
    terms: s.terms || "",
  };
}

export type SettingsPatch = Partial<typeof DEFAULT_SETTINGS>;

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const SOCIAL_KEYS = ["instagram", "twitter", "linkedin", "youtube", "facebook", "tiktok", "website"] as const;

function text(v: unknown, max: number): string | undefined {
  return typeof v === "string" ? v.trim().slice(0, max) : undefined;
}

export function applySettingsPatch(s: ISettings, raw: unknown): void {
  const body = (raw ?? {}) as Record<string, unknown>;

  const platformName = text(body.platformName, 60);
  if (platformName !== undefined) {
    if (!platformName) throw new AppError("Platform name cannot be empty", 400);
    s.platformName = platformName;
  }

  const logo = text(body.logo, 2048);
  if (logo !== undefined) {
    if (logo && !/^https?:\/\//i.test(logo) && !logo.startsWith("/api/uploads/")) {
      throw new AppError("Logo must be a valid URL", 400);
    }
    s.logo = logo;
  }

  for (const key of ["primaryColor", "accentColor"] as const) {
    const c = text(body[key], 7);
    if (c !== undefined) {
      if (!HEX_RE.test(c)) throw new AppError(`${key} must be a hex colour like #0A1330`, 400);
      s[key] = c;
    }
  }

  const contactEmail = text(body.contactEmail, 254);
  if (contactEmail !== undefined) {
    if (contactEmail && !EMAIL_RE.test(contactEmail)) throw new AppError("Contact email is invalid", 400);
    s.contactEmail = contactEmail.toLowerCase();
  }

  const contactPhone = text(body.contactPhone, 40);
  if (contactPhone !== undefined) s.contactPhone = contactPhone;
  const address = text(body.address, 240);
  if (address !== undefined) s.address = address;
  const privacyPolicy = text(body.privacyPolicy, 20000);
  if (privacyPolicy !== undefined) s.privacyPolicy = privacyPolicy;
  const terms = text(body.terms, 20000);
  if (terms !== undefined) s.terms = terms;

  if (body.social && typeof body.social === "object" && !Array.isArray(body.social)) {
    const next: Record<string, string> = { ...(s.social || {}) };
    for (const key of SOCIAL_KEYS) {
      const v = (body.social as Record<string, unknown>)[key];
      if (v === undefined) continue;
      const t = text(v, 2048) ?? "";
      if (t && !/^https?:\/\//i.test(t)) {
        next[key] = `https://${t}`;
      } else {
        next[key] = t;
      }
    }
    s.social = next;
    s.markModified("social");
  }
}

export async function ensureSettingsDefaults(): Promise<void> {
  const { Settings } = await import("../models/Settings");
  let doc = await Settings.findOne();
  if (!doc) {
    await Settings.create(DEFAULT_SETTINGS);
    return;
  }

  let changed = false;

  if (!doc.platformName) { doc.platformName = DEFAULT_SETTINGS.platformName; changed = true; }
  if (!doc.primaryColor) { doc.primaryColor = DEFAULT_SETTINGS.primaryColor; changed = true; }
  if (!doc.accentColor) { doc.accentColor = DEFAULT_SETTINGS.accentColor; changed = true; }
  if (!doc.contactEmail) { doc.contactEmail = DEFAULT_SETTINGS.contactEmail; changed = true; }
  if (!doc.contactPhone) { doc.contactPhone = DEFAULT_SETTINGS.contactPhone; changed = true; }
  if (!doc.address) { doc.address = DEFAULT_SETTINGS.address; changed = true; }
  if (!doc.privacyPolicy) { doc.privacyPolicy = DEFAULT_SETTINGS.privacyPolicy; changed = true; }
  if (!doc.terms) { doc.terms = DEFAULT_SETTINGS.terms; changed = true; }

  const social = { ...(doc.social || {}) };
  let socialChanged = false;
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS.social)) {
    if (!social[key]) {
      social[key] = value;
      socialChanged = true;
    }
  }
  if (socialChanged) {
    doc.social = social;
    changed = true;
  }

  if (changed) await doc.save();
}
