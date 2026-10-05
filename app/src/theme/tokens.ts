// Design tokens — sourced directly from design_guidelines.json.
// Never hardcode raw values in screens; consume these tokens.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const fontFamily = {
  regular: "Geist",
  medium: "Geist-Medium",
  semibold: "Geist-SemiBold",
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  display: 30,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;

// Subtle, Linear/Notion-style elevation (shadow tier 1).
export const shadow = {
  none: {},
  sm: {
    shadowColor: "#0A1330",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: "#0A1330",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;
