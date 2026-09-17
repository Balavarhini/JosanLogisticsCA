/**
 * LiveTrackingMap — shows the driver's real-time position on a map
 * for the customer tracking screen.
 *
 * Architecture:
 *   - react-native-maps renders a live map on native (Android/iOS)
 *   - Driver marker updates in place as new location pings arrive
 *   - Destination marker shows the shipment's delivery point
 *   - A straight-line polyline connects driver → delivery
 *   - Status badge ("Connected" / "Polling" / "Offline") shown in the overlay
 *
 * Props:
 *   tripId     — the backend trip ID for Socket.IO room
 *   shipmentId — used for HTTP polling fallback
 *   destinationLat / destinationLng — delivery coordinates
 */
import React, { useEffect, useRef, useMemo } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import MapViewWrapper, { Marker, Polyline, PROVIDER_GOOGLE } from "@/components/MapViewWrapper";
import { colors, spacing, typography, radius } from "@constants/theme";
import { useDriverTracking } from "@/hooks/useDriverTracking";

const SG_CENTER = {
  latitude: 1.3521,
  longitude: 103.8198,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

interface LiveTrackingMapProps {
  tripId?: string | null;
  shipmentId?: string | null;
  destinationLat?: number | null;
  destinationLng?: number | null;
  height?: number;
}

export function LiveTrackingMap({
  tripId,
  shipmentId,
  destinationLat,
  destinationLng,
  height = 240,
}: LiveTrackingMapProps) {
  const { driverLocation, isConnected, isPolling } = useDriverTracking(tripId, shipmentId);

  // Pulse animation for the driver marker to indicate live position
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!driverLocation) return;
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.3, duration: 200, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [driverLocation?.latitude, driverLocation?.longitude]);

  const region = useMemo(() => {
    const dLat = driverLocation?.latitude;
    const dLng = driverLocation?.longitude;

    if (dLat && dLng && destinationLat && destinationLng) {
      const minLat = Math.min(dLat, destinationLat);
      const maxLat = Math.max(dLat, destinationLat);
      const minLng = Math.min(dLng, destinationLng);
      const maxLng = Math.max(dLng, destinationLng);

      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(0.02, (maxLat - minLat) * 1.6),
        longitudeDelta: Math.max(0.02, (maxLng - minLng) * 1.6),
      };
    }

    if (dLat && dLng) {
      return { latitude: dLat, longitude: dLng, latitudeDelta: 0.04, longitudeDelta: 0.04 };
    }

    return SG_CENTER;
  }, [driverLocation?.latitude, driverLocation?.longitude, destinationLat, destinationLng]);

  const driverCoord = driverLocation
    ? { latitude: driverLocation.latitude, longitude: driverLocation.longitude }
    : null;

  const destCoord =
    destinationLat && destinationLng
      ? { latitude: destinationLat, longitude: destinationLng }
      : null;

  const statusColor = isConnected
    ? colors.success
    : isPolling
    ? colors.warning
    : colors.textMuted;

  const statusLabel = isConnected
    ? "● Live"
    : isPolling
    ? "⟳ Polling"
    : "○ Connecting…";

  return (
    <View style={[styles.container, { height }]}>
      <MapViewWrapper
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        region={region}
        scrollEnabled
        zoomEnabled
      >
        {/* Driver position marker */}
        {driverCoord ? (
          <Marker
            coordinate={driverCoord}
            title="Your Driver"
            pinColor={colors.primary}
          >
            <View style={styles.driverMarker}>
              <Animated.View style={[styles.driverDot, { transform: [{ scale: pulse }] }]} />
            </View>
          </Marker>
        ) : null}

        {/* Delivery destination marker */}
        {destCoord ? (
          <Marker coordinate={destCoord} title="Delivery Address" pinColor={colors.info} />
        ) : null}

        {/* Straight-line route overlay */}
        {driverCoord && destCoord ? (
          <Polyline
            coordinates={[driverCoord, destCoord]}
            strokeColor={colors.primary}
            strokeWidth={2.5}
          />
        ) : null}
      </MapViewWrapper>

      {/* Status badge overlay */}
      <View style={styles.statusBadge}>
        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
      </View>

      {/* "Waiting for driver" placeholder when no location yet */}
      {!driverLocation ? (
        <View style={styles.noLocationOverlay}>
          <Text style={styles.noLocationIcon}>🚚</Text>
          <Text style={styles.noLocationText}>Waiting for driver location…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    fontFamily: "Nunito_700Bold",
    fontWeight: "700",
  },
  driverMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  driverDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    borderWidth: 2.5,
    borderColor: "#fff",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  noLocationOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(247,248,250,0.88)",
    gap: spacing.xs,
  },
  noLocationIcon: {
    fontSize: 32,
  },
  noLocationText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
