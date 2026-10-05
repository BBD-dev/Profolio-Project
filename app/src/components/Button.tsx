import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/src/theme/ThemeContext";
import { AppText } from "./AppText";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
  color?: string;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  fullWidth,
  style,
  testID,
  color,
}: Props) {
  const { colors, radius, fontFamily, fontSize } = useTheme();

  const bg: Record<Variant, string> = {
    primary: colors.brandPrimary,
    secondary: colors.surfaceSecondary,
    ghost: "transparent",
  };
  const fgMap: Record<Variant, string> = {
    primary: colors.onBrandPrimary,
    secondary: colors.onSurface,
    ghost: colors.onSurface,
  };
  const fg: Record<Variant, string> = {
    primary: color ?? fgMap.primary,
    secondary: color ?? fgMap.secondary,
    ghost: color ?? fgMap.ghost,
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg[variant],
          borderRadius: radius.md,
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={fg[variant]} size="small" />
        ) : icon ? (
          <Ionicons name={icon} size={16} color={fg[variant]} />
        ) : null}
        <AppText
          style={{ color: fg[variant], fontFamily: fontFamily.medium, fontSize: fontSize.base }}
        >
          {title}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 46,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { flexDirection: "row", alignItems: "center", gap: 8 },
});
