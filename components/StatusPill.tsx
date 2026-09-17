import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, typography } from "@constants/theme";
import { ShipmentStatus } from "@/types/shipment";
import { getShipmentStatusPresentation } from "@utils/shipmentStatus";

interface StatusPillProps {
  status: ShipmentStatus;
}

/** Small colored pill showing a shipment status — used in shipment lists and cards. */
export function StatusPill({ status }: StatusPillProps) {
  const { label, color } = getShipmentStatusPresentation(status);
  return (
    <Text style={[styles.label, { color }]} accessibilityRole="text">
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.bodySmall.fontSize,
  },
});

export default StatusPill;

interface StatusBadgeProps {
  status: ShipmentStatus;
}

/** Pill-shaped badge variant (dot + soft background) for denser contexts. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, color, softColor } = getShipmentStatusPresentation(status);
  return (
    <View style={[badgeStyles.wrap, { backgroundColor: softColor }]} accessibilityLabel={`Status: ${label}`}>
      <View style={[badgeStyles.dot, { backgroundColor: color }]} />
      <Text style={[badgeStyles.text, { color }]}>{label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.caption.fontSize },
});
