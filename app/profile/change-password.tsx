import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { colors, spacing, typography } from "@constants/theme";
import * as userService from "@services/user";
import { ApiRequestError } from "@/types/api";
import { Header } from "@/components/Header";
import { TextField } from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";

/** Change Password — current + new + confirm, with client-side validation. */
export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = "Enter your current password.";
    if (newPassword.length < 8) errors.newPassword = "Password must be at least 8 characters.";
    if (confirmPassword !== newPassword) errors.confirmPassword = "Passwords do not match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async () => {
    setFormError(null);
    setSuccess(false);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Couldn't change your password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Header variant="title" title="Change Password" leftAction="back" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          label="Current Password"
          icon="lock-closed-outline"
          isPassword
          value={currentPassword}
          onChangeText={(text) => {
            setCurrentPassword(text);
            if (fieldErrors.currentPassword) setFieldErrors((prev) => ({ ...prev, currentPassword: "" }));
          }}
          error={fieldErrors.currentPassword}
        />
        <TextField
          label="New Password"
          icon="lock-closed-outline"
          isPassword
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: "" }));
          }}
          error={fieldErrors.newPassword}
        />
        <TextField
          label="Confirm New Password"
          icon="lock-closed-outline"
          isPassword
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }}
          error={fieldErrors.confirmPassword}
        />

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}
        {success ? <Text style={styles.successText}>Your password has been changed.</Text> : null}

        <PrimaryButton label="Change Password" onPress={onSubmit} loading={submitting} style={styles.submitButton} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  formError: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.error },
  successText: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.success },
  submitButton: { marginTop: spacing.sm },
});
