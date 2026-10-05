import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";
import { AppText } from "./AppText";

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  testID?: string;
};

export function FilterChip({ label, selected, onPress, testID }: Props) {
  const { colors, radius, fontFamily } = useTheme();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      style={[
        styles.chip,
        {
          borderRadius: radius.pill,
          backgroundColor: selected ? colors.surfaceInverse : colors.surface,
          borderColor: selected ? colors.surfaceInverse : colors.border,
        },
      ]}
    >
      <AppText
        style={{
          fontFamily: fontFamily.medium,
          fontSize: 13,
          color: selected ? colors.onSurfaceInverse : colors.onSurface,
        }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    flexShrink: 0,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
