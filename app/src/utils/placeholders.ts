import { resolveMediaUrl } from "@/src/services/apiClient";

export const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1557683316-973673bdbe71?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80";

export function avatarUrl(url?: string | null): string | undefined {
  return resolveMediaUrl(url);
}

export function coverUrl(url?: string | null): string | undefined {
  return resolveMediaUrl(url);
}

export function projectCoverUrl(url?: string | null): string {
  return resolveMediaUrl(url) || DEFAULT_COVER;
}
export function liveProjectUrl(project: {
  category?: string;
  demoUrl?: string;
  websiteUrl?: string;
}): string | undefined {
  const website = project.websiteUrl?.trim();
  if (project.category === "Apps") return website || undefined;
  return project.demoUrl?.trim() || website || undefined;
}

export function isAppProject(category?: string) {
  return category === "Apps";
}
