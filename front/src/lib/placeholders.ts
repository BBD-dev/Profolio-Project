export const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1557683316-973673bdbe71?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80";

/** Returns the user's avatar URL, or undefined when they have not uploaded one. */
export function avatarUrl(url?: string | null): string | undefined {
  const trimmed = url?.trim();
  return trimmed || undefined;
}

/** Returns the user's cover URL, or undefined when they have not uploaded one. */
export function coverUrl(url?: string | null): string | undefined {
  const trimmed = url?.trim();
  return trimmed || undefined;
}

/** Placeholder cover for projects/media without an uploaded image. */
export function projectCoverUrl(url?: string | null): string {
  return url?.trim() || DEFAULT_COVER;
}
