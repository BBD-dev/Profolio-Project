import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { storage } from "@/src/utils/storage";
import { ColorScheme, darkColors, lightColors } from "./colors";
import { fontFamily, fontSize, radius, shadow, spacing } from "./tokens";

type ThemeMode = "light" | "dark" | "system";

type ThemeValue = {
  colors: ColorScheme;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  spacing: typeof spacing;
  radius: typeof radius;
  shadow: typeof shadow;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
};

const STORAGE_KEY = "bbd.theme.mode";

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<string>(STORAGE_KEY, "system");
      if (saved === "light" || saved === "dark" || saved === "system") {
        setModeState(saved);
      }
      setHydrated(true);
    })();
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    storage.setItem(STORAGE_KEY, m);
  };

  const isDark = mode === "system" ? system === "dark" : mode === "dark";

  const value = useMemo<ThemeValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      mode,
      setMode,
      spacing,
      radius,
      shadow,
      fontFamily,
      fontSize,
    }),
    [isDark, mode],
  );

  if (!hydrated) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
