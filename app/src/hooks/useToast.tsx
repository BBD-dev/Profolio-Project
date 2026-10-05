import { Ionicons } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/ThemeContext";

type ToastType = "success" | "error" | "info";
type Toast = { message: string; type: ToastType };

type ToastValue = {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors, radius, spacing, fontFamily, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<Toast | null>(null);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(-20, { duration: 200 }, (finished) => {
      if (finished) runOnJS(setToast)(null);
    });
  }, [opacity, translateY]);

  const show = useCallback(
    (message: string, type: ToastType = "info") => {
      setToast({ message, type });
      opacity.value = withTiming(1, { duration: 220 });
      translateY.value = withTiming(0, { duration: 220 });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(hide, 2600);
    },
    [hide, opacity, translateY],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const iconFor: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
    success: "checkmark-circle",
    error: "alert-circle",
    info: "information-circle",
  };
  const colorFor: Record<ToastType, string> = {
    success: colors.success,
    error: colors.error,
    info: colors.brandPrimary,
  };

  return (
    <ToastContext.Provider
      value={{
        show,
        success: (m) => show(m, "success"),
        error: (m) => show(m, "error"),
      }}
    >
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          testID="app-toast"
          style={[
            styles.wrap,
            animatedStyle,
            {
              top: insets.top + spacing.sm,
              backgroundColor: colors.surfaceInverse,
              borderRadius: radius.md,
            },
          ]}
        >
          <Ionicons name={iconFor[toast.type]} size={18} color={colorFor[toast.type]} />
          <Text
            style={{
              color: colors.onSurfaceInverse,
              fontFamily: fontFamily.medium,
              fontSize: fontSize.base,
              flexShrink: 1,
            }}
          >
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
  },
});
