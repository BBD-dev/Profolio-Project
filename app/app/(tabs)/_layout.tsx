import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/src/components";
import { useTheme } from "@/src/theme/ThemeContext";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const TABS: { name: string; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { name: "index", label: "Home", icon: "home-outline", activeIcon: "home" },
  { name: "projects", label: "Projects", icon: "layers-outline", activeIcon: "layers" },
  { name: "graduates", label: "Graduates", icon: "people-outline", activeIcon: "people" },
  { name: "profile", label: "My Profile", icon: "person-outline", activeIcon: "person" },
];

function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom || 10 }]} testID="bottom-tab-bar">
      {Platform.OS !== "web" ? (
        <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      ) : null}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.surface, opacity: Platform.OS === "web" ? 1 : 0.8 },
        ]}
      />
      <View style={[styles.hairline, { backgroundColor: colors.divider }]} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;
          const focused = state.index === index;

          const onPress = () => {
            if (Platform.OS !== "web") Haptics.selectionAsync();
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab} testID={`tab-${tab.name}`}>
              <Ionicons
                name={focused ? tab.activeIcon : tab.icon}
                size={23}
                color={focused ? colors.onSurface : colors.onSurfaceSecondary}
              />
              <AppText
                variant="caption"
                weight={focused ? "semibold" : "regular"}
                color={focused ? colors.onSurface : colors.onSurfaceSecondary}
                style={{ marginTop: 3 }}
              >
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="projects" />
      <Tabs.Screen name="graduates" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
    overflow: "hidden",
  },
  hairline: { position: "absolute", top: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth },
  row: { flexDirection: "row" },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 4 },
});
