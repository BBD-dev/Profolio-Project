import React from "react";
import { Pressable, StyleSheet, View, ViewProps, ViewStyle } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";

type Props = ViewProps & {
  onPress?: () => void;
  padded?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export function Card({ children, onPress, padded = true, style, testID, ...rest }: Props) {
  const { colors, radius, shadow } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: padded ? 16 : 0,
    ...shadow.sm,
  };

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.92 : 1 }, style]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={[cardStyle, style]} {...rest}>
      {children}
    </View>
  );
}
