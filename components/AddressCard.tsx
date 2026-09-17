import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { Card } from "./Card";
import type { Address } from "@/types/address";

interface AddressCardProps {
  address: Address;
  onChange?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const LABEL_ICON: Record<Address["label"], keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  work: "briefcase-outline",
  other: "location-outline",
};

/** Pickup/Delivery address summary card, with an optional "Change" link (Book Shipment) or edit/delete (Address Book). */
export function AddressCard({ address, onChange, onEdit, onDelete }: AddressCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={LABEL_ICON[address.label]} size={18} color={colors.primaryDark} />
      </View>
      <View style={styles.body}>
        <Text style={styles.line} numberOfLines={2}>
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}
        </Text>
        <Text style={styles.line}>
          {address.city} - {address.postalCode}
        </Text>
        <Text style={styles.subLine}>
          {address.state}, {address.country}
        </Text>
        {address.contactName || address.contactPhone || address.contactEmail ? (
          <Text style={styles.subLine}>
            {[address.contactName, address.contactPhone, address.contactEmail].filter(Boolean).join(" • ")}
          </Text>
        ) : null}
      </View>
      {onChange ? (
        <Pressable onPress={onChange} hitSlop={8} accessibilityRole="button">
          <Text style={styles.action}>Change</Text>
        </Pressable>
      ) : null}
      {onEdit ? (
        <Pressable onPress={onEdit} hitSlop={8} accessibilityRole="button" style={styles.iconAction}>
          <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable onPress={onDelete} hitSlop={8} accessibilityRole="button" style={styles.iconAction}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm + 2 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.button,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  line: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textPrimary,
  },
  subLine: {
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  action: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.bodySmall.fontSize,
    color: colors.primary,
  },
  iconAction: { padding: 2 },
});

export default AddressCard;
