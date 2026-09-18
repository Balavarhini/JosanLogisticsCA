import React, { useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { LANGUAGES, LanguageOption } from "@/constants/i18n";
import { ApiRequestError } from "@/types/api";
import { TextField } from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Checkbox } from "@/components/Checkbox";
import { Card } from "@/components/Card";

/** Login — email/username + password, matching the source design's "Welcome Back!" screen. */
export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, loginWithGoogle } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [langModalOpen, setLangModalOpen] = useState(false);

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!emailOrUsername.trim()) errors.emailOrUsername = t("emailOrUsername");
    if (!password) errors.password = t("password");
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

  const onGoogleSubmit = async () => {
    setFormError(null);
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      // Success flips isAuthenticated; the root RouteGuard redirects to Home.
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Google sign-in failed. Please try again.");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 12, spacing.xl + 12) }]} keyboardShouldPersistTaps="handled">
        {/* Language Selector Dropdown Button */}
        <Pressable
          style={styles.langRow}
          onPress={() => setLangModalOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Select Language"
        >
          <Text style={styles.langFlag}>{language.flag}</Text>
          <Text style={styles.langText}>{language.name}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.textPrimary} />
        </Pressable>

        {/* Official Brand Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.landingLogo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>{t("welcomeBack")}</Text>
        <Text style={styles.subtitle}>{t("loginSubtitle")}</Text>

        <View style={styles.form}>
          <TextField
            label={t("emailOrUsername")}
            icon="mail-outline"
            placeholder={t("emailPlaceholder")}
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
            label={t("password")}
            icon="lock-closed-outline"
            isPassword
            placeholder={t("passwordPlaceholder")}
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
            <Checkbox label={t("rememberMe")} checked={rememberMe} onChange={setRememberMe} />
            <Pressable onPress={() => router.push("/(auth)/forgot-password")} hitSlop={8}>
              <Text style={styles.link}>{t("forgotPassword")}</Text>
            </Pressable>
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <PrimaryButton label={t("login")} onPress={onSubmit} loading={submitting} style={styles.submit} />

          <Text style={styles.orText}>{t("orContinueWith")}</Text>

          {/* Interactive Google Sign-In Button */}
          <Pressable
            style={[styles.googleButton, googleSubmitting && styles.googleButtonDisabled]}
            onPress={onGoogleSubmit}
            disabled={googleSubmitting || submitting}
            accessibilityRole="button"
            accessibilityLabel={t("signInWithGoogle")}
          >
            {googleSubmitting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text style={styles.googleLabel}>{t("signInWithGoogle")}</Text>
              </>
            )}
          </Pressable>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>{t("dontHaveAccount")} </Text>
            <Pressable onPress={() => router.push("/(auth)/register")} hitSlop={8}>
              <Text style={styles.link}>{t("signUp")}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Language Selection Modal Sheet */}
      <Modal visible={langModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="globe-outline" size={22} color={colors.primary} />
                <Text style={styles.modalTitle}>{t("selectLanguage")}</Text>
              </View>
              <Pressable onPress={() => setLangModalOpen(false)} hitSlop={8}>
                <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.langList}>
              {LANGUAGES.map((lang) => {
                const isSelected = language.code === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    style={[styles.langItem, isSelected && styles.langItemSelected]}
                    onPress={() => {
                      setLanguage(lang);
                      setLangModalOpen(false);
                    }}
                  >
                    <Text style={styles.langItemFlag}>{lang.flag}</Text>
                    <View style={styles.langItemTextWrap}>
                      <Text style={styles.langItemName}>{lang.name}</Text>
                      <Text style={styles.langItemNative}>{lang.nativeName}</Text>
                    </View>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={20} color={colors.border} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xl, gap: spacing.xs },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langFlag: { fontSize: 16 },
  langText: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.sm,
  },
  landingLogo: {
    width: 180,
    height: 120,
  },
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
    backgroundColor: colors.card,
  },
  googleButtonDisabled: { opacity: 0.7 },
  googleLabel: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  signupRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.sm },
  signupText: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalCard: {
    width: "100%",
    padding: spacing.xl,
    gap: spacing.md,
    borderRadius: radius.card,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.h2.fontSize,
    color: colors.textPrimary,
  },
  langList: {
    gap: spacing.xs,
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  langItemFlag: { fontSize: 22 },
  langItemTextWrap: { flex: 1 },
  langItemName: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  langItemNative: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.caption.fontSize, color: colors.textSecondary },
});

