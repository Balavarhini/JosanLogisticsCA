import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "@constants/theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "dark" | "danger" | "success";
  style?: ViewStyle;
  accessibilityHint?: string;
}

const VARIANT_BG: Record<NonNullable<PrimaryButtonProps["variant"]>, string> = {
  primary: colors.primary,
  dark: colors.navy,
  danger: colors.error,
  success: colors.success,
};

/** Full-width filled button — the app's primary call-to-action style. */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
  style,
  accessibilityHint,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: isDisabled ? colors.border : pressed && variant === "primary" ? colors.primaryDark : VARIANT_BG[variant] },
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: isDisabled ? colors.textMuted : colors.white },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.button,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    width: "100%",
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.button.fontSize,
  },
});

export default PrimaryButton;
