import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "@constants/theme";

export const PROVIDER_GOOGLE = "google";

export function Marker(_props: { coordinate?: any; title?: string; pinColor?: string; children?: React.ReactNode }) {
  return null;
}

export function Polyline(_props: { coordinates?: any[]; strokeColor?: string; strokeWidth?: number }) {
  return null;
}

export default function MapView({ style }: { style?: any; children?: React.ReactNode; [key: string]: any }) {
  return (
    <View style={[styles.webMapContainer, style]}>
      <View style={styles.content}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.title}>Live Map</Text>
        <Text style={styles.subtitle}>
          Live driver tracking is displayed on Android / iOS native apps.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webMapContainer: {
    backgroundColor: colors.surface ?? "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  content: {
    alignItems: "center",
    gap: spacing.xs,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: typography.bodyMedium?.fontSize ?? 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.caption?.fontSize ?? 12,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 300,
  },
});
