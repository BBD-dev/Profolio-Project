import React from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";
import { AppText } from "./AppText";

export function TechChip({ label }: { label: string }) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: colors.surfaceSecondary, borderRadius: radius.sm, borderColor: colors.border },
      ]}
    >
      <AppText variant="caption" weight="medium" color={colors.onSurfaceSecondary}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
