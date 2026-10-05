// Light & dark palettes from design_guidelines.json.
// Navy (#0A1330) is the anchor, Lime (#C8D62B) is the selective accent.

export type ColorScheme = {
  surface: string;
  onSurface: string;
  surfaceSecondary: string;
  onSurfaceSecondary: string;
  surfaceTertiary: string;
  onSurfaceTertiary: string;
  surfaceInverse: string;
  onSurfaceInverse: string;
  brand: string;
  brandPrimary: string;
  onBrandPrimary: string;
  brandSecondary: string;
  onBrandSecondary: string;
  brandTertiary: string;
  onBrandTertiary: string;
  success: string;
  onSuccess: string;
  warning: string;
  onWarning: string;
  error: string;
  onError: string;
  info: string;
  onInfo: string;
  border: string;
  borderStrong: string;
  divider: string;
};

export const lightColors: ColorScheme = {
  surface: "#FFFFFF",
  onSurface: "#0A1330",
  surfaceSecondary: "#F4F5F8",
  onSurfaceSecondary: "#3A4565",
  surfaceTertiary: "#E2E6EF",
  onSurfaceTertiary: "#0A1330",
  surfaceInverse: "#0A1330",
  onSurfaceInverse: "#FFFFFF",
  brand: "#0A1330",
  brandPrimary: "#C8D62B",
  onBrandPrimary: "#0A1330",
  brandSecondary: "#0A1330",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#162244",
  onBrandTertiary: "#FFFFFF",
  success: "#2D9F6D",
  onSuccess: "#FFFFFF",
  warning: "#E89B15",
  onWarning: "#FFFFFF",
  error: "#E04848",
  onError: "#FFFFFF",
  info: "#0A1330",
  onInfo: "#FFFFFF",
  border: "#E2E6EF",
  borderStrong: "#C5CBDD",
  divider: "#E2E6EF",
};

export const darkColors: ColorScheme = {
  surface: "#050914",
  onSurface: "#FFFFFF",
  surfaceSecondary: "#0A1330",
  onSurfaceSecondary: "#9BA6C7",
  surfaceTertiary: "#162244",
  onSurfaceTertiary: "#FFFFFF",
  surfaceInverse: "#FFFFFF",
  onSurfaceInverse: "#0A1330",
  brand: "#0A1330",
  brandPrimary: "#C8D62B",
  onBrandPrimary: "#050914",
  brandSecondary: "#C8D62B",
  onBrandSecondary: "#050914",
  brandTertiary: "#162244",
  onBrandTertiary: "#FFFFFF",
  success: "#2D9F6D",
  onSuccess: "#FFFFFF",
  warning: "#E89B15",
  onWarning: "#050914",
  error: "#E04848",
  onError: "#FFFFFF",
  info: "#C8D62B",
  onInfo: "#050914",
  border: "#162244",
  borderStrong: "#3A4565",
  divider: "#162244",
};
