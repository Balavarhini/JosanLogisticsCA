import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@constants/theme";
import { useTrackShipment } from "@/hooks/useShipments";
import { getShipmentStatusPresentation } from "@utils/shipmentStatus";
import { formatCurrency, formatDate, formatDateTime } from "@utils/format";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { AddressCard } from "@/components/AddressCard";
import { StatusBadge } from "@/components/StatusPill";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
const PACKAGE_TYPE_LABEL: Record<string, string> = {
  document: "Document",
  parcel: "Parcel",
  box: "Box",
  pallet: "Pallet",
  fragile: "Fragile",
};

/** Full shipment tracking + details view — the destination of every "View Details" action. */
export default function ShipmentDetailsScreen() {
  const { trackingId } = useLocalSearchParams<{ trackingId: string }>();
  const { data: shipment, isLoading, error, search } = useTrackShipment();

  useEffect(() => {
    if (trackingId) search(trackingId);
    // Re-runs only when the route's trackingId param actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingId]);

  return (
    <View style={styles.flex}>
      <Header variant="title" title="Shipment Details" leftAction="back" />
      {isLoading ? (
        <LoadingState message="Loading shipment…" />
      ) : error || !shipment ? (
        <ErrorState message={error ?? "Shipment not found."} onRetry={() => trackingId && search(trackingId)} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.headerCard}>
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text style={styles.trackingId}>{shipment.trackingId}</Text>
                <Text style={styles.eta}>Estimated Delivery: {formatDate(shipment.estimatedDelivery)}</Text>
              </View>
              <StatusBadge status={shipment.status} />
            </View>
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tracking Timeline</Text>
            <Card style={styles.timelineCard}>
              {shipment.events
                .slice()
                .reverse()
                .map((event, index, arr) => {
                  const presentation = getShipmentStatusPresentation(event.status);
                  const isLast = index === arr.length - 1;
                  return (
                    <View key={`${event.status}-${event.timestamp}`} style={styles.eventRow}>
                      <View style={styles.eventIconColumn}>
                        <View style={[styles.eventDot, { backgroundColor: presentation.softColor }]}>
                          <Ionicons name={presentation.icon} size={14} color={presentation.color} />
                        </View>
                        {!isLast ? <View style={styles.eventLine} /> : null}
                      </View>
                      <View style={styles.eventBody}>
                        <Text style={[styles.eventLabel, { color: index === 0 ? presentation.color : colors.textPrimary }]}>
                          {presentation.label}
                        </Text>
                        <Text style={styles.eventMeta}>{formatDateTime(event.timestamp)}</Text>
                        <Text style={styles.eventMeta}>{event.location}</Text>
                      </View>
                    </View>
                  );
                })}
            </Card>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Address</Text>
            <AddressCard address={shipment.pickup} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <AddressCard address={shipment.delivery} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Package Details</Text>
            <Card style={styles.detailsCard} flat>
              <DetailRow
                icon="swap-horizontal-outline"
                label="Shipment Type"
                value={shipment.shipmentType === "domestic" ? "Domestic" : "International"}
              />
              <DetailRow icon="cube-outline" label="Package Type" value={PACKAGE_TYPE_LABEL[shipment.packageType]} />
              <DetailRow icon="scale-outline" label="Weight" value={`${shipment.weightKg} kg`} />
              {shipment.description ? <DetailRow icon="create-outline" label="Description" value={shipment.description} /> : null}
              {shipment.rateAmount !== undefined ? (
                <DetailRow icon="cash-outline" label="Charges" value={formatCurrency(shipment.rateAmount, shipment.currency)} />
              ) : null}
            </Card>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} style={styles.detailIcon} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  headerCard: {},
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.sm },
  headerText: { flex: 1, gap: 2 },
  trackingId: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.h3.fontSize, color: colors.textPrimary },
  eta: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.caption.fontSize, color: colors.textMuted },
  section: { gap: spacing.sm },
  sectionTitle: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.h3.fontSize, color: colors.textPrimary },
  timelineCard: { gap: spacing.md },
  eventRow: { flexDirection: "row", gap: spacing.sm + 2 },
  eventIconColumn: { alignItems: "center" },
  eventDot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  eventLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 4, minHeight: 24 },
  eventBody: { flex: 1, paddingBottom: spacing.sm },
  eventLabel: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize },
  eventMeta: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.caption.fontSize, color: colors.textSecondary },
  detailsCard: { gap: spacing.sm },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  detailIcon: { marginTop: 2 },
  detailLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    width: 110,
  },
  detailValue: {
    flex: 1,
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textPrimary,
  },
});
