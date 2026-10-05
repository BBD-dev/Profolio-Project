import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppText,
  EmptyState,
  ErrorState,
  FilterChip,
  ProjectCard,
  ProjectCardSkeleton,
  SearchBar,
} from "@/src/components";
import { CATEGORIES, Category, Project } from "@/src/models";
import { useAsyncList } from "@/src/hooks/useAsyncList";
import { projectService } from "@/src/services/projectService";
import { useTheme } from "@/src/theme/ThemeContext";

export default function ProjectsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Category[]>([]);
  const [headerH, setHeaderH] = useState(140);

  const fetcher = useCallback(async (q: { search: string; categories: Category[] }) => {
    const { items } = await projectService.list({ search: q.search, categories: q.categories, pageSize: 50 });
    return items;
  }, []);

  const {
    items: projects,
    loading,
    refreshing,
    error,
    reload,
    refresh,
  } = useAsyncList<Project, { search: string; categories: Category[] }>(
    fetcher,
    { search, categories: selected },
    [search, selected],
  );

  const toggle = (c: Category) =>
    setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const onRefresh = refresh;

  const hasFilters = selected.length > 0 || search.length > 0;
  const listPadTop = headerH + 8;

  const header = useMemo(
    () => (
      <View
        style={styles.headerAbs}
        onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
        testID="projects-header"
      >
        {Platform.OS !== "web" ? (
          <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        ) : null}
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface, opacity: Platform.OS === "web" ? 1 : 0.8 }]}
        />
        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
          <View style={styles.titleRow}>
            <AppText variant="title">Projects</AppText>
            {hasFilters && (
              <Pressable
                onPress={() => {
                  setSelected([]);
                  setSearch("");
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear filters"
                testID="clear-filters-button"
              >
                <AppText variant="label" weight="semibold" color={colors.onSurfaceSecondary}>
                  Clear Filters
                </AppText>
              </Pressable>
            )}
          </View>
          <View style={{ marginTop: 12 }}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search projects, tech, category, name"
              testID="projects-search-input"
            />
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}
        >
          {CATEGORIES.map((c) => (
            <FilterChip key={c} label={c} selected={selected.includes(c)} onPress={() => toggle(c)} testID={`filter-chip-${c}`} />
          ))}
        </ScrollView>
        <View style={[styles.hairline, { backgroundColor: colors.divider }]} />
      </View>
    ),
    [search, selected, hasFilters, colors, insets.top, isDark],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {loading && projects.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ width: "100%", paddingTop: listPadTop, paddingHorizontal: 16, paddingBottom: 40, gap: 16 }}
          accessibilityLabel="Loading projects"
        >
          {[0, 1, 2].map((i) => (
            <ProjectCardSkeleton key={i} layout="full" />
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(p) => p.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          initialNumToRender={6}
          windowSize={7}
          removeClippedSubviews={Platform.OS !== "web"}
          contentContainerStyle={{ paddingTop: listPadTop, paddingHorizontal: 16, paddingBottom: insets.bottom + 90, gap: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.onSurface} />}
          renderItem={({ item }) => (
            <ProjectCard project={item} layout="full" onPress={() => router.push(`/project/${item.id}`)} testID={`project-card-${item.id}`} />
          )}
          ListEmptyComponent={
            error ? (
              <ErrorState error={error} onRetry={reload} retrying={loading} testID="projects-error" />
            ) : (
              <EmptyState
                icon="search-outline"
                title={hasFilters ? "No projects found" : "No projects yet"}
                message={
                  hasFilters
                    ? "No projects match your search or filters. Try adjusting them."
                    : "Projects published by BBD Select graduates will appear here."
                }
                actionLabel={hasFilters ? "Clear filters" : undefined}
                onAction={
                  hasFilters
                    ? () => {
                        setSelected([]);
                        setSearch("");
                      }
                    : undefined
                }
                testID="projects-empty"
              />
            )
          }
        />
      )}
      {header}
    </View>
  );
}

const styles = StyleSheet.create({
  headerAbs: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, overflow: "hidden" },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hairline: { position: "absolute", bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth },
});
