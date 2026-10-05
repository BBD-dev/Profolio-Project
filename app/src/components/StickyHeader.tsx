import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/ThemeContext";

// A safe-area-aware sticky header with a frosted-glass background so content
// scrolls underneath (per design glassmorphism rules).
export function StickyHeader({
  children,
  scrolled = true,
}: {
  children: React.ReactNode;
  scrolled?: boolean;
}) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      {scrolled && Platform.OS !== "web" ? (
        <BlurView
          intensity={40}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
      )}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.surface, opacity: Platform.OS === "web" ? 1 : 0.72 },
        ]}
      />
      <View style={styles.content}>{children}</View>
      <View style={[styles.hairline, { backgroundColor: colors.divider }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: "hidden",
  },
  content: { paddingHorizontal: 16, paddingBottom: 12 },
  hairline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});
