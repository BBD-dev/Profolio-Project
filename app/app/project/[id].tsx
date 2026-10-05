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
  Button,
  DetailScreenSkeleton,
  EmptyState,
  ImageGallery,
  ProjectCard,
  SectionHeader,
  TechChip,
} from "@/src/components";
import { Project } from "@/src/models";
import { useToast } from "@/src/hooks/useToast";
import { projectService } from "@/src/services/projectService";
import { coverUrl, isAppProject, liveProjectUrl, projectCoverUrl } from "@/src/utils/placeholders";
import { normalizeGalleryImages } from "@/src/utils/gallery";
import { shareProject } from "@/src/utils/shareContent";
import { useTheme } from "@/src/theme/ThemeContext";

export default function ProjectDetails() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [related, setRelated] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const p = await projectService.getById(id);
      if (!p) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProject(p);
      setRelated(await projectService.related(p));
      setLoading(false);
    })();
  }, [id]);

  const open = (url?: string) => url && WebBrowser.openBrowserAsync(url);
  const share = async () => {
    if (!project) return;
    try {
      const result = await shareProject(project);
      if (result === "copied") toast.success("Project link copied to clipboard");
      else if (result === "shared") toast.success("Project shared");
    } catch {
      toast.error("Could not share this project");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <DetailScreenSkeleton coverHeight={260 + insets.top} />
      </View>
    );
  }

  if (notFound || !project) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top }}>
        <BackButton onPress={() => router.back()} colors={colors} floating={false} />
        <EmptyState icon="alert-circle-outline" title="Project not found" message="This project may have been removed." />
      </View>
    );
  }

  const liveUrl = liveProjectUrl(project);
  const appProject = isAppProject(project.category);
  const coverImage = projectCoverUrl(coverUrl(project.cover) || coverUrl(project.logo));
  const logoImage = coverUrl(project.logo) || coverUrl(project.cover) || coverImage;
  const galleryImages = normalizeGalleryImages(project.gallery || [], [project.cover, project.logo]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Cover */}
        <View style={styles.cover}>
          <Image source={{ uri: coverImage }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          <LinearGradient colors={["rgba(5,9,20,0.35)", "transparent", colors.surface]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
          <View style={[styles.coverBar, { paddingTop: insets.top + 8 }]}>
            <BackButton onPress={() => router.back()} colors={colors} />
            <Pressable onPress={share} style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.35)" }]} hitSlop={8} testID="project-share-top">
              <Ionicons name="share-outline" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -30 }}>
          <View style={[styles.logo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image source={{ uri: logoImage }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          </View>

          <View style={{ marginTop: 14 }}>
            <View style={styles.catRow}>
              <View style={[styles.catBadge, { backgroundColor: colors.surfaceSecondary }]}>
                <AppText variant="caption" weight="medium" muted>
                  {project.category}
                </AppText>
              </View>
            </View>
            <AppText variant="title" style={{ marginTop: 10 }}>
              {project.name}
            </AppText>
            <Pressable onPress={() => router.push(`/graduate/${project.ownerId}`)} style={styles.ownerRow}>
              <AppText variant="label" muted>
                by {project.ownerName}
              </AppText>
            </Pressable>
          </View>

          <AppText variant="body" style={{ marginTop: 16, lineHeight: 23 }}>
            {project.description}
          </AppText>

          {(appProject || liveUrl) && (
            <View style={styles.ctas}>
              {appProject && (
                <Button
                  title="Install App"
                  icon="download-outline"
                  onPress={() => toast.show("Coming soon", "info")}
                  testID="project-install-button"
                />
              )}
              {!!liveUrl && (
                <Button
                  title={appProject ? "Visit Website" : "Open Live Project"}
                  icon="open-outline"
                  onPress={() => open(liveUrl)}
                  variant={appProject ? "secondary" : "primary"}
                  testID="project-live-button"
                />
              )}
            </View>
          )}

          {/* Tech stack */}
          <Section title="Technology Stack">
            <View style={styles.tags}>
              {project.technologies.map((t) => (
                <TechChip key={t} label={t} />
              ))}
            </View>
          </Section>
        </View>

        {/* Website mockups & screenshots */}
        <View style={{ marginTop: 28 }}>
          <View style={{ paddingHorizontal: 16 }}>
            <SectionHeader
              title={galleryImages.length ? "Website Showcase" : "Project Gallery"}
              subtitle={galleryImages.length ? "Swipe through screenshots and mockups" : undefined}
            />
          </View>
          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <ImageGallery
              images={galleryImages}
              exclude={[project.cover, project.logo]}
              title="Project showcase"
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {/* Team */}
          <Section title="Development Team">
            <View style={{ gap: 12 }}>
              {project.team.map((m) => (
                <View key={m.id} style={styles.teamRow}>
                  <Avatar uri={m.avatar} name={m.name} size={44} />
                  <View>
                    <AppText variant="label" weight="semibold">
                      {m.name}
                    </AppText>
                    <AppText variant="caption" muted style={{ marginTop: 2 }}>
                      {m.role}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          </Section>

          <Button title="Share Project" icon="share-social-outline" variant="secondary" onPress={share} fullWidth style={{ marginTop: 24 }} testID="project-share-button" />
        </View>

        {/* Related */}
        {related.length > 0 && (
          <View style={{ marginTop: 32 }}>
            <View style={{ paddingHorizontal: 16 }}>
              <SectionHeader title="Related Projects" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} onPress={() => router.push(`/project/${p.id}`)} testID={`related-project-${p.id}`} />
              ))}
            </ScrollView>
          </View>
        )}
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

function BackButton({ onPress, colors, floating = true }: { onPress: () => void; colors: any; floating?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[styles.iconBtn, floating ? { backgroundColor: "rgba(0,0,0,0.35)" } : { backgroundColor: colors.surfaceSecondary, marginLeft: 16 }]}
      testID="detail-back-button"
    >
      <Ionicons name="chevron-back" size={20} color={floating ? "#FFFFFF" : colors.onSurface} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cover: { height: 260 },
  coverBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  logo: { width: 60, height: 60, borderRadius: 14, overflow: "hidden", borderWidth: 2 },
  catRow: { flexDirection: "row" },
  catBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: "flex-start" },
  ownerRow: { marginTop: 6 },
  ctas: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 20 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  teamRow: { flexDirection: "row", alignItems: "center", gap: 12 },
});
