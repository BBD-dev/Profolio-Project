import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, TextInputProps, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeContext";
import { AppText } from "./AppText";

type Props = TextInputProps & {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  hint?: string;
  secure?: boolean;
  required?: boolean;
  testID?: string;
  containerStyle?: object;
};

const FIELD_HEIGHT = 50;
const TOGGLE_SIZE = 32;

export const Input = forwardRef<TextInput, Props>(function Input(
  {
    label,
    icon,
    error,
    hint,
    secure,
    required,
    testID,
    style,
    multiline,
    containerStyle,
    secureTextEntry: _ignoredSecure,
    textContentType: restTextContentType,
    autoComplete: restAutoComplete,
    onFocus,
    onBlur,
    editable = true,
    ...rest
  },
  ref,
) {
  const { colors, radius, fontFamily, fontSize } = useTheme();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);

  // Web: never use type="password" — Edge/Chrome inject a second eye icon.
  // Mask with CSS (-webkit-text-security) and keep a normal text input.
  const isWeb = Platform.OS === "web";
  const useNativeSecure = secure && !isWeb;

  const borderColor = error ? colors.error : focused ? colors.onSurface : "transparent";

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label && (
        <AppText variant="label" weight="medium" muted>
          {label}
          {required ? (
            <AppText variant="label" color={colors.error}>
              {" "}
              *
            </AppText>
          ) : null}
        </AppText>
      )}
      <View
        style={[
          styles.wrap,
          multiline && styles.wrapMultiline,
          {
            backgroundColor: colors.surfaceSecondary,
            borderRadius: radius.md,
            borderColor,
            opacity: editable ? 1 : 0.6,
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={error ? colors.error : colors.onSurfaceSecondary}
            style={multiline ? { marginTop: 2 } : undefined}
          />
        )}
        <TextInput
          ref={ref}
          testID={testID}
          placeholderTextColor={colors.onSurfaceSecondary}
          multiline={multiline}
          editable={editable}
          autoCorrect={false}
          spellCheck={false}
          secureTextEntry={useNativeSecure ? hidden : false}
          textContentType={secure ? "none" : restTextContentType}
          autoComplete={secure ? "off" : restAutoComplete}
          importantForAutofill={secure ? "no" : undefined}
          passwordRules={secure && Platform.OS === "ios" ? "" : undefined}
          accessibilityLabel={rest.accessibilityLabel ?? label}
          accessibilityState={{ disabled: !editable }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            isWeb && secure && hidden ? ({ WebkitTextSecurity: "disc" } as object) : null,
            { color: colors.onSurface, fontFamily: fontFamily.regular, fontSize: fontSize.lg },
            style,
          ]}
          {...rest}
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={4}
            style={styles.toggle}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            testID="toggle-password"
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={colors.onSurfaceSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.error} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" muted>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: FIELD_HEIGHT,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 0,
    borderWidth: 1,
    overflow: "hidden",
  },
  wrapMultiline: {
    height: undefined,
    minHeight: 100,
    alignItems: "flex-start",
    paddingTop: 12,
    paddingBottom: 12,
    paddingRight: 14,
    overflow: "visible",
  },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    height: "100%",
    padding: 0,
    margin: 0,
    borderWidth: 0,
    ...(Platform.OS === "android" ? { includeFontPadding: false, textAlignVertical: "center" } : null),
    ...(Platform.OS === "web"
      ? ({
          outlineStyle: "none",
          width: "auto",
          maxWidth: "100%",
          lineHeight: 20,
        } as object)
      : null),
  },
  inputMultiline: {
    height: undefined,
    textAlignVertical: "top",
    paddingTop: 2,
    ...(Platform.OS === "web" ? ({ height: "auto" } as object) : null),
  },
  toggle: {
    width: TOGGLE_SIZE,
    height: TOGGLE_SIZE,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
