import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Graduate } from "@/src/models";
import { useTheme } from "@/src/theme/ThemeContext";
import { AppText } from "./AppText";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";

type Props = {
  graduate: Graduate;
  onPress: () => void;
  layout?: "carousel" | "full";
  testID?: string;
};

export function GraduateCard({ graduate, onPress, layout = "full", testID }: Props) {
  const { colors, radius, shadow } = useTheme();
  const isCarousel = layout === "carousel";

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (isCarousel) {
    return (
      <Pressable
        testID={testID}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.carousel,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            opacity: pressed ? 0.94 : 1,
            ...shadow.sm,
          },
        ]}
      >
        <Avatar uri={graduate.avatar} name={graduate.name} size={64} />
        <AppText variant="label" weight="semibold" numberOfLines={1} style={{ marginTop: 12 }}>
          {graduate.name}
        </AppText>
        <AppText variant="caption" muted numberOfLines={2} center style={{ marginTop: 4, minHeight: 28 }}>
          {graduate.headline}
        </AppText>
        {graduate.availableForWork && (
          <View style={{ marginTop: 4 }}>
            <Badge label="Available" tone="brand" />
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          opacity: pressed ? 0.94 : 1,
          ...shadow.sm,
        },
      ]}
    >
      <Avatar uri={graduate.avatar} name={graduate.name} size={56} />
      <View style={{ flex: 1 }}>
        <AppText variant="label" weight="semibold" numberOfLines={1}>
          {graduate.name}
        </AppText>
        <AppText variant="label" muted numberOfLines={1} style={{ marginTop: 2 }}>
          {graduate.headline}
        </AppText>
        {graduate.availableForWork && (
          <View style={{ marginTop: 8 }}>
            <Badge label="Available for Work" tone="brand" />
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carousel: {
    width: 160,
    padding: 16,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
