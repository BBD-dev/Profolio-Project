import React from "react";
import { Text as RNText, TextProps, TextStyle } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";

type Variant = "display" | "title" | "heading" | "body" | "label" | "caption";
type Weight = "regular" | "medium" | "semibold";

type Props = TextProps & {
  variant?: Variant;
  weight?: Weight;
  color?: string;
  muted?: boolean;
  center?: boolean;
};

export function AppText({
  variant = "body",
  weight,
  color,
  muted,
  center,
  style,
  ...rest
}: Props) {
  const { colors, fontFamily, fontSize } = useTheme();

  const variants: Record<Variant, { size: number; lh: number; weight: Weight }> = {
    display: { size: fontSize.display, lh: 36, weight: "semibold" },
    title: { size: fontSize.xxl, lh: 30, weight: "semibold" },
    heading: { size: fontSize.xl, lh: 26, weight: "semibold" },
    body: { size: fontSize.base, lh: 20, weight: "regular" },
    label: { size: fontSize.sm, lh: 16, weight: "medium" },
    caption: { size: fontSize.xs, lh: 14, weight: "regular" },
  };

  const v = variants[variant];
  const w = weight ?? v.weight;

  const textStyle: TextStyle = {
    fontFamily: fontFamily[w],
    fontSize: v.size,
    lineHeight: v.lh,
    color: color ?? (muted ? colors.onSurfaceSecondary : colors.onSurface),
    textAlign: center ? "center" : "auto",
  };

  return <RNText style={[textStyle, style]} {...rest} />;
}
