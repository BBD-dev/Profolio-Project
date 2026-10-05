import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";
import { AppText } from "./AppText";

type Props = {
  label: string;
  tone?: "success" | "neutral" | "brand";
  icon?: keyof typeof Ionicons.glyphMap;
  testID?: string;
};

export function Badge({ label, tone = "neutral", icon, testID }: Props) {
  const { colors, radius, isDark } = useTheme();

  const map = {
    success: { bg: colors.success + "22", fg: colors.success },
    brand: { bg: colors.brandPrimary + "26", fg: isDark ? colors.brandPrimary : "#5E6B00" },
    neutral: { bg: colors.surfaceSecondary, fg: colors.onSurfaceSecondary },
  } as const;

  const c = map[tone];

  return (
    <View
      testID={testID}
      style={[styles.wrap, { backgroundColor: c.bg, borderRadius: radius.pill }]}
    >
      {icon && <Ionicons name={icon} size={12} color={c.fg} />}
      <AppText variant="caption" weight="medium" color={c.fg}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
});
