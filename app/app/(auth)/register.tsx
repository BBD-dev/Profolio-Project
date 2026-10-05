import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, AuthError, AuthScreen, Button, Input, Logo } from "@/src/components";
import { useToast } from "@/src/hooks/useToast";
import { CATEGORIES } from "@/src/models";
import { useAuth } from "@/src/providers/AuthContext";
import { ApiError } from "@/src/services/apiClient";
import { useTheme } from "@/src/theme/ThemeContext";
import { isEmail, passwordIssue } from "@/src/utils/validation";

export default function Register() {
  const { colors, radius, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register } = useAuth();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [specialization, setSpecialization] = useState<string>(CATEGORIES[0]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    setError("");
    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!isEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    const pwd = passwordIssue(password);
    if (pwd) {
      setError(pwd);
      return;
    }
    setLoading(true);
    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        full_name: name.trim(),
        headline: headline.trim() || undefined,
        specialization,
      });
      setSubmitted(true);
      toast.success("Request submitted");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={[styles.successRoot, { backgroundColor: colors.surface, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.successLogo}>
          <Logo size={56} radius={16} />
        </View>
        <View style={[styles.checkCircle, { backgroundColor: colors.brandPrimary }]}>
          <Ionicons name="checkmark" size={36} color={isDark ? colors.onBrandPrimary : "#0A1330"} />
        </View>
        <AppText variant="title" center style={{ marginTop: 22 }}>
          Request submitted
        </AppText>
        <AppText variant="body" muted center style={styles.successCopy}>
          Your account is pending BBD Select admin approval. Open the app and log in with this email and password once your profile is approved.
        </AppText>
        <View style={styles.successActions}>
          <Button
            title="Back to browsing"
            onPress={() => router.replace("/(tabs)")}
            fullWidth
            testID="register-done-button"
          />
          <Button
            title="Go to login"
            variant="secondary"
            onPress={() => router.replace("/(auth)/login")}
            fullWidth
          />
        </View>
      </View>
    );
  }

  return (
    <AuthScreen
      eyebrow="Graduate application"
      title="Request access"
      subtitle="Verified BBD Select graduates can own a profile. Submit your details and an admin will review them."
      onBack={() => router.back()}
      backTestID="register-back"
      footer={
        <View style={styles.footer}>
          <AppText variant="label" muted>
            Already approved?
          </AppText>
          <Pressable onPress={() => router.replace("/(auth)/login")} testID="go-to-login" hitSlop={6}>
            <AppText variant="label" weight="semibold" color={colors.onSurface}>
              Log in
            </AppText>
          </Pressable>
        </View>
      }
    >
      <Input
        label="Full name"
        icon="person-outline"
        placeholder="Your name"
        value={name}
        onChangeText={setName}
        testID="register-name-input"
      />
      <Input
        label="Email"
        icon="mail-outline"
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        testID="register-email-input"
      />
      <Input
        label="Professional headline"
        icon="briefcase-outline"
        placeholder="e.g. Mobile Developer"
        value={headline}
        onChangeText={setHeadline}
        testID="register-headline-input"
      />

      <View style={{ gap: 8 }}>
        <AppText variant="label" weight="medium" muted>
          Specialization
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CATEGORIES.map((c) => {
            const active = specialization === c;
            return (
              <Pressable
                key={c}
                onPress={() => setSpecialization(c)}
                testID={`spec-${c}`}
                style={{
                  height: 38,
                  flexShrink: 0,
                  paddingHorizontal: 14,
                  borderRadius: radius.pill,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active ? colors.brandPrimary : colors.surfaceSecondary,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: active ? colors.brandPrimary : colors.border,
                }}
              >
                <AppText variant="label" weight="medium" color={active ? colors.onBrandPrimary : colors.onSurface}>
                  {c}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Input
        label="Password"
        icon="lock-closed-outline"
        placeholder="At least 8 characters"
        hint="At least 8 characters, including letters and numbers"
        secure
        value={password}
        onChangeText={setPassword}
        testID="register-password-input"
      />

      <AuthError message={error} />
      <Button
        title={loading ? "Submitting…" : "Submit request"}
        onPress={submit}
        loading={loading}
        fullWidth
        testID="register-submit-button"
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 28 },
  successRoot: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  successLogo: { marginBottom: 28 },
  checkCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  successCopy: { marginTop: 12, maxWidth: 320, lineHeight: 22 },
  successActions: { width: "100%", gap: 10, marginTop: 32 },
});
