import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { resolveMediaUrl } from "@/src/services/apiClient";
import { useTheme } from "@/src/theme/ThemeContext";
import { AppText } from "./AppText";

type Props = {
  uri?: string | null;
  name: string;
  size?: number;
  style?: ViewStyle;
};

const BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ uri, name, size = 48, style }: Props) {
  const { colors } = useTheme();
  const dim = { width: size, height: size, borderRadius: size / 2 };
  const src = resolveMediaUrl(uri);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    return (
      <Image
        source={{ uri: src }}
        placeholder={BLURHASH}
        style={[dim, { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border }, style]}
        contentFit="cover"
        transition={200}
        onError={() => setFailed(true)}
        accessibilityLabel={`${name} avatar`}
      />
    );
  }

  return (
    <View
      style={[dim, styles.fallback, { backgroundColor: colors.surfaceTertiary }, style]}
      accessibilityLabel={`${name} avatar`}
    >
      <AppText weight="semibold" color={colors.onSurfaceTertiary} style={{ fontSize: size * 0.36 }}>
        {initials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: "center", justifyContent: "center" },
});
