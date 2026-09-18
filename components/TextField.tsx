import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Renders a show/hide toggle for password fields instead of a static icon. */
  isPassword?: boolean;
}

/** Standard labeled text input with an optional leading icon, used across all forms. */
export function TextField({ label, error, icon, isPassword, style, secureTextEntry, onFocus, onBlur, ...rest }: TextFieldProps) {
  const [hidden, setHidden] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, isFocused && styles.inputRowFocused, error && styles.inputRowError]}>
        {icon ? <Ionicons name={icon} size={18} color={isFocused ? colors.primary : colors.textSecondary} style={styles.icon} /> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          secureTextEntry={isPassword ? hidden : secureTextEntry}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={18} color={isFocused ? colors.primary : colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 54,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
  },
  inputRowError: {
    borderColor: colors.error,
  },
  inputRowFocused: {
    borderColor: colors.primary,
  },
  icon: {
    marginRight: 2,
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textPrimary,
  },
  error: {
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.caption.fontSize,
    color: colors.error,
  },
});

export default TextField;
