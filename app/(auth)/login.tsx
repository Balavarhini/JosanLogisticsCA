import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { ApiRequestError } from "@/types/api";
import { TextField } from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Checkbox } from "@/components/Checkbox";

/** Login — email/username + password, matching the source design's "Welcome Back!" screen. */
export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!emailOrUsername.trim()) errors.emailOrUsername = "Enter your email or username.";
    if (!password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async () => {
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login({ emailOrUsername: emailOrUsername.trim(), password });
      // Success flips isAuthenticated; the root RouteGuard redirects to Home.
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setFieldErrors(err.fieldErrors ?? {});
        setFormError(err.message);
      } else {
        setFormError("Unable to sign in. Check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.langRow} accessibilityRole="button">
          <Ionicons name="globe-outline" size={16} color={colors.textPrimary} />
          <Text style={styles.langText}>English</Text>
          <Ionicons name="chevron-down" size={14} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Login to access your account</Text>

        <View style={styles.form}>
          <TextField
            label="Email or Username"
            icon="mail-outline"
            placeholder="Enter your email"
            value={emailOrUsername}
            onChangeText={(text) => {
              setEmailOrUsername(text);
              if (fieldErrors.emailOrUsername) setFieldErrors((prev) => ({ ...prev, emailOrUsername: "" }));
            }}
            autoCapitalize="none"
            autoCorrect={false}
            error={fieldErrors.emailOrUsername}
            returnKeyType="next"
          />
          <TextField
            label="Password"
            icon="lock-closed-outline"
            isPassword
            placeholder="Enter your Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
            }}
            autoCapitalize="none"
            error={fieldErrors.password}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />

          <View style={styles.row}>
            <Checkbox label="Remember me" checked={rememberMe} onChange={setRememberMe} />
            <Pressable onPress={() => router.push("/(auth)/forgot-password")} hitSlop={8}>
              <Text style={styles.link}>Forgot Password?</Text>
            </Pressable>
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <PrimaryButton label="Login" onPress={onSubmit} loading={submitting} style={styles.submit} />

          <Text style={styles.orText}>or continue with</Text>

          <Pressable style={styles.googleButton} accessibilityRole="button">
            <Ionicons name="logo-google" size={18} color={colors.textPrimary} />
            <Text style={styles.googleLabel}>Google</Text>
          </Pressable>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don&apos;t have an account? </Text>
            <Pressable onPress={() => router.push("/(auth)/register")} hitSlop={8}>
              <Text style={styles.link}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xl, gap: spacing.xs },
  langRow: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-end", marginBottom: spacing.xl },
  langText: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  title: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.h1.fontSize,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  form: { gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  link: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.bodySmall.fontSize,
    color: colors.primary,
  },
  formError: { color: colors.error, fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, textAlign: "center" },
  submit: { marginTop: spacing.sm },
  orText: {
    textAlign: "center",
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  googleLabel: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  signupRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.sm },
  signupText: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
});
