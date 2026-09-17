import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@constants/theme";
import { Card } from "./Card";
import { StatusPill } from "./StatusPill";
import { formatDate } from "@utils/format";
import type { Shipment } from "@/types/shipment";

interface ShipmentCardProps {
  shipment: Shipment;
}

/** Shipment summary row — used in the Home "Your Shipments" list and the Shipments tab. */
export function ShipmentCard({ shipment }: ShipmentCardProps) {
  const router = useRouter();
  const open = () => router.push({ pathname: "/shipment/[trackingId]", params: { trackingId: shipment.trackingId } });

  return (
    <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`Shipment ${shipment.trackingId}`}>
      <Card style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="cube" size={18} color={colors.primary} />
        </View>
        <View style={styles.body}>
          <Text style={styles.trackingId}>{shipment.trackingId}</Text>
          <View style={styles.routeRow}>
            <Text style={styles.routeText}>{shipment.pickup.city}</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
            <Text style={styles.routeText}>{shipment.delivery.city}</Text>
          </View>
          <Text style={styles.eta}>Estimated: {formatDate(shipment.estimatedDelivery)}</Text>
        </View>
        <StatusPill status={shipment.status} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm + 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 3 },
  trackingId: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.bodyMedium.fontSize,
    color: colors.textPrimary,
  },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  routeText: {
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  eta: {
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
});

export default ShipmentCard;
