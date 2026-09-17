import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { ApiRequestError } from "@/types/api";
import { isValidEmail } from "@utils/format";
import { Header } from "@/components/Header";
import { TextField } from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";

/** Forgot Password — requests a reset link/code for the given email. */
export default function ForgotPasswordScreen() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't send the reset link. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Header variant="title" title="" leftAction="back" />
      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter the email associated with your account and we&apos;ll send you a link to reset your password.
        </Text>

        {sent ? (
          <View style={styles.sentBox}>
            <Text style={styles.sentText}>
              If an account exists for {email.trim()}, a reset link is on its way. Check your inbox.
            </Text>
          </View>
        ) : (
          <View style={styles.form}>
            <TextField
              label="Email"
              icon="mail-outline"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              error={error ?? undefined}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
            <PrimaryButton label="Send Reset Link" onPress={onSubmit} loading={submitting} style={styles.submit} />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.xs },
  title: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.h1.fontSize,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  form: { gap: spacing.md },
  submit: { marginTop: spacing.sm },
  sentBox: {
    backgroundColor: colors.successSoft,
    borderRadius: 14,
    padding: spacing.md,
  },
  sentText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textPrimary,
  },
});
