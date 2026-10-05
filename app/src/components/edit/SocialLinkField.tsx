import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { AppText } from "@/src/components/AppText";
import { useTheme } from "@/src/theme/ThemeContext";
import { normalizeUrl } from "@/src/utils/validation";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  testID?: string;
  onClear?: () => void;
};

export function SocialLinkField({
  icon,
  accent,
  label,
  hint,
  placeholder,
  value,
  onChangeText,
  error,
  testID,
  onClear,
}: Props) {
  const { colors, radius, fontFamily, fontSize } = useTheme();
  const [focused, setFocused] = useState(false);

  const valid = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    return normalizeUrl(trimmed) !== null;
  }, [value]);

  const borderColor = error ? colors.error : focused ? colors.onSurface : colors.border;

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor,
          borderRadius: radius.md,
          backgroundColor: colors.surfaceSecondary,
        },
      ]}
    >
      <View style={styles.head}>
        <View style={[styles.iconPlate, { backgroundColor: accent + "18" }]}>
          <Ionicons name={icon} size={18} color={accent} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.labelRow}>
            <AppText variant="label" weight="semibold">
              {label}
            </AppText>
            {valid ? (
              <View style={[styles.validDot, { backgroundColor: colors.success }]}>
                <Ionicons name="checkmark" size={10} color={colors.onSuccess} />
              </View>
            ) : null}
          </View>
          <AppText variant="caption" muted numberOfLines={1}>
            {hint}
          </AppText>
        </View>
        {value.trim().length > 0 ? (
          <Pressable
            onPress={() => (onClear ? onClear() : onChangeText(""))}
            hitSlop={8}
            accessibilityLabel={`Clear ${label}`}
          >
            <Ionicons name="close-circle" size={20} color={colors.onSurfaceSecondary} />
          </Pressable>
        ) : null}
      </View>

      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          {
            color: colors.onSurface,
            fontFamily: fontFamily.regular,
            fontSize: fontSize.base,
            borderColor: colors.border,
            borderRadius: radius.sm,
            backgroundColor: colors.surface,
          },
        ]}
      />

      {error ? (
        <AppText variant="caption" color={colors.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconPlate: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  validDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 44,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
