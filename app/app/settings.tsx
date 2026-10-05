import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, Logo } from "@/src/components";
import { ChangePasswordCard } from "@/src/components/edit/ChangePasswordCard";
import { useToast } from "@/src/hooks/useToast";
import { useAuth } from "@/src/providers/AuthContext";
import { authService } from "@/src/services/authService";
import { getErrorMessage } from "@/src/services/apiClient";
import { settingsService } from "@/src/services/settingsService";
import { PlatformSettings } from "@/src/models";
import { useTheme } from "@/src/theme/ThemeContext";

const FALLBACK_LEGAL: Record<string, { title: string; body: string }> = {
  about: {
    title: "About BBD PROFOLIO",
    body: "BBD PROFOLIO is a platform developed by BBD Select to showcase real student projects and verified graduates.",
  },
  contact: {
    title: "Contact",
    body: "We'd love to hear from you.",
  },
  privacy: {
    title: "Privacy Policy",
    body: "BBD PROFOLIO respects your privacy.",
  },
  terms: {
    title: "Terms & Conditions",
    body: "By using BBD PROFOLIO you agree to publish accurate professional information.",
  },
};

function buildLegalContent(settings?: PlatformSettings | null) {
  return {
    about: {
      title: `About ${settings?.platformName || "BBD PROFOLIO"}`,
      body: `${settings?.platformName || "BBD PROFOLIO"} is a platform developed by BBD Select to showcase real student projects and verified graduates. Only verified BBD Select graduates can own editable profiles.`,
    },
    contact: {
      title: "Contact",
      body: [
        settings?.contactEmail ? `Email: ${settings.contactEmail}` : null,
        settings?.contactPhone ? `Phone: ${settings.contactPhone}` : null,
        settings?.address ? `Address: ${settings.address}` : null,
        settings?.social?.instagram ? `Instagram: ${settings.social.instagram}` : null,
        settings?.social?.linkedin ? `LinkedIn: ${settings.social.linkedin}` : null,
      ].filter(Boolean).join("\n\n") || FALLBACK_LEGAL.contact.body,
    },
    privacy: {
      title: "Privacy Policy",
      body: settings?.privacyPolicy || FALLBACK_LEGAL.privacy.body,
    },
    terms: {
      title: "Terms & Conditions",
      body: settings?.terms || FALLBACK_LEGAL.terms.body,
    },
  };
};

export default function Settings() {
  const { colors, mode, setMode, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const toast = useToast();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [legalKey, setLegalKey] = useState<keyof typeof FALLBACK_LEGAL>("about");
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const legal = useMemo(() => buildLegalContent(platformSettings), [platformSettings]);

  useEffect(() => {
    settingsService.get().then(setPlatformSettings).catch(() => setPlatformSettings(null));
  }, []);

  const openLegal = (key: keyof typeof FALLBACK_LEGAL) => {
    setLegalKey(key);
    sheetRef.current?.present();
  };

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />,
    [],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: colors.divider }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} testID="settings-back">
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <AppText variant="heading">Settings</AppText>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <Group title="Appearance" colors={colors}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <AppText variant="label" muted style={{ marginBottom: 10 }}>
              Theme
            </AppText>
            <View style={[styles.segment, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md }]}>
              {(["system", "light", "dark"] as const).map((m) => {
                const active = mode === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMode(m)}
                    style={[styles.segmentItem, active && { backgroundColor: colors.surface, borderRadius: radius.sm }]}
                    testID={`theme-${m}`}
                  >
                    <AppText variant="label" weight={active ? "semibold" : "regular"} color={active ? colors.onSurface : colors.onSurfaceSecondary}>
                      {m[0].toUpperCase() + m.slice(1)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Group>

        <Group title="Preferences" colors={colors}>
          <Row icon="language-outline" label="Language" colors={colors} onPress={() => toast.show("More languages coming soon")}>
            <AppText variant="label" muted>
              English
            </AppText>
          </Row>
        </Group>

        <Group title="Information" colors={colors}>
          <Row icon="information-circle-outline" label="About" colors={colors} onPress={() => openLegal("about")} chevron />
          <Divider colors={colors} />
          <Row icon="mail-outline" label="Contact" colors={colors} onPress={() => openLegal("contact")} chevron />
          <Divider colors={colors} />
          <Row icon="shield-checkmark-outline" label="Privacy Policy" colors={colors} onPress={() => openLegal("privacy")} chevron />
          <Divider colors={colors} />
          <Row icon="document-text-outline" label="Terms & Conditions" colors={colors} onPress={() => openLegal("terms")} chevron />
        </Group>

        {isAuthenticated && (
          <>
            <Group title="Account" colors={colors}>
              <Row icon="person-outline" label={user?.email ?? "Account"} colors={colors} />
              <Divider colors={colors} />
              <Row
                icon="log-out-outline"
                label="Logout"
                colors={colors}
                danger
                onPress={async () => {
                  await logout();
                  toast.success("Logged out");
                  router.back();
                }}
              />
            </Group>
            <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
              <ChangePasswordCard
                onSubmit={async (current, next) => {
                  try {
                    await authService.changePassword(current, next);
                    toast.success("Password updated");
                  } catch (err) {
                    throw new Error(getErrorMessage(err));
                  }
                }}
              />
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Logo size={32} />
          <AppText variant="caption" muted style={{ marginTop: 8 }}>
            BBD PROFOLIO · v1.0.0
          </AppText>
        </View>
      </ScrollView>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["60%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.borderStrong }}
      >
        <BottomSheetScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}>
          <AppText variant="title">{legal[legalKey].title}</AppText>
          <AppText variant="body" muted style={{ marginTop: 14, lineHeight: 23 }}>
            {legal[legalKey].body}
          </AppText>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

function Group({ title, colors, children }: { title: string; colors: any; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 24 }}>
      <AppText variant="label" weight="semibold" muted style={{ paddingHorizontal: 16, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>
        {title}
      </AppText>
      <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.divider, backgroundColor: colors.surface }}>
        {children}
      </View>
    </View>
  );
}

function Row({
  icon,
  label,
  colors,
  onPress,
  chevron,
  danger,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: any;
  onPress?: () => void;
  chevron?: boolean;
  danger?: boolean;
  children?: React.ReactNode;
}) {
  const content = (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={danger ? colors.error : colors.onSurfaceSecondary} />
      <AppText variant="body" weight="medium" color={danger ? colors.error : colors.onSurface} style={{ flex: 1 }}>
        {label}
      </AppText>
      {children}
      {chevron && <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceSecondary} />}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} android_ripple={{ color: colors.surfaceSecondary }} testID={`settings-row-${label}`}>
      {content}
    </Pressable>
  );
}

function Divider({ colors }: { colors: any }) {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginLeft: 48 }} />;
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 15 },
  segment: { flexDirection: "row", padding: 4 },
  segmentItem: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  footer: { alignItems: "center", marginTop: 40 },
});
