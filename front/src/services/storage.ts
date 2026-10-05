import {
  seedCategories, seedGraduates, seedProjects, seedRequests,
  seedHomepage, seedMedia, seedSettings, seedActivity,
} from "@/data/seed";

const VERSION = "bbd_profolio_v1";

export const KEYS = {
  version: "bbd_version",
  requests: "bbd_requests",
  graduates: "bbd_graduates",
  projects: "bbd_projects",
  categories: "bbd_categories",
  homepage: "bbd_homepage",
  media: "bbd_media",
  settings: "bbd_settings",
  activity: "bbd_activity",
  auth: "bbd_auth",
} as const;

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function persist<T>(key: string, value: T) {
  write(key, value);
}

export function seedIfNeeded() {
  if (localStorage.getItem(KEYS.version) === VERSION) return;
  write(KEYS.requests, seedRequests);
  write(KEYS.graduates, seedGraduates);
  write(KEYS.projects, seedProjects);
  write(KEYS.categories, seedCategories);
  write(KEYS.homepage, seedHomepage);
  write(KEYS.media, seedMedia);
  write(KEYS.settings, seedSettings);
  write(KEYS.activity, seedActivity);
  write(KEYS.version, VERSION);
}

export function resetData() {
  Object.values(KEYS).forEach((k) => {
    if (k !== KEYS.auth) localStorage.removeItem(k);
  });
  seedIfNeeded();
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
