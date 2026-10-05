import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

import { AppText } from "@/src/components/AppText";
import { useTheme } from "@/src/theme/ThemeContext";

type Props = {
  label: string;
  onPress: () => void;
  testID?: string;
  disabled?: boolean;
  style?: ViewStyle;
};

export function RemoveAssetButton({ label, onPress, testID, disabled, style }: Props) {
  const { colors, radius } = useTheme();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        {
          borderColor: colors.error + "40",
          backgroundColor: colors.error + "10",
          borderRadius: radius.md,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Ionicons name="trash-outline" size={16} color={colors.error} />
      <AppText variant="label" weight="semibold" color={colors.error}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
