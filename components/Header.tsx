import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { AppMenu } from "./AppMenu";

interface HeaderProps {
  /** "brand" shows the Josan logo lockup (Home tab); "title" shows plain centered text. */
  variant?: "brand" | "title";
  title?: string;
  /** "menu" opens the quick-nav AppMenu; "back" pops the current screen. Defaults based on variant. */
  leftAction?: "menu" | "back" | "none";
  rightElement?: React.ReactNode;
  onBack?: () => void;
}

/**
 * Shared top bar for every screen. Matches the two header styles seen in the
 * design: a branded lockup with hamburger + bell (Home/Shipments tabs), and a
 * plain back-button + title bar (Book Shipment, Rate Calculator, etc.).
 */
export function Header({ variant = "title", title, leftAction, rightElement, onBack }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const resolvedLeftAction = leftAction ?? (variant === "brand" ? "menu" : "back");

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={styles.row}>
      {resolvedLeftAction === "menu" ? (
        <Pressable
          onPress={() => setMenuOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          style={styles.iconButton}
          hitSlop={8}
        >
          <Ionicons name="menu" size={22} color={colors.textPrimary} />
        </Pressable>
      ) : resolvedLeftAction === "back" ? (
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.iconButton}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <View style={styles.iconButton} />
      )}

      {variant === "brand" ? (
        <View style={styles.brandWrap}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>J</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>
                JOSAN <Text style={styles.brandTitleAccent}>LOGISTICS</Text>
              </Text>
              <Text style={styles.brandTagline}>Delivering Trust, On Time, Every Time.</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      )}

      {rightElement ?? <View style={styles.iconButton} />}

      <AppMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.button,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.h3.fontSize,
    color: colors.textPrimary,
  },
  brandWrap: { flex: 1, alignItems: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  logoMark: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMarkText: { color: colors.white, fontFamily: typography.fontFamily.bodyExtraBold, fontSize: 14 },
  brandTitle: {
    fontFamily: typography.fontFamily.bodyExtraBold,
    fontSize: 15,
    letterSpacing: 0.5,
    color: colors.navy,
  },
  brandTitleAccent: { color: colors.primary },
  brandTagline: {
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: 9,
    color: colors.textSecondary,
  },
});

export default Header;
