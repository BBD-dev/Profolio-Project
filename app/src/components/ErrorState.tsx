import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ApiError } from "@/src/services/apiClient";
import { useTheme } from "@/src/theme/ThemeContext";
import { AppText } from "./AppText";
import { Button } from "./Button";

type Props = {
  error?: unknown;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
  compact?: boolean;
  testID?: string;
};

function describe(error: unknown): { title: string; message: string; icon: keyof typeof Ionicons.glyphMap } {
  if (error instanceof ApiError) {
    if (error.isNetwork) {
      return {
        icon: "cloud-offline-outline",
        title: "You're offline",
        message: "Check your internet connection and try again.",
      };
    }
    if (error.isTimeout) {
      return {
        icon: "time-outline",
        title: "Taking too long",
        message: "The server didn't respond in time. Please try again.",
      };
    }
    if (error.status >= 500) {
      return {
        icon: "server-outline",
        title: "Server problem",
        message: "Something went wrong on our side. Please try again shortly.",
      };
    }
    return { icon: "alert-circle-outline", title: "Something went wrong", message: error.message };
  }
  return {
    icon: "alert-circle-outline",
    title: "Something went wrong",
    message: "We couldn't load this right now. Please try again.",
  };
}

export function ErrorState({ error, title, message, onRetry, retrying, compact, testID }: Props) {
  const { colors, radius } = useTheme();
  const d = describe(error);

  return (
    <View style={[styles.wrap, compact && styles.compact]} testID={testID} accessibilityRole="alert">
      <View style={[styles.iconWrap, { backgroundColor: colors.error + "14", borderRadius: radius.pill }]}>
        <Ionicons name={d.icon} size={28} color={colors.error} />
      </View>
      <AppText variant="heading" center>
        {title ?? d.title}
      </AppText>
      <AppText variant="body" muted center style={{ marginTop: 6, maxWidth: 300, lineHeight: 22 }}>
        {message ?? d.message}
      </AppText>
      {onRetry && (
        <Button
          title="Try again"
          icon="refresh-outline"
          variant="secondary"
          onPress={onRetry}
          loading={retrying}
          style={{ marginTop: 20 }}
          testID="error-retry"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingVertical: 56, paddingHorizontal: 24 },
  compact: { paddingVertical: 28 },
  iconWrap: { width: 64, height: 64, alignItems: "center", justifyContent: "center", marginBottom: 16 },
});
