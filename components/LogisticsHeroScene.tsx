import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { colors, radius, shadow, spacing, typography } from "@constants/theme";

/**
 * Animated logistics hero scene depicting active Singapore Roadway Logistics & Freight Corridor.
 * Lightweight, high performance, looping smoothly across iOS, Android, and Web.
 */
export function LogisticsHeroScene() {
  const progress = useRef(new Animated.Value(0)).current;
  const pulseWest = useRef(new Animated.Value(1)).current;
  const pulseEast = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Loop roadway truck transit animation
    const transitAnimation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 4000,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      })
    );

    // 2. Jurong West pulse
    const westPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseWest, {
          toValue: 1.6,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseWest, {
          toValue: 1,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Changi East pulse
    const eastPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseEast, {
          toValue: 1.6,
          duration: 1200,
          delay: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseEast, {
          toValue: 1,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // 4. Floating label subtle movement
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    transitAnimation.start();
    westPulse.start();
    eastPulse.start();
    floatLoop.start();

    return () => {
      transitAnimation.stop();
      westPulse.stop();
      eastPulse.stop();
      floatLoop.stop();
    };
  }, [progress, pulseWest, pulseEast, floatAnim]);

  // Interpolated position along bezier curve Q 150 125
  const vehicleX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [24, 140, 246],
  });

  const vehicleY = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [50, 105, 52],
  });

  const vehicleOpacity = progress.interpolate({
    inputRange: [0, 0.08, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View style={styles.card}>
      <View style={styles.sceneContainer}>
        {/* SVG Curved Expressway Route Background */}
        <Svg height="160" width="100%" viewBox="0 0 300 160" style={styles.svg}>
          <Defs>
            <LinearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.9" />
              <Stop offset="50%" stopColor={colors.gold} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors.navy} stopOpacity="0.9" />
            </LinearGradient>
          </Defs>

          {/* Soft Glow Track */}
          <Path
            d="M 36,65 Q 150,125 264,67"
            fill="none"
            stroke="rgba(201, 106, 50, 0.2)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Dashed Expressway Track */}
          <Path
            d="M 36,65 Q 150,125 264,67"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3.5"
            strokeDasharray="6, 5"
            strokeLinecap="round"
          />
        </Svg>

        {/* Jurong West Logistics Hub */}
        <View style={[styles.node, { left: 14, top: 40 }]}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseWest }],
                opacity: pulseWest.interpolate({ inputRange: [1, 1.6], outputRange: [0.5, 0] }),
              },
            ]}
          />
          <View style={[styles.pinDot, { backgroundColor: colors.primary }]}>
            <Text style={styles.flagText}>🇸🇬</Text>
          </View>
          <Animated.View style={[styles.labelBadge, { transform: [{ translateY: floatAnim }] }]}>
            <Text style={styles.labelText}>Jurong Hub</Text>
            <Text style={styles.subText}>West Singapore</Text>
          </Animated.View>
        </View>

        {/* Changi East Freight Hub */}
        <View style={[styles.node, { right: 14, top: 42 }]}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseEast }],
                opacity: pulseEast.interpolate({ inputRange: [1, 1.6], outputRange: [0.5, 0] }),
              },
            ]}
          />
          <View style={[styles.pinDot, { backgroundColor: colors.gold }]}>
            <Text style={styles.flagText}>🇸🇬</Text>
          </View>
          <Animated.View style={[styles.labelBadge, { transform: [{ translateY: floatAnim }] }]}>
            <Text style={styles.labelText}>Changi Hub</Text>
            <Text style={styles.subText}>East Singapore</Text>
          </Animated.View>
        </View>

        {/* Moving Express Delivery Truck */}
        <Animated.View
          style={[
            styles.movingVehicle,
            {
              transform: [{ translateX: vehicleX }, { translateY: vehicleY }],
              opacity: vehicleOpacity,
            },
          ]}
        >
          <View style={styles.vehicleBubble}>
            <MaterialCommunityIcons name="truck-fast" size={18} color={colors.white} />
          </View>
        </Animated.View>
      </View>

      {/* Live Expressway Corridor Tag */}
      <View style={styles.routeTag}>
        <View style={styles.greenPulseDot} />
        <Text style={styles.routeTagText}>⚡ Same-Day Express Roadways • 24/7 Live Tracking</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    overflow: "hidden",
    alignItems: "center",
    ...shadow.card,
  },
  sceneContainer: {
    width: "100%",
    height: 160,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  node: {
    position: "absolute",
    alignItems: "center",
    zIndex: 3,
  },
  pulseRing: {
    position: "absolute",
    top: -4,
    left: -4,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
  },
  pinDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
    ...shadow.card,
  },
  flagText: {
    fontSize: 16,
  },
  labelBadge: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    ...shadow.card,
  },
  labelText: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: 11,
    color: colors.textPrimary,
  },
  subText: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 9,
    color: colors.textSecondary,
  },
  movingVehicle: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 5,
  },
  vehicleBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  routeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  greenPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.success,
  },
  routeTagText: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: 11,
    color: colors.textSecondary,
  },
});
