import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { useShipmentList, useTrackShipment } from "@/hooks/useShipments";
import { getShipmentStatusPresentation } from "@utils/shipmentStatus";
import { formatDateTime } from "@utils/format";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { ShipmentCard } from "@/components/ShipmentCard";
import { SecondaryButton } from "@/components/SecondaryButton";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import type { Shipment } from "@/types/shipment";

/** Shipments tab — search any tracking ID, see its live timeline, and browse recent shipments. */
export default function ShipmentsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { data: shipments, isLoading, error, refresh } = useShipmentList();
  const { data: searchResult, isLoading: searching, error: searchError, search } = useTrackShipment();

  const mostRecent = useMemo(() => shipments?.[0] ?? null, [shipments]);
  const featured: Shipment | null = searchResult ?? mostRecent;

  const onSearch = () => {
    if (query.trim()) search(query.trim());
  };

  return (
    <View style={styles.flex}>
      <Header variant="title" title="Track Shipment" leftAction="menu" />

      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSearch}
            placeholder="Enter Tracking ID"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            returnKeyType="search"
          />
        </View>
        <Pressable style={styles.searchButton} onPress={onSearch} accessibilityRole="button" accessibilityLabel="Search">
          <Ionicons name="search" size={18} color={colors.white} />
        </Pressable>
      </View>

      <FlatList
        data={shipments ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Recent Tracking</Text>

            {searching ? (
              <LoadingState message="Searching…" />
            ) : searchError ? (
              <ErrorState message={searchError} />
            ) : featured ? (
              <>
                <Card style={styles.timelineCard}>
                  {featured.events
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

                <Card style={styles.summaryCard} flat>
                  <Text style={styles.summaryTrackingId}>{featured.trackingId}</Text>
                  <View style={styles.summaryRouteRow}>
                    <Text style={styles.summaryRouteText}>{featured.pickup.city}</Text>
                    <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
                    <Text style={styles.summaryRouteText}>{featured.delivery.city}</Text>
                  </View>
                  <Text style={styles.summaryEta}>Estimated: {formatDateTime(featured.estimatedDelivery).split(",")[0]}</Text>
                </Card>

                <SecondaryButton
                  label="View Details"
                  onPress={() => router.push({ pathname: "/shipment/[trackingId]", params: { trackingId: featured.trackingId } })}
                />
              </>
            ) : null}

            <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Your Shipments</Text>
          </View>
        }
        renderItem={({ item }) => <ShipmentCard shipment={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm + 2 }} />}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState message="Loading shipments…" />
          ) : error ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : (
            <EmptyState icon="cube-outline" title="No shipments yet" description="Book a shipment to start tracking it here." />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 50,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textPrimary,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: radius.input,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.h3.fontSize,
    color: colors.textPrimary,
  },
  timelineCard: { gap: spacing.md },
  eventRow: { flexDirection: "row", gap: spacing.sm + 2 },
  eventIconColumn: { alignItems: "center" },
  eventDot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  eventLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 4, minHeight: 24 },
  eventBody: { flex: 1, paddingBottom: spacing.sm },
  eventLabel: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize },
  eventMeta: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.caption.fontSize, color: colors.textSecondary },
  summaryCard: { gap: 4 },
  summaryTrackingId: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodyMedium.fontSize, color: colors.textPrimary },
  summaryRouteRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryRouteText: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.textSecondary },
  summaryEta: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.caption.fontSize, color: colors.textMuted },
});
