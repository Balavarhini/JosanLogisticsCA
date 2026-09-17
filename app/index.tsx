import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { PrimaryButton } from "@/components/PrimaryButton";

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "shield-checkmark", label: "Safe & Secure\nDeliveries" },
  { icon: "time", label: "On Time\nEvery Time" },
  { icon: "cube", label: "Real-time\nTracking" },
];

/** Onboarding / splash screen — logo image, hero art, and the "Get Started" entry point. */
export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Brand logo image */}
      <View style={styles.logoWrap}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.featureRow}>
        {FEATURES.map((f, i) => (
          <React.Fragment key={f.label}>
            <View style={styles.feature}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon} size={18} color={colors.primary} />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
            {i < FEATURES.length - 1 ? <View style={styles.featureDivider} /> : null}
          </React.Fragment>
        ))}
      </View>

      <View style={styles.spacer} />

      <PrimaryButton label="Get Started" variant="dark" onPress={() => router.push("/(auth)/login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: "center",
  },
  logoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logo: {
    width: 300,
    height: 300,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    width: "100%",
  },
  feature: { flex: 1, alignItems: "center", gap: spacing.xs },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: "center",
  },
  featureDivider: { width: 1, backgroundColor: colors.border, alignSelf: "stretch", marginTop: 4 },
  spacer: { flex: 0.2 },
});
