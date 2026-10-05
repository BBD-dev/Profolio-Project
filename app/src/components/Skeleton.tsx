import React, { useEffect } from "react";
import { DimensionValue, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/src/theme/ThemeContext";

type Props = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width = "100%", height = 16, radius = 8, style }: Props) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { height, borderRadius: radius, backgroundColor: colors.surfaceTertiary, width },
        animated,
        style,
      ]}
    />
  );
}

type CardLayout = "carousel" | "full";

export function ProjectCardSkeleton({ layout = "carousel" }: { layout?: CardLayout }) {
  const { colors, radius } = useTheme();
  const isFull = layout === "full";
  return (
    <View
      style={[
        styles.card,
        {
          width: isFull ? undefined : 268,
          borderColor: colors.border,
          borderRadius: radius.lg,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Skeleton height={isFull ? 170 : 150} radius={0} style={styles.edgeFill} />
      <View style={[styles.body, { paddingTop: isFull ? 26 : 14 }]}>
        <View style={styles.inset}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="92%" height={12} />
          <Skeleton width="40%" height={12} />
          {isFull ? (
            <View style={styles.chips}>
              <Skeleton width={72} height={28} radius={999} />
              <Skeleton width={88} height={28} radius={999} />
              <Skeleton width={64} height={28} radius={999} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function GraduateCardSkeleton({ layout = "full" }: { layout?: CardLayout }) {
  const { colors, radius } = useTheme();
  const isCarousel = layout === "carousel";

  if (isCarousel) {
    return (
      <View
        style={[
          styles.gradCarousel,
          { borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
        ]}
      >
        <Skeleton width={64} height={64} radius={32} />
        <View style={styles.inset}>
          <Skeleton width="70%" height={14} />
          <Skeleton width="90%" height={12} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.gradRow,
        { borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
      ]}
    >
      <Skeleton width={56} height={56} radius={28} />
      <View style={[styles.inset, { flex: 1, paddingHorizontal: 0 }]}>
        <Skeleton width="55%" height={14} />
        <Skeleton width="85%" height={12} />
      </View>
    </View>
  );
}

export function DetailScreenSkeleton({ coverHeight = 200 }: { coverHeight?: number }) {
  return (
    <View style={styles.detailRoot}>
      <Skeleton height={coverHeight} radius={0} style={styles.edgeFill} />
      <View style={styles.detailBody}>
        <View style={styles.detailHead}>
          <Skeleton width={72} height={72} radius={16} />
          <View style={[styles.inset, { flex: 1, paddingHorizontal: 0 }]}>
            <Skeleton width="70%" height={20} />
            <Skeleton width="45%" height={12} />
          </View>
        </View>
        <View style={styles.inset}>
          <Skeleton width="100%" height={14} />
          <Skeleton width="82%" height={14} />
        </View>
        <View style={styles.actions}>
          <View style={styles.actionSlot}>
            <Skeleton height={44} radius={12} />
          </View>
          <View style={styles.actionSlot}>
            <Skeleton height={44} radius={12} />
          </View>
        </View>
        <View style={styles.inset}>
          <Skeleton height={160} radius={16} />
          <Skeleton height={160} radius={16} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, alignSelf: "stretch" },
  edgeFill: { alignSelf: "stretch" },
  body: { alignSelf: "stretch", paddingHorizontal: 14, paddingBottom: 14 },
  inset: { alignSelf: "stretch", gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4, alignSelf: "stretch" },
  gradRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  gradCarousel: {
    width: 160,
    padding: 16,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    overflow: "hidden",
  },
  detailRoot: { flex: 1, alignSelf: "stretch", width: "100%" },
  detailBody: { alignSelf: "stretch", paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  detailHead: { flexDirection: "row", alignItems: "center", gap: 12, alignSelf: "stretch" },
  actions: { flexDirection: "row", gap: 10, marginTop: 4, alignSelf: "stretch" },
  actionSlot: { flex: 1, minWidth: 0 },
});
