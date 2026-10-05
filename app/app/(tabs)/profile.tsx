import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppText,
  Avatar,
  Badge,
  Button,
  EmptyState,
  Logo,
  ProjectCard,
  TechChip,
} from "@/src/components";
import { Project } from "@/src/models";
import { useToast } from "@/src/hooks/useToast";
import { useAuth } from "@/src/providers/AuthContext";
import { projectService } from "@/src/services/projectService";
import { coverUrl } from "@/src/utils/placeholders";
import { useTheme } from "@/src/theme/ThemeContext";

const BBD_SELECT_URL = "https://select.bbdagency.co/";

export default function MyProfile() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isAuthenticated, logout, refresh } = useAuth();
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && user?.id) {
        refresh();
        projectService.byOwner(user.id).then(setProjects).catch(() => setProjects([]));
      }
    }, [isAuthenticated, user?.id]),
  );

  const bottomPad = insets.bottom + 100;

  // -------------------------------------------------- GUEST
  if (!isAuthenticated || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <ScrollView contentContainerStyle={{ paddingBottom: bottomPad, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View style={[styles.guestTop, { paddingTop: insets.top + 16 }]}>
            <AppText variant="title">My Profile</AppText>
            <Pressable onPress={() => router.push("/settings")} hitSlop={8} testID="profile-settings-button">
              <Ionicons name="settings-outline" size={22} color={colors.onSurface} />
            </Pressable>
          </View>

          <View style={styles.guestBody}>
            <View style={[styles.guestIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="person-outline" size={34} color={colors.onSurfaceSecondary} />
            </View>
            <AppText variant="heading" center>
              No Graduate Profile Found
            </AppText>
            <AppText variant="body" muted center style={{ marginTop: 8, maxWidth: 300, lineHeight: 22 }}>
              Only verified BBD Select graduates can own an editable profile. Browse as a guest, or
              request access.
            </AppText>

            <View style={{ width: "100%", gap: 12, marginTop: 32 }}>
              <Button title="Create Graduate Profile" icon="add-circle-outline" onPress={() => router.push("/(auth)/register")} fullWidth testID="create-profile-button" />
              <Button title="Log In" variant="secondary" onPress={() => router.push("/(auth)/login")} fullWidth testID="login-button" />
              <Button title="Explore BBD Select" variant="ghost" onPress={() => WebBrowser.openBrowserAsync(BBD_SELECT_URL)} fullWidth testID="explore-button" />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // -------------------------------------------------- LOGGED IN
  const open = (url?: string) => url && WebBrowser.openBrowserAsync(url);
  const links = user.links ?? {};

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false} testID="profile-scroll">
        {/* Cover */}
        <View style={styles.coverWrap}>
          {coverUrl(user.cover) ? (
            <Image source={{ uri: coverUrl(user.cover) }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceTertiary }]} />
          )}
          <View style={[styles.coverActions, { paddingTop: insets.top + 8 }]}>
            <View style={styles.brandRow}>
              <Logo size={28} />
            </View>
            <Pressable onPress={() => router.push("/settings")} hitSlop={8} style={styles.coverBtn} testID="profile-settings-button">
              <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -36 }}>
          <View style={styles.avatarRow}>
            <Avatar uri={user.avatar} name={user.full_name ?? "?"} size={80} style={{ borderWidth: 3, borderColor: colors.surface }} />
            <Button title="Edit Profile" variant="secondary" icon="create-outline" onPress={() => router.push("/edit-profile")} style={{ marginTop: 40 }} testID="edit-profile-button" />
          </View>

          <View style={{ marginTop: 14 }}>
            <View style={styles.nameRow}>
              <AppText variant="title">{user.full_name}</AppText>
              {user.available_for_work && <Badge label="Available for Work" tone="brand" icon="ellipse" />}
            </View>
            {!!user.headline && (
              <AppText variant="body" muted style={{ marginTop: 4 }}>
                {user.headline}
              </AppText>
            )}
          </View>

          {!!user.about && (
            <Block title="About" colors={colors}>
              <AppText variant="body" style={{ lineHeight: 22 }}>
                {user.about}
              </AppText>
            </Block>
          )}

          {!user.about && (
            <Block title="About" colors={colors}>
              <AppText variant="body" muted style={{ lineHeight: 22 }}>
                Add a short bio so visitors understand your work.
              </AppText>
              <Button title="Add bio" variant="ghost" onPress={() => router.push("/edit-profile")} style={{ marginTop: 8, alignSelf: "flex-start" }} />
            </Block>
          )}

          {!!user.skills?.length && (
            <Block title="Skills" colors={colors}>
              <View style={styles.tags}>
                {user.skills.map((s) => (
                  <TechChip key={s} label={s} />
                ))}
              </View>
            </Block>
          )}

          {!user.skills?.length && (
            <Block title="Skills" colors={colors}>
              <AppText variant="body" muted>
                Add the tools and skills you work with.
              </AppText>
              <Button title="Add skills" variant="ghost" onPress={() => router.push("/edit-profile")} style={{ marginTop: 8, alignSelf: "flex-start" }} />
            </Block>
          )}

          {(links.linkedin || links.github || links.website || links.portfolio || user.email) && (
            <Block title="Links" colors={colors}>
              <View style={{ gap: 4 }}>
                <LinkRow icon="mail-outline" label={user.email} onPress={() => open(`mailto:${user.email}`)} colors={colors} />
                {links.linkedin && <LinkRow icon="logo-linkedin" label="LinkedIn" onPress={() => open(links.linkedin)} colors={colors} />}
                {links.github && <LinkRow icon="logo-github" label="GitHub" onPress={() => open(links.github)} colors={colors} />}
                {links.website && <LinkRow icon="globe-outline" label="Website" onPress={() => open(links.website)} colors={colors} />}
                {links.portfolio && <LinkRow icon="briefcase-outline" label="Portfolio" onPress={() => open(links.portfolio)} colors={colors} />}
              </View>
            </Block>
          )}

          {(user.resume_name || user.cv_url) && (
            <Block title="Resume" colors={colors}>
              <Pressable
                onPress={() => {
                  if (user.cv_url) open(user.cv_url);
                  else toast.error("Resume file is not available yet");
                }}
                style={[styles.resume, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                testID="resume-download"
              >
                <Ionicons name="document-text-outline" size={20} color={colors.onSurface} />
                <AppText variant="label" weight="medium" style={{ flex: 1 }}>
                  {user.resume_name || "View resume"}
                </AppText>
                <Ionicons name="download-outline" size={18} color={colors.onSurfaceSecondary} />
              </Pressable>
            </Block>
          )}

          <Block title="My Projects" colors={colors}>
            {projects.length === 0 ? (
              <EmptyState icon="albums-outline" title="No projects yet" message="Projects you build will appear here." />
            ) : (
              <View style={{ gap: 14 }}>
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} layout="full" onPress={() => router.push(`/project/${p.id}`)} testID={`my-project-${p.id}`} />
                ))}
              </View>
            )}
          </Block>

          <Button
            title="Log Out"
            variant="ghost"
            icon="log-out-outline"
            onPress={async () => {
              await logout();
              toast.success("Logged out");
            }}
            fullWidth
            style={{ marginTop: 12, borderColor: colors.error + "44" }}
            testID="logout-button"
          />
        </View>
      </ScrollView>
    </View>
  );
}

function Block({ title, colors, children }: { title: string; colors: any; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 24 }}>
      <AppText variant="label" weight="semibold" muted style={{ marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6 }}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

function LinkRow({ icon, label, onPress, colors }: { icon: keyof typeof Ionicons.glyphMap; label?: string; onPress: () => void; colors: any }) {
  if (!label) return null;
  return (
    <Pressable onPress={onPress} style={styles.linkRow}>
      <Ionicons name={icon} size={18} color={colors.onSurfaceSecondary} />
      <AppText variant="body" style={{ flex: 1 }} numberOfLines={1}>
        {label}
      </AppText>
      <Ionicons name="open-outline" size={16} color={colors.onSurfaceSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  guestTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  guestBody: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingTop: 40 },
  guestIcon: { width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  coverWrap: { height: 160, position: "relative" },
  coverActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16 },
  brandRow: { flexDirection: "row", alignItems: "center" },
  coverBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" },
  avatarRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  resume: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
});
