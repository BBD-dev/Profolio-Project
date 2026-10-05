import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppText, AuthError, Button, Input } from "@/src/components";
import { EditProfileSection } from "@/src/components/edit/EditProfileSection";
import { useTheme } from "@/src/theme/ThemeContext";
import { passwordIssue } from "@/src/utils/validation";

type Props = {
  onSubmit: (current: string, next: string) => Promise<void>;
};

function Requirement({ ok, label }: { ok: boolean; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.reqRow}>
      <Ionicons name={ok ? "checkmark-circle" : "ellipse-outline"} size={16} color={ok ? colors.success : colors.onSurfaceSecondary} />
      <AppText variant="caption" color={ok ? colors.success : colors.onSurfaceSecondary}>
        {label}
      </AppText>
    </View>
  );
}

export function ChangePasswordCard({ onSubmit }: Props) {
  const { colors } = useTheme();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checks = useMemo(
    () => ({
      length: newPassword.length >= 8,
      mix: /[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword),
      match: newPassword.length > 0 && newPassword === confirmPassword,
    }),
    [newPassword, confirmPassword],
  );

  const canSubmit =
    currentPassword.length > 0 && !passwordIssue(newPassword) && newPassword === confirmPassword && !loading;

  const handleSubmit = async () => {
    setError("");
    const issue = passwordIssue(newPassword);
    if (issue) {
      setError(issue);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!currentPassword) {
      setError("Enter your current password");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <EditProfileSection
      title="Password"
      subtitle="Use a strong password you don’t reuse on other sites."
    >
      <View style={[styles.banner, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        <View style={[styles.bannerIcon, { backgroundColor: colors.brandPrimary + "22" }]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.brandPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="label" weight="semibold">
            Change password
          </AppText>
          <AppText variant="caption" muted style={{ marginTop: 2, lineHeight: 18 }}>
            You’ll stay signed in after updating.
          </AppText>
        </View>
      </View>

      <Input
        label="Current password"
        icon="key-outline"
        secure
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Enter current password"
        testID="settings-current-password"
      />
      <Input
        label="New password"
        icon="lock-closed-outline"
        secure
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="At least 8 characters"
        testID="settings-new-password"
      />
      <Input
        label="Confirm new password"
        icon="shield-checkmark-outline"
        secure
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Repeat new password"
        testID="settings-confirm-password"
      />

      <View style={styles.requirements}>
        <Requirement ok={checks.length} label="At least 8 characters" />
        <Requirement ok={checks.mix} label="Letters and numbers" />
        <Requirement ok={checks.match} label="Confirmation matches" />
      </View>

      <AuthError message={error} />

      <Button
        title={loading ? "Updating…" : "Update password"}
        onPress={handleSubmit}
        loading={loading}
        disabled={!canSubmit}
        fullWidth
        testID="settings-update-password"
      />
    </EditProfileSection>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  requirements: { gap: 6 },
  reqRow: { flexDirection: "row", alignItems: "center", gap: 8 },
});
