import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppText,
  Button,
  EmptyState,
  ErrorState,
  GraduateCard,
  GraduateCardSkeleton,
  Logo,
  ProjectCard,
  ProjectCardSkeleton,
  SectionHeader,
} from "@/src/components";
import { Graduate, Project } from "@/src/models";
import { graduateService } from "@/src/services/graduateService";
import { projectService } from "@/src/services/projectService";
import { useTheme } from "@/src/theme/ThemeContext";

const HERO_IMG =
  "https://images.pexels.com/photos/7562087/pexels-photo-7562087.jpeg?auto=compress&cs=tinysrgb&w=940";

export default function Home() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [latestProjects, setLatestProjects] = useState<Project[]>([]);
  const [featuredGrads, setFeaturedGrads] = useState<Graduate[]>([]);
  const [latestGrads, setLatestGrads] = useState<Graduate[]>([]);

  const load = useCallback(async () => {
    setError(false);
    try {
      const [fp, lp, fg, lg] = await Promise.all([
        projectService.featured(),
        projectService.latest(6),
        graduateService.featured(),
        graduateService.latest(6),
      ]);
      setFeaturedProjects(fp);
      setLatestProjects(lp);
      setFeaturedGrads(fg);
      setLatestGrads(lg);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const bottomPad = insets.bottom + 90;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ width: "100%", paddingBottom: bottomPad }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.onSurface} />}
        testID="home-scroll"
      >
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
          <View style={styles.brandRow}>
            <Logo size={34} />
            <AppText weight="semibold" style={{ letterSpacing: 0.4 }}>
              BBD PROFOLIO
            </AppText>
          </View>
          <Pressable onPress={() => router.push("/settings")} hitSlop={8} testID="home-settings-button">
            <Ionicons name="settings-outline" size={22} color={colors.onSurface} />
          </Pressable>
        </View>

        {/* Hero */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.heroWrap}>
          <View style={[styles.hero, { borderColor: colors.border }]}>
            <Image source={{ uri: HERO_IMG }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={["rgba(5,9,20,0.35)", "rgba(5,9,20,0.88)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <View style={[styles.pill, { backgroundColor: "rgba(200,214,43,0.16)" }]}>
                <AppText variant="caption" weight="semibold" color={colors.brandPrimary}>
                  BUILT BY BBD SELECT STUDENTS
                </AppText>
              </View>
              <AppText variant="display" color="#FFFFFF" style={{ marginTop: 14, lineHeight: 34 }}>
                Discover Real Projects.{"\n"}Meet Verified Talent.
              </AppText>
              <AppText variant="body" style={{ marginTop: 12, color: "rgba(255,255,255,0.82)", lineHeight: 21 }}>
                Explore applications, websites, designs and digital products built by BBD Select
                students.
              </AppText>
              <View style={styles.heroButtons}>
                <Button title="Explore Projects" onPress={() => router.push("/(tabs)/projects")} testID="hero-explore-projects" />
                <Button
                  title="Meet Graduates"
                  variant="ghost"
                  color="#FFFFFF"
                  onPress={() => router.push("/(tabs)/graduates")}
                  style={{ borderColor: "rgba(255,255,255,0.3)" }}
                  testID="hero-meet-graduates"
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {error ? (
          <ErrorState
            title="Couldn’t load the showcase"
            message="Check your connection and try again."
            onRetry={load}
            testID="home-error"
          />
        ) : (
          <>
            <Section title="Built by BBD Select Students" subtitle="Our primary showcase" onAction={() => router.push("/(tabs)/projects")}>
              <HScroll>
                {loading
                  ? [0, 1].map((i) => <ProjectCardSkeleton key={i} />)
                  : featuredProjects.length === 0
                    ? (
                      <View style={{ width: 280 }}>
                        <EmptyState compact icon="albums-outline" title="No featured projects yet" message="Published work will appear here." />
                      </View>
                    )
                    : featuredProjects.map((p) => (
                      <ProjectCard key={p.id} project={p} onPress={() => router.push(`/project/${p.id}`)} testID={`showcase-project-${p.id}`} />
                    ))}
              </HScroll>
            </Section>

            <Section title="Latest Projects" onAction={() => router.push("/(tabs)/projects")}>
              <HScroll>
                {loading
                  ? [0, 1].map((i) => <ProjectCardSkeleton key={i} />)
                  : latestProjects.length === 0
                    ? (
                      <View style={{ width: 280 }}>
                        <EmptyState compact icon="folder-open-outline" title="No projects yet" />
                      </View>
                    )
                    : latestProjects.map((p) => (
                      <ProjectCard key={p.id} project={p} onPress={() => router.push(`/project/${p.id}`)} testID={`latest-project-${p.id}`} />
                    ))}
              </HScroll>
            </Section>

            <Section title="Featured Graduates" onAction={() => router.push("/(tabs)/graduates")}>
              <HScroll>
                {loading
                  ? [0, 1, 2].map((i) => (
                      <GraduateCardSkeleton key={i} layout="carousel" />
                    ))
                  : featuredGrads.length === 0
                    ? (
                      <View style={{ width: 280 }}>
                        <EmptyState compact icon="people-outline" title="No featured graduates yet" />
                      </View>
                    )
                    : featuredGrads.map((g) => (
                      <GraduateCard key={g.id} graduate={g} layout="carousel" onPress={() => router.push(`/graduate/${g.id}`)} testID={`featured-grad-${g.id}`} />
                    ))}
              </HScroll>
            </Section>

            <Section title="Latest Graduates" onAction={() => router.push("/(tabs)/graduates")}>
              <View style={{ paddingHorizontal: 16, gap: 10 }}>
                {loading
                  ? [0, 1].map((i) => <GraduateCardSkeleton key={i} />)
                  : latestGrads.length === 0
                    ? <EmptyState compact icon="people-outline" title="No graduates yet" message="Approved profiles will show up here." />
                    : latestGrads.slice(0, 4).map((g) => (
                      <GraduateCard key={g.id} graduate={g} onPress={() => router.push(`/graduate/${g.id}`)} testID={`latest-grad-${g.id}`} />
                    ))}
              </View>
            </Section>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  subtitle,
  onAction,
  children,
}: {
  title: string;
  subtitle?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: 28 }}>
      <View style={{ paddingHorizontal: 16 }}>
        <SectionHeader title={title} subtitle={subtitle} actionLabel={onAction ? "See all" : undefined} onAction={onAction} />
      </View>
      {children}
    </View>
  );
}

function HScroll({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  heroWrap: { paddingHorizontal: 16, marginTop: 8 },
  hero: {
    borderRadius: 20,
    overflow: "hidden",
    minHeight: 300,
    borderWidth: StyleSheet.hairlineWidth,
  },
  heroContent: { padding: 20, paddingTop: 40, justifyContent: "flex-end", flex: 1 },
  pill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  heroButtons: { flexDirection: "row", gap: 10, marginTop: 20, flexWrap: "wrap" },
});
