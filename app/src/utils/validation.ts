export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/** Accepts "example.com" or "https://example.com"; returns a normalized URL or null if invalid. */
export function normalizeUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return "";
  const candidate = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  return URL_RE.test(candidate) ? candidate : null;
}

export function passwordIssue(value: string): string | null {
  if (value.length < 8) return "Password must be at least 8 characters";
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) return "Use letters and numbers";
  return null;
}

export const LIMITS = {
  name: 120,
  headline: 160,
  about: 3000,
  skill: 50,
  skills: 40,
  resumeName: 160,
};
