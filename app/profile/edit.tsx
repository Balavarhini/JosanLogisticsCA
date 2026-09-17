import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";
import * as userService from "@services/user";
import { ApiRequestError } from "@/types/api";
import { initialsFromName, isValidEmail } from "@utils/format";
import { Header } from "@/components/Header";
import { TextField } from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";

/** "My Profile" — edit name, email, and phone. */
export default function EditProfileScreen() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Enter your name.";
    if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSave = async () => {
    setFormError(null);
    setSaved(false);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const updated = await userService.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      setUser(updated);
      setSaved(true);
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Couldn't save your changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Header variant="title" title="My Profile" leftAction="back" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialsFromName(name || "Customer")}</Text>
          </View>
        </View>

        <TextField
          label="Full Name"
          icon="person-outline"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
          }}
          error={fieldErrors.name}
        />
        <TextField
          label="Email"
          icon="mail-outline"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          error={fieldErrors.email}
        />
        <TextField label="Phone" icon="call-outline" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}
        {saved ? <Text style={styles.savedText}>Profile updated.</Text> : null}

        <PrimaryButton label="Save Changes" onPress={onSave} loading={submitting} style={styles.saveButton} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  avatarWrap: { alignItems: "center", marginBottom: spacing.sm },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.h2.fontSize, color: colors.primary },
  formError: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.error },
  savedText: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.success },
  saveButton: { marginTop: spacing.sm },
});
