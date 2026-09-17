import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { Stepper } from "@/components/Stepper";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";

const STEPS = ["Details", "Package", "Review", "Payment", "Confirm"];
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CONFETTI_COLORS = ["#FF5252", "#FF4081", "#E040FB", "#7C4DFF", "#536DFE", "#448AFF", "#1DE9B6", "#00E676", "#FFD740", "#FF6D00"];

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  isCircle: boolean;
  animY: Animated.Value;
  animRotate: Animated.Value;
  animWobble: Animated.Value;
}

function ConfettiEffect() {
  const particles = useRef<Particle[]>(
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: Math.random() * 8 + 6,
      isCircle: Math.random() > 0.4,
      animY: new Animated.Value(-60 - Math.random() * 200),
      animRotate: new Animated.Value(0),
      animWobble: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p, index) => {
      const delay = (index % 12) * 100 + Math.random() * 150;
      const duration = 2400 + Math.random() * 1600;

      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(p.animY, {
              toValue: SCREEN_HEIGHT + 60,
              duration,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(p.animRotate, {
              toValue: 1,
              duration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(p.animWobble, {
                toValue: 24,
                duration: duration / 2,
                easing: Easing.sin,
                useNativeDriver: true,
              }),
              Animated.timing(p.animWobble, {
                toValue: -24,
                duration: duration / 2,
                easing: Easing.sin,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(p.animY, {
            toValue: -60,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [particles]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => {
        const spin = p.animRotate.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "720deg"],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                left: p.x,
                width: p.size,
                height: p.isCircle ? p.size : p.size * 1.5,
                borderRadius: p.isCircle ? p.size / 2 : 2,
                backgroundColor: p.color,
                transform: [{ translateY: p.animY }, { translateX: p.animWobble }, { rotate: spin }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

/** Book Shipment — Step 5: celebration success screen shown right after payment and shipment creation. */
export default function BookConfirmScreen() {
  const router = useRouter();
  const { trackingId, transactionId, paymentMethod, amountPaid } = useLocalSearchParams<{
    trackingId?: string;
    transactionId?: string;
    paymentMethod?: string;
    amountPaid?: string;
  }>();

  const scaleAnim = useRef(new Animated.Value(0.2)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim, floatAnim]);

  return (
    <View style={styles.flex}>
      <ConfettiEffect />
      <View style={styles.content}>
        <Stepper steps={STEPS} currentIndex={4} />

        <View style={styles.center}>
          <Animated.View style={[styles.badgeContainer, { transform: [{ scale: scaleAnim }, { translateY: floatAnim }] }]}>
            <View style={styles.outerGlow}>
              <View style={styles.partyPopperWrap}>
                <Ionicons name="checkmark-circle" size={56} color={colors.success} />
              </View>
            </View>
          </Animated.View>

          <Text style={styles.title}>Payment & Order Confirmed!</Text>
          <Text style={styles.subtitle}>Your PayPal payment was approved and shipment is booked.</Text>

          {trackingId ? (
            <View style={styles.trackingCard}>
              <Text style={styles.trackingLabel}>Tracking ID</Text>
              <Text style={styles.trackingValue}>{trackingId}</Text>
            </View>
          ) : null}

          {transactionId ? (
            <View style={styles.paymentSummaryCard}>
              <View style={styles.paypalSuccessHeader}>
                <Ionicons name="logo-paypal" size={20} color="#0070BA" />
                <Text style={styles.paypalSuccessTitle}>PayPal SG Payment Details</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Transaction Ref</Text>
                <Text style={styles.summaryValue}>{transactionId}</Text>
              </View>
              {paymentMethod ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Payment Method</Text>
                  <Text style={styles.summaryValue}>{paymentMethod}</Text>
                </View>
              ) : null}
              {amountPaid ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount Paid</Text>
                  <Text style={styles.summaryValueHighlight}>S$ {amountPaid}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <SecondaryButton
          label="Track Shipment"
          onPress={() =>
            trackingId
              ? router.replace({ pathname: "/shipment/[trackingId]", params: { trackingId } })
              : router.replace("/(tabs)/shipments")
          }
          style={styles.footerButton}
        />
        <PrimaryButton label="Done" onPress={() => router.replace("/(tabs)/home")} style={styles.footerButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.xs, paddingBottom: spacing.xxl },
  badgeContainer: { marginBottom: spacing.lg, alignItems: "center", justifyContent: "center" },
  outerGlow: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  partyPopperWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.h1.fontSize + 2,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  trackingCard: {
    marginTop: spacing.lg,
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  trackingLabel: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.caption.fontSize, color: colors.textSecondary },
  trackingValue: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.h3.fontSize, color: colors.primaryDark },
  paymentSummaryCard: {
    marginTop: spacing.md,
    width: "100%",
    backgroundColor: "#F4F7FA",
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#0070BA",
    gap: spacing.xs,
  },
  paypalSuccessHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: 4 },
  paypalSuccessTitle: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize, color: "#003087" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.caption.fontSize, color: colors.textSecondary },
  summaryValue: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.caption.fontSize, color: colors.textPrimary },
  summaryValueHighlight: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize, color: "#0070BA" },
  particle: { position: "absolute", top: 0 },
  footer: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  footerButton: { flex: 1 },
});
