import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";
import { AppText } from "./AppText";

type Props = {
  visible: boolean;
  message?: string;
};

export function BusyOverlay({ visible, message }: Props) {
  const { colors, radius } = useTheme();
  if (!visible) return null;

  return (
    <View
      style={styles.scrim}
      pointerEvents="auto"
      accessibilityRole="progressbar"
      accessibilityLabel={message || "Please wait"}
      testID="busy-overlay"
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderColor: colors.border,
          },
        ]}
      >
        <ActivityIndicator color={colors.onSurface} />
        <AppText variant="label" weight="medium" center style={styles.message}>
          {message || "Please wait…"}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10, 19, 48, 0.45)",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderWidth: StyleSheet.hairlineWidth,
  },
  message: { alignSelf: "stretch" },
});
