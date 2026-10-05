import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/ThemeContext";
import { AppText } from "./AppText";
import { Logo } from "./Logo";

type Props = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  onBack?: () => void;
  backTestID?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const NAVY = "#0A1330";

export function AuthScreen({
  title,
  subtitle,
  eyebrow,
  onBack,
  backTestID,
  children,
  footer,
}: Props) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: NAVY }]}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={10}
              style={styles.back}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              testID={backTestID}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>
          ) : (
            <View style={styles.back} />
          )}

          <View style={styles.brandRow}>
            <Logo size={52} radius={14} />
            <View style={{ flex: 1 }}>
              <AppText variant="caption" weight="semibold" color="#C8D62B">
                BBD SELECT
              </AppText>
              <AppText variant="heading" color="#FFFFFF">
                PROFOLIO
              </AppText>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
            },
          ]}
        >
          {eyebrow ? (
            <View
              style={[
                styles.eyebrow,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderRadius: radius.pill },
              ]}
            >
              <View style={styles.dot} />
              <AppText variant="caption" weight="medium" color={colors.onSurfaceSecondary}>
                {eyebrow}
              </AppText>
            </View>
          ) : null}

          <AppText variant="title" style={{ marginTop: eyebrow ? 16 : 0 }}>
            {title}
          </AppText>
          <AppText variant="body" muted style={{ marginTop: 8, lineHeight: 22 }}>
            {subtitle}
          </AppText>

          <View style={styles.form}>{children}</View>
          {footer}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export function AuthError({ message }: { message: string }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View style={[styles.errorBox, { backgroundColor: colors.error + "14", borderColor: colors.error + "33" }]}>
      <Ionicons name="alert-circle" size={16} color={colors.error} />
      <AppText variant="label" color={colors.error} style={{ flex: 1 }}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 28 },
  back: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -6,
    marginBottom: 18,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  sheet: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
  },
  eyebrow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#C8D62B" },
  form: { marginTop: 24, gap: 16 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
