import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";
import { AppText } from "./AppText";
import { Button } from "./Button";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  testID?: string;
};

export function EmptyState({ icon = "folder-open-outline", title, message, actionLabel, onAction, compact, testID }: Props) {
  const { colors, radius } = useTheme();
  return (
    <View style={[styles.wrap, compact && styles.compact]} testID={testID}>
      <View
        style={[styles.iconWrap, compact && styles.iconCompact, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.pill }]}
      >
        <Ionicons name={icon} size={compact ? 22 : 30} color={colors.onSurfaceSecondary} />
      </View>
      <AppText variant={compact ? "label" : "heading"} weight="semibold" center>
        {title}
      </AppText>
      {message && (
        <AppText variant="body" muted center style={{ marginTop: 6, maxWidth: 280, lineHeight: 21 }}>
          {message}
        </AppText>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} style={{ marginTop: compact ? 14 : 20 }} testID="empty-action" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingVertical: 56, paddingHorizontal: 24 },
  compact: { paddingVertical: 28 },
  iconWrap: { width: 68, height: 68, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  iconCompact: { width: 48, height: 48, marginBottom: 10 },
});
