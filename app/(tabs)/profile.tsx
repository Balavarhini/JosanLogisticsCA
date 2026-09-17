import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useShipmentList } from "@/hooks/useShipments";
import { useAddresses } from "@/hooks/useAddresses";
import { initialsFromName } from "@utils/format";
import { Header } from "@/components/Header";
import { AccordionRow } from "@/components/AccordionRow";
import { ConfirmationModal } from "@/components/ConfirmationModal";

/** Profile tab — elegant identity hero card, stats summary, Account section, Help & Support section, Logout. */
export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: shipments } = useShipmentList();
  const { data: addresses } = useAddresses();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const shipmentCount = shipments?.length ?? 0;
  const addressCount = addresses?.length ?? 0;

  return (
    <View style={styles.flex}>
      <Header
        variant="title"
        title="Profile"
        leftAction="none"
        rightElement={
          <Pressable
            onPress={() => router.push("/profile/edit")}
            accessibilityRole="button"
            accessibilityLabel="Edit Profile"
            style={styles.settingsButton}
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Elegant Hero Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initialsFromName(user?.name ?? "Customer")}</Text>
              </View>
              <Pressable
                style={styles.editBadge}
                onPress={() => router.push("/profile/edit")}
                hitSlop={4}
                accessibilityLabel="Edit picture"
              >
                <Ionicons name="pencil" size={12} color={colors.white} />
              </Pressable>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name ?? "Customer"}</Text>
              <View style={styles.detailRow}>
                <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.meta} numberOfLines={1}>
                  {user?.email ?? "—"}
                </Text>
              </View>
              {user?.phone ? (
                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.meta}>{user.phone}</Text>
                </View>
              ) : null}

              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
                <Text style={styles.badgeText}>Verified Customer</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats Bar inside Card */}
          <View style={styles.statsDivider} />
          <View style={styles.statsRow}>
            <Pressable style={styles.statBox} onPress={() => router.push("/(tabs)/shipments")}>
              <Text style={styles.statNumber}>{shipmentCount}</Text>
              <Text style={styles.statLabel}>Shipments</Text>
            </Pressable>

            <View style={styles.statSeparator} />

            <Pressable style={styles.statBox} onPress={() => router.push("/profile/addresses")}>
              <Text style={styles.statNumber}>{addressCount}</Text>
              <Text style={styles.statLabel}>Addresses</Text>
            </Pressable>

            <View style={styles.statSeparator} />

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>Gold</Text>
              <Text style={styles.statLabel}>Member Tier</Text>
            </View>
          </View>
        </View>

        {/* Account Menu */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.menuGroup}>
          <AccordionRow icon="person-outline" label="My Profile" onPress={() => router.push("/profile/edit")} />
          <AccordionRow icon="location-outline" label="Address Book" onPress={() => router.push("/profile/addresses")} />
          <AccordionRow
            icon="card-outline"
            label="Payment Method"
            onPress={() => router.push("/profile/payment-methods")}
          />
          <AccordionRow
            icon="key-outline"
            label="Change Password"
            onPress={() => router.push("/profile/change-password")}
          />
        </View>

        {/* Help & Support Menu */}
        <Text style={styles.sectionLabel}>Help & Support</Text>
        <View style={styles.menuGroup}>
          <AccordionRow icon="help-circle-outline" label="Help Centre" onPress={() => router.push("/(tabs)/support")} />
          <AccordionRow icon="person-circle-outline" label="Contact Us" onPress={() => router.push("/(tabs)/support")} />
          <AccordionRow icon="information-circle-outline" label="FAQs" onPress={() => router.push("/(tabs)/support")} />
        </View>

        {/* Log Out Action */}
        <Pressable
          style={styles.logoutButton}
          onPress={() => setConfirmingLogout(true)}
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>

      <ConfirmationModal
        visible={confirmingLogout}
        title="Log out?"
        message="You'll need to sign in again to view your shipments."
        confirmLabel="Log Out"
        destructive
        onConfirm={async () => {
          setConfirmingLogout(false);
          await logout();
        }}
        onCancel={() => setConfirmingLogout(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: radius.button,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: 22,
    color: colors.white,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.h3.fontSize,
    color: colors.textPrimary,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  meta: {
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  badgeText: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: 11,
    color: colors.primaryDark,
  },
  statsDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: 18,
    color: colors.navy,
  },
  statLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statSeparator: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.h3.fontSize,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  menuGroup: {
    gap: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.errorSoft,
  },
  logoutText: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.bodySmall.fontSize,
    color: colors.error,
  },
});

