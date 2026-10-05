import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppText,
  Avatar,
  Badge,
  Button,
  DetailScreenSkeleton,
  EmptyState,
  ProjectCard,
  SectionHeader,
  TechChip,
} from "@/src/components";
import { Graduate, Project } from "@/src/models";
import { useToast } from "@/src/hooks/useToast";
import { graduateService } from "@/src/services/graduateService";
import { coverUrl } from "@/src/utils/placeholders";
import { shareGraduateProfile } from "@/src/utils/shareContent";
import { useTheme } from "@/src/theme/ThemeContext";

export default function GraduateProfile() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [grad, setGrad] = useState<Graduate | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await graduateService.getByIdWithProjects(id);
      if (!result) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setGrad(result.graduate);
      setProjects(result.projects);
      setLoading(false);
    })();
  }, [id]);

  const open = (url?: string) => url && WebBrowser.openBrowserAsync(url);
  const share = async () => {
    if (!grad) return;
    try {
      const result = await shareGraduateProfile(grad);
      if (result === "copied") toast.success("Profile link copied to clipboard");
      else if (result === "shared") toast.success("Profile shared");
    } catch {
      toast.error("Could not share this profile");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <DetailScreenSkeleton coverHeight={200 + insets.top} />
      </View>
    );
  }

  if (notFound || !grad) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top + 8 }}>
        <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary, marginLeft: 16 }]} testID="detail-back-button">
          <Ionicons name="chevron-back" size={20} color={colors.onSurface} />
        </Pressable>
        <EmptyState icon="person-remove-outline" title="Profile not found" message="This graduate profile is unavailable." />
      </View>
    );
  }

  const links = grad.links;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={styles.cover}>
          {coverUrl(grad.cover) ? (
            <Image source={{ uri: coverUrl(grad.cover) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceTertiary }]} />
          )}
          <LinearGradient colors={["rgba(5,9,20,0.35)", "transparent", colors.surface]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
          <View style={[styles.coverBar, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]} hitSlop={8} testID="detail-back-button">
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable onPress={share} style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]} hitSlop={8} testID="grad-share-top">
              <Ionicons name="share-outline" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -40 }}>
          <Avatar uri={grad.avatar} name={grad.name} size={90} style={{ borderWidth: 3, borderColor: colors.surface }} />
          <View style={styles.nameRow}>
            <AppText variant="title">{grad.name}</AppText>
            {grad.availableForWork && <Badge label="Available for Work" tone="brand" icon="ellipse" />}
          </View>
          <AppText variant="body" muted style={{ marginTop: 4 }}>
            {grad.headline}
          </AppText>

          <View style={styles.actions}>
            <Button title="Contact" icon="mail-outline" onPress={() => open(`mailto:${links.email}`)} testID="grad-contact-button" />
            <Button title="Share Profile" variant="secondary" icon="share-social-outline" onPress={share} testID="grad-share-button" />
          </View>

          <Section title="About">
            <AppText variant="body" style={{ lineHeight: 23 }}>
              {grad.about}
            </AppText>
          </Section>

          <Section title="Skills">
            <View style={styles.tags}>
              {grad.skills.map((s) => (
                <TechChip key={s} label={s} />
              ))}
            </View>
          </Section>

          <Section title="Experience">
            <View style={{ gap: 14 }}>
              {grad.experience.map((e) => (
                <View key={e.id} style={styles.expRow}>
                  <View style={[styles.expDot, { backgroundColor: colors.brandPrimary }]} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="label" weight="semibold">
                      {e.role}
                    </AppText>
                    <AppText variant="label" muted style={{ marginTop: 2 }}>
                      {e.company} · {e.period}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Links">
            <View style={{ gap: 2 }}>
              <LinkRow icon="mail-outline" label={links.email} onPress={() => open(`mailto:${links.email}`)} colors={colors} />
              {links.linkedin && <LinkRow icon="logo-linkedin" label="LinkedIn" onPress={() => open(links.linkedin)} colors={colors} />}
              {links.github && <LinkRow icon="logo-github" label="GitHub" onPress={() => open(links.github)} colors={colors} />}
              {links.portfolio && <LinkRow icon="briefcase-outline" label="Portfolio" onPress={() => open(links.portfolio)} colors={colors} />}
              {links.website && <LinkRow icon="globe-outline" label="Website" onPress={() => open(links.website)} colors={colors} />}
            </View>
          </Section>

          {(!!grad.resumeName || !!grad.cvUrl) && (
            <Section title="Resume">
              <Pressable
                onPress={() => {
                  if (grad.cvUrl) open(grad.cvUrl);
                  else toast.error("Resume file is not available yet");
                }}
                style={[styles.resume, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                testID="grad-resume-download"
              >
                <Ionicons name="document-text-outline" size={20} color={colors.onSurface} />
                <AppText variant="label" weight="medium" style={{ flex: 1 }}>
                  {grad.resumeName || "View resume"}
                </AppText>
                <Ionicons name="download-outline" size={18} color={colors.onSurfaceSecondary} />
              </Pressable>
            </Section>
          )}
        </View>

        <View style={{ marginTop: 28 }}>
          <View style={{ paddingHorizontal: 16 }}>
            <SectionHeader title="Projects" />
          </View>
          {projects.length === 0 ? (
            <View style={{ paddingHorizontal: 16 }}>
              <EmptyState icon="albums-outline" title="No projects yet" />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} onPress={() => router.push(`/project/${p.id}`)} testID={`grad-project-${p.id}`} />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 24 }}>
      <SectionHeader title={title} />
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
  cover: { height: 200 },
  coverBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 14 },
  actions: { flexDirection: "row", gap: 10, marginTop: 18 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  expRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  expDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  resume: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
});
