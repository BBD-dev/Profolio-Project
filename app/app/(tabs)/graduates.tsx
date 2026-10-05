import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Platform, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppText,
  EmptyState,
  ErrorState,
  GraduateCard,
  GraduateCardSkeleton,
  SearchBar,
} from "@/src/components";
import { Graduate } from "@/src/models";
import { useAsyncList } from "@/src/hooks/useAsyncList";
import { graduateService } from "@/src/services/graduateService";
import { useTheme } from "@/src/theme/ThemeContext";

export default function GraduatesScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [headerH, setHeaderH] = useState(120);

  const fetcher = useCallback(async (q: { search: string }) => {
    const { items } = await graduateService.list({ search: q.search, pageSize: 50 });
    return items;
  }, []);

  const {
    items: grads,
    loading,
    refreshing,
    error,
    reload,
    refresh: onRefresh,
  } = useAsyncList<Graduate, { search: string }>(fetcher, { search }, [search]);

  const listPadTop = headerH + 8;

  const header = useMemo(
    () => (
      <View
        style={styles.headerAbs}
        onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
        testID="graduates-header"
      >
        {Platform.OS !== "web" ? (
          <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        ) : null}
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface, opacity: Platform.OS === "web" ? 1 : 0.8 }]}
        />
        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12 }}>
          <AppText variant="title">Graduates</AppText>
          <AppText variant="label" muted style={{ marginTop: 2 }}>
            Verified BBD Select talent
          </AppText>
          <View style={{ marginTop: 12 }}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search name, specialization, skills"
              testID="graduates-search-input"
            />
          </View>
        </View>
        <View style={[styles.hairline, { backgroundColor: colors.divider }]} />
      </View>
    ),
    [search, colors, insets.top, isDark],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {loading ? (
        <ScrollView contentContainerStyle={{ width: "100%", paddingTop: listPadTop, paddingHorizontal: 16, paddingBottom: 40, gap: 10 }}>
          {[0, 1, 2, 3].map((i) => (
            <GraduateCardSkeleton key={i} />
          ))}
        </ScrollView>
      ) : error ? (
        <View style={{ paddingTop: listPadTop }}>
          <ErrorState error={error} onRetry={reload} retrying={loading} testID="graduates-error" />
        </View>
      ) : (
        <FlatList
          data={grads}
          keyExtractor={(g) => g.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: listPadTop, paddingHorizontal: 16, paddingBottom: insets.bottom + 90, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.onSurface} />}
          renderItem={({ item }) => (
            <GraduateCard graduate={item} onPress={() => router.push(`/graduate/${item.id}`)} testID={`graduate-card-${item.id}`} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title={search ? "No graduates found" : "No graduates yet"}
              message={
                search
                  ? "No graduates match your search. Try a different term."
                  : "Approved BBD Select graduates will appear here."
              }
              testID="graduates-empty"
            />
          }
        />
      )}
      {header}
    </View>
  );
}

const styles = StyleSheet.create({
  headerAbs: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, overflow: "hidden" },
  hairline: { position: "absolute", bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth },
});
