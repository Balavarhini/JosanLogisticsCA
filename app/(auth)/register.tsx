import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { ApiRequestError } from "@/types/api";
import { isValidEmail } from "@utils/format";
import { Header } from "@/components/Header";
import { TextField } from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";

/** Register — name, email, password, confirm password. */
export default function RegisterScreen() {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Enter your name.";
    if (!email.trim()) errors.email = "Enter your email.";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Enter a password.";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async () => {
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      // Success flips isAuthenticated; the root RouteGuard redirects to Home.
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setFieldErrors(err.fieldErrors ?? {});
        setFormError(err.message);
      } else {
        setFormError("Unable to create your account. Check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Header variant="title" title="" leftAction="back" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to start shipping with Josan</Text>

        <View style={styles.form}>
          <TextField
            label="Name"
            icon="person-outline"
            placeholder="Enter your Name"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: "" }));
            }}
            error={fieldErrors.name}
            returnKeyType="next"
          />
          <TextField
            label="Email"
            icon="mail-outline"
            placeholder="Enter your email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            error={fieldErrors.email}
            returnKeyType="next"
          />
          <TextField
            label="Password"
            icon="lock-closed-outline"
            isPassword
            placeholder="Enter your Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
            }}
            autoCapitalize="none"
            error={fieldErrors.password}
            returnKeyType="next"
          />
          <TextField
            label="Confirm Password"
            icon="lock-closed-outline"
            isPassword
            placeholder="Confirm your Password"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
            }}
            autoCapitalize="none"
            error={fieldErrors.confirmPassword}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <PrimaryButton label="Register" onPress={onSubmit} loading={submitting} style={styles.submit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.sm, gap: spacing.xs },
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
  formError: {
    color: colors.error,
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.bodySmall.fontSize,
    textAlign: "center",
  },
  submit: { marginTop: spacing.sm },
});
