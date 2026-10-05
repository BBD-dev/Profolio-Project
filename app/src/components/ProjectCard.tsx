import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import { Project } from "@/src/models";
import { resolveMediaUrl } from "@/src/services/apiClient";
import { useTheme } from "@/src/theme/ThemeContext";
import { projectCoverUrl } from "@/src/utils/placeholders";
import { AppText } from "./AppText";
import { TechChip } from "./TechChip";

const BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

type Props = {
  project: Project;
  onPress: () => void;
  layout?: "carousel" | "full";
  testID?: string;
};

export function ProjectCard({ project, onPress, layout = "carousel", testID }: Props) {
  const { colors, radius, shadow } = useTheme();
  const isFull = layout === "full";

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          width: isFull ? "100%" : 268,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          opacity: pressed ? 0.94 : 1,
          ...shadow.sm,
        },
      ]}
    >
      <View style={styles.coverWrap}>
        <Image
          source={{ uri: projectCoverUrl(project.cover) }}
          placeholder={BLURHASH}
          style={[styles.cover, { height: isFull ? 170 : 150 }]}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={["transparent", "rgba(5,9,20,0.55)"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={[styles.logo, { borderRadius: radius.md, backgroundColor: colors.surface }]}>
          <Image source={{ uri: resolveMediaUrl(project.logo) || projectCoverUrl(project.cover) }} style={styles.logoImg} contentFit="cover" />
        </View>
        <View style={styles.catBadge}>
          <AppText variant="caption" weight="medium" color="#FFFFFF">
            {project.category}
          </AppText>
        </View>
      </View>

      <View style={styles.body}>
        <AppText variant="heading" numberOfLines={1}>
          {project.name}
        </AppText>
        <AppText variant="label" muted numberOfLines={2} style={{ marginTop: 4, minHeight: 32 }}>
          {project.shortDescription}
        </AppText>
        <View style={styles.tags}>
          {project.technologies.slice(0, 3).map((t) => (
            <TechChip key={t} label={t} />
          ))}
          {project.technologies.length > 3 && (
            <AppText variant="caption" muted style={{ alignSelf: "center" }}>
              +{project.technologies.length - 3}
            </AppText>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { overflow: "hidden", borderWidth: StyleSheet.hairlineWidth },
  coverWrap: { position: "relative" },
  cover: { width: "100%" },
  logo: {
    position: "absolute",
    left: 14,
    bottom: -18,
    width: 44,
    height: 44,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  logoImg: { width: "100%", height: "100%" },
  catBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(10,19,48,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  body: { padding: 14, paddingTop: 26 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
});
