import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";

interface AccordionRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  /** If provided, tapping the row navigates instead of expanding inline. */
  onPress?: () => void;
  children?: React.ReactNode;
}

/** Expand/collapse row used for Profile's Account and Help & Support sections. */
export function AccordionRow({ icon, label, onPress, children }: AccordionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isNavigable = !!onPress;

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.row}
        onPress={isNavigable ? onPress : () => setExpanded((e) => !e)}
        accessibilityRole="button"
        accessibilityState={isNavigable ? undefined : { expanded }}
      >
        <Ionicons name={icon} size={18} color={colors.textPrimary} />
        <Text style={styles.label}>{label}</Text>
        <Ionicons
          name={isNavigable ? "chevron-forward" : expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>
      {!isNavigable && expanded && children ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    marginBottom: spacing.sm + 2,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  label: {
    flex: 1,
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});

export default AccordionRow;
