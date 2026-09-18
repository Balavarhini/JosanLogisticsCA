import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useShipmentList } from "@/hooks/useShipments";
import { useLanguage } from "@/hooks/useLanguage";
import { getArrivingTodayShipments, triggerDeliveryIntimationNotification } from "@/services/notifications";
import { Header } from "@/components/Header";
import { LogisticsHeroScene } from "@/components/LogisticsHeroScene";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";

/**
 * Minimal & Modern Home Dashboard — featuring an animated Singapore roadway
 * logistics scene, personalized customer greeting, Arriving Today parcel
 * intimation banner, and single "Book a Shipment" CTA.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: shipments } = useShipmentList();
  const { t } = useLanguage();

  const arrivingShipments = getArrivingTodayShipments(shipments ?? []);
  const activeArrivingParcel = arrivingShipments[0] ?? null;

  // Screen entrance fade animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Button press spring scale
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulsing animation for the Arriving Today live badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim, pulseAnim]);

  const onPressInButton = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOutButton = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleBookShipment = () => {
    router.push("/book/details");
  };

  const handleTriggerNotification = () => {
    if (activeArrivingParcel) {
      triggerDeliveryIntimationNotification(activeArrivingParcel.trackingId, activeArrivingParcel.delivery?.city);
    } else {
      triggerDeliveryIntimationNotification("JSN123456789IN", "Mumbai");
    }
  };

  return (
    <View style={styles.flex}>
      <Header
        variant="brand"
        rightElement={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={styles.bellButton}
            onPress={() => setNotificationsModalOpen(true)}
            hitSlop={8}
          >
            <Ionicons
              name={arrivingShipments.length > 0 ? "notifications" : "notifications-outline"}
              size={22}
              color={arrivingShipments.length > 0 ? colors.primary : colors.textPrimary}
            />
            {arrivingShipments.length > 0 && <View style={styles.bellBadge} />}
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.mainWrap, { opacity: fadeAnim }]}>
          {/* Compact Arriving Today Intimation Banner */}
          {activeArrivingParcel ? (
            <Card style={styles.arrivingCardCompact}>
              <View style={styles.arrivingCompactMain}>
                <View style={styles.arrivingLeftWrap}>
                  <View style={styles.arrivingTitleWrap}>
                    <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
                    <Text style={styles.arrivingBadgeText}>{t("parcelArrivingToday")}</Text>
                  </View>
                  <Text style={styles.arrivingCompactSub} numberOfLines={1}>
                    #{activeArrivingParcel.trackingId} • {activeArrivingParcel.delivery?.city ?? "Singapore"} ({t("by5pm")})
                  </Text>
                </View>

                <View style={styles.arrivingCompactActions}>
                  <Pressable
                    style={styles.trackButtonCompact}
                    onPress={() =>
                      router.push({
                        pathname: "/shipment/[trackingId]",
                        params: { trackingId: activeArrivingParcel.trackingId },
                      })
                    }
                  >
                    <Ionicons name="compass-outline" size={14} color={colors.white} />
                    <Text style={styles.trackButtonTextCompact}>{t("trackLiveDelivery")}</Text>
                  </Pressable>

                  <Pressable
                    style={styles.notifyButtonCompact}
                    onPress={handleTriggerNotification}
                    accessibilityLabel={t("intimateMe")}
                  >
                    <Ionicons name="notifications-outline" size={14} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            </Card>
          ) : null}

          {/* Animated Hero Logistics Scene */}
          <LogisticsHeroScene />

          {/* Hero Wording & Greeting */}
          <View style={styles.heroTextWrap}>
            <Text style={styles.userGreeting}>{t("welcomeUser")}, {user?.name?.split(" ")[0] ?? "Partner"} 👋</Text>
            <Text style={styles.heroTitle}>{t("heroTitle")}</Text>
            <Text style={styles.heroSubtitle}>{t("heroSubtitle")}</Text>
          </View>

          {/* Single Primary CTA Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              style={styles.ctaButton}
              onPressIn={onPressInButton}
              onPressOut={onPressOutButton}
              onPress={handleBookShipment}
              accessibilityRole="button"
              accessibilityLabel={t("bookShipment")}
            >
              <Text style={styles.ctaButtonText}>{t("bookShipment")}</Text>
              <View style={styles.ctaIconCircle}>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </View>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Interactive Delivery Notifications Modal */}
      <Modal visible={notificationsModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="notifications" size={22} color={colors.primary} />
                <Text style={styles.modalTitle}>{t("deliveryIntimations")}</Text>
              </View>
              <Pressable onPress={() => setNotificationsModalOpen(false)} hitSlop={8}>
                <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            {arrivingShipments.length > 0 ? (
              <View style={styles.modalBody}>
                {arrivingShipments.map((shipment) => (
                  <View key={shipment.id} style={styles.intimationItem}>
                    <View style={styles.intimationIcon}>
                      <Ionicons name="bicycle" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.intimationInfo}>
                      <Text style={styles.intimationTitle}>🚚 {t("outForDelivery")}</Text>
                      <Text style={styles.intimationDesc}>
                        Parcel #{shipment.trackingId} is scheduled to arrive at {shipment.delivery?.city} today.
                      </Text>
                      <Text style={styles.intimationMeta}>{t("by5pm")}</Text>
                    </View>
                  </View>
                ))}

                <PrimaryButton
                  label="Test Notification Intimation"
                  onPress={handleTriggerNotification}
                  style={{ marginTop: spacing.sm }}
                />
              </View>
            ) : (
              <View style={styles.emptyNotificationBox}>
                <Ionicons name="checkmark-circle-outline" size={36} color={colors.success} />
                <Text style={styles.emptyNotificationText}>{t("noUrgentDelivery")}</Text>
              </View>
            )}
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: radius.button,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
    justifyContent: "center",
  },
  mainWrap: {
    gap: spacing.md,
  },
  arrivingCardCompact: {
    backgroundColor: colors.cardWarm,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: radius.card,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm + 4,
    ...shadow.card,
  },
  arrivingCompactMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  arrivingLeftWrap: {
    flex: 1,
    gap: 1,
  },
  arrivingTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  arrivingBadgeText: {
    fontFamily: typography.fontFamily.bodyExtraBold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.primaryDark,
  },
  arrivingCompactSub: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 12,
    color: colors.textPrimary,
  },
  arrivingCompactActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trackButtonCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  trackButtonTextCompact: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: 11,
    color: colors.white,
  },
  notifyButtonCompact: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 6,
    borderRadius: radius.pill,
  },
  heroTextWrap: {
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    gap: 4,
    marginTop: spacing.xs,
  },
  userGreeting: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.bodySmall.fontSize,
    color: colors.primary,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  heroTitle: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.navy,
    textAlign: "center",
  },
  heroSubtitle: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: "88%",
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    ...shadow.floating,
  },
  ctaButtonText: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: 17,
    color: colors.white,
    letterSpacing: 0.3,
  },
  ctaIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: radius.card * 1.5,
    borderTopRightRadius: radius.card * 1.5,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.h2.fontSize,
    color: colors.textPrimary,
  },
  modalBody: {
    gap: spacing.sm,
  },
  intimationItem: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  intimationIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  intimationInfo: {
    flex: 1,
    gap: 2,
  },
  intimationTitle: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textPrimary,
  },
  intimationDesc: {
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  intimationMeta: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.caption.fontSize,
    color: colors.primary,
    marginTop: 2,
  },
  emptyNotificationBox: {
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyNotificationText: {
    fontFamily: typography.fontFamily.bodyRegular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

