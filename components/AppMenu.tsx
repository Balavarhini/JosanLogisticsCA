import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";

interface AppMenuProps {
  visible: boolean;
  onClose: () => void;
}

const LINKS: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { label: "Home", icon: "home-outline", route: "/(tabs)/home" },
  { label: "My Shipments", icon: "cube-outline", route: "/(tabs)/shipments" },
  { label: "Book a Shipment", icon: "add-circle-outline", route: "/book/details" },
  { label: "Rate Calculator", icon: "calculator-outline", route: "/rate-calculator" },
  { label: "Address Book", icon: "location-outline", route: "/profile/addresses" },
  { label: "Support", icon: "help-buoy-outline", route: "/(tabs)/support" },
  { label: "Profile", icon: "person-outline", route: "/(tabs)/profile" },
];

/** Slide-down quick-navigation menu opened from the hamburger icon in the app header. */
export function AppMenu({ visible, onClose }: AppMenuProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const go = (route: string) => {
    onClose();
    router.push(route as never);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Menu</Text>
          {LINKS.map((link) => (
            <Pressable key={link.route} style={styles.row} onPress={() => go(link.route)} accessibilityRole="button">
              <Ionicons name={link.icon} size={20} color={colors.textPrimary} />
              <Text style={styles.rowLabel}>{link.label}</Text>
            </Pressable>
          ))}
          <View style={styles.divider} />
          <Pressable
            style={styles.row}
            onPress={async () => {
              onClose();
              await logout();
            }}
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.rowLabel, { color: colors.error }]}>Log Out</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-start" },
  sheet: {
    marginTop: 90,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.h3.fontSize,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
  },
  rowLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textPrimary,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});

export default AppMenu;
