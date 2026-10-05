import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  testID?: string;
  autoFocus?: boolean;
};

export function SearchBar({ value, onChangeText, placeholder, testID, autoFocus }: Props) {
  const { colors, radius, fontFamily, fontSize } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.md,
        },
      ]}
    >
      <Ionicons name="search" size={18} color={colors.onSurfaceSecondary} />
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceSecondary}
        autoFocus={autoFocus}
        autoCorrect={false}
        style={[
          styles.input,
          { color: colors.onSurface, fontFamily: fontFamily.regular, fontSize: fontSize.lg },
        ]}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable testID="search-clear" onPress={() => onChangeText("")} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.onSurfaceSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 46,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    padding: 0,
    borderWidth: 0,
    outlineStyle: "none",
  } as const,
});
