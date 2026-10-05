/**
 * Stable demo media URLs for VPS / mobile / dashboard.
 * Avoids hotlink blocks and removed Unsplash/Pexels assets.
 */

export function avatarFor(email: string): string {
  return `https://i.pravatar.cc/400?u=${encodeURIComponent(email.toLowerCase())}`;
}

export function coverImage(seed: string, width = 1200, height = 675): string {
  const key = encodeURIComponent(seed.replace(/\s+/g, "-").toLowerCase());
  return `https://picsum.photos/seed/${key}/${width}/${height}`;
}

/** Portrait keys used by dashboard localStorage seed (maps to graduate emails). */
export const SEED_AVATARS = {
  a1: avatarFor("layla.haddad@bbd.dev"),
  a2: avatarFor("dana.suleiman@gmail.com"),
  a3: avatarFor("omar.nassar@bbd.dev"),
  a4: avatarFor("nour.khalil@bbd.dev"),
  a5: avatarFor("salma.rashid@bbd.dev"),
  a6: avatarFor("hana.mansour@bbd.dev"),
  a7: avatarFor("yousef.barakat@bbd.dev"),
} as const;

export const SEED_IMAGES = {
  mobile1: coverImage("bbd-mobile-tabaq"),
  mobile2: coverImage("bbd-mobile-fitpulse"),
  web1: coverImage("bbd-web-ledgerly"),
  web2: coverImage("bbd-web-dana"),
  code1: coverImage("bbd-code-karim"),
  dash1: coverImage("bbd-dashboard-analytics"),
  dash2: coverImage("bbd-dashboard-devops"),
  cyber1: coverImage("bbd-cyber-sentinel"),
  gd1: coverImage("bbd-design-aura"),
  gd2: coverImage("bbd-design-bloom"),
  motion1: coverImage("bbd-motion-momentum"),
  motion2: coverImage("bbd-motion-maya"),
} as const;
