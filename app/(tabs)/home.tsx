import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, spacing, typography } from "@constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { LogisticsHeroScene } from "@/components/LogisticsHeroScene";

/**
 * Minimal & Modern Home Dashboard — featuring an animated Singapore roadway
 * logistics scene, personalized customer greeting, catching hero messaging,
 * and a single "Book a Shipment" CTA.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Screen entrance fade animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Button press spring scale
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [bellRinging, setBellRinging] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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

  const handleNotificationPress = () => {
    setBellRinging(true);
    setTimeout(() => setBellRinging(false), 1200);
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
            onPress={handleNotificationPress}
            hitSlop={8}
          >
            <Ionicons
              name={bellRinging ? "notifications" : "notifications-outline"}
              size={22}
              color={bellRinging ? colors.primary : colors.textPrimary}
            />
            {bellRinging && <View style={styles.bellBadge} />}
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.mainWrap, { opacity: fadeAnim }]}>
          {/* Animated Hero Logistics Scene */}
          <LogisticsHeroScene />

          {/* Hero Wording & Greeting */}
          <View style={styles.heroTextWrap}>
            <Text style={styles.userGreeting}>Welcome back, {user?.name?.split(" ")[0] ?? "Partner"} 👋</Text>
            <Text style={styles.heroTitle}>Seamless Deliveries, Delivered Fast</Text>
            <Text style={styles.heroSubtitle}>
              Singapore&apos;s most trusted roadway logistics network, right at your fingertips.
            </Text>
          </View>

          {/* Single Primary CTA Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              style={styles.ctaButton}
              onPressIn={onPressInButton}
              onPressOut={onPressOutButton}
              onPress={handleBookShipment}
              accessibilityRole="button"
              accessibilityLabel="Book a Shipment"
            >
              <Text style={styles.ctaButtonText}>Book a Shipment</Text>
              <View style={styles.ctaIconCircle}>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </View>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>
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
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
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
});
