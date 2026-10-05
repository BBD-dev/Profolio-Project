import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { AppText } from "@/src/components/AppText";
import { useTheme } from "@/src/theme/ThemeContext";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function EditProfileSection({ title, subtitle, children, style }: Props) {
  const { colors, radius } = useTheme();

  return (
    <View style={[{ gap: 10 }, style]}>
      <View style={{ gap: 4 }}>
        <AppText variant="label" weight="semibold">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" muted style={{ lineHeight: 18 }}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
