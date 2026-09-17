import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "@constants/theme";

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "outline" | "ghost";
  style?: ViewStyle;
}

/** Outlined / low-emphasis button — used for secondary actions alongside a PrimaryButton. */
export function SecondaryButton({ label, onPress, disabled, variant = "outline", style }: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        variant === "outline" ? styles.outline : styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, variant === "outline" && styles.outlineLabel, disabled && styles.disabledLabel]}>
        {label}
      </Text>
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
  outline: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    borderColor: colors.border,
  },
  label: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.button.fontSize,
    color: colors.textPrimary,
  },
  outlineLabel: {
    color: colors.primary,
  },
  disabledLabel: {
    color: colors.textMuted,
  },
});

export default SecondaryButton;
