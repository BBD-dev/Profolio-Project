import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText, AuthError, AuthScreen, Button, Input } from "@/src/components";
import { useToast } from "@/src/hooks/useToast";
import { useAuth } from "@/src/providers/AuthContext";
import { ApiError } from "@/src/services/apiClient";
import { useTheme } from "@/src/theme/ThemeContext";
import { isEmail } from "@/src/utils/validation";

export default function Login() {
  const { colors } = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (!isEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      toast.success("Welcome back");
      router.replace("/(tabs)/profile");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      eyebrow="Graduate sign in"
      title="Welcome back"
      subtitle="Log in with the email and password you used when you requested access."
      onBack={() => router.back()}
      backTestID="login-back"
      footer={
        <View style={styles.footer}>
          <AppText variant="label" muted>
            No account yet?
          </AppText>
          <Pressable onPress={() => router.replace("/(auth)/register")} testID="go-to-register" hitSlop={6}>
            <AppText variant="label" weight="semibold" color={colors.onSurface}>
              Request access
            </AppText>
          </Pressable>
        </View>
      }
    >
      <Input
        label="Email"
        icon="mail-outline"
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        testID="login-email-input"
      />
      <Input
        label="Password"
        icon="lock-closed-outline"
        placeholder="Your password"
        secure
        value={password}
        onChangeText={setPassword}
        testID="login-password-input"
      />
      <AuthError message={error} />
      <Button
        title={loading ? "Signing in…" : "Log in"}
        onPress={submit}
        loading={loading}
        fullWidth
        testID="login-submit-button"
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 28 },
});
