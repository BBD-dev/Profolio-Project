const DEFAULT_COVER_KEY = "images.unsplash.com/photo-1557683316";

/** Stable key for deduping Cloudinary/CDN URLs that differ only by query params. */
export function galleryImageKey(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    return `${parsed.hostname}${parsed.pathname}`.toLowerCase();
  } catch {
    return trimmed.toLowerCase().split("?")[0];
  }
}

function isPlaceholderGalleryUrl(url: string): boolean {
  const key = galleryImageKey(url);
  return !key || key.includes(DEFAULT_COVER_KEY);
}

/** Remove blanks, duplicates, cover/logo repeats, and stock placeholders. */
export function normalizeGalleryImages(
  images: string[],
  exclude: string[] = [],
): string[] {
  const excludeKeys = new Set(
    exclude.map(galleryImageKey).filter(Boolean),
  );
  const seen = new Set<string>();

  return images
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url))
    .filter((url) => !isPlaceholderGalleryUrl(url))
    .filter((url) => {
      const key = galleryImageKey(url);
      if (!key || excludeKeys.has(key)) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
