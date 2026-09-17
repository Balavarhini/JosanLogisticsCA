import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@constants/theme";
import { PrimaryButton } from "./PrimaryButton";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/** Screen-level error placeholder with an optional retry action. */
export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <View style={styles.iconWrap}>
        <Ionicons name="alert-circle" size={32} color={colors.error} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <PrimaryButton label="Try Again" onPress={onRetry} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.errorSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.h3.fontSize,
    color: colors.textPrimary,
  },
  message: {
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    textAlign: "center",
  },
  action: {
    marginTop: spacing.md,
    width: "auto",
    paddingHorizontal: spacing.xl,
  },
});

export default ErrorState;
