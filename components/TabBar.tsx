import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { colors, shadow, spacing, typography } from "@constants/theme";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home",
  shipments: "cube",
  support: "headset",
  profile: "person",
};

const LABELS: Record<string, string> = {
  home: "Home",
  shipments: "Shipments",
  support: "Support",
  profile: "Profile",
};

/**
 * Custom 5-item tab bar: four real tabs (Home, Shipments, Support, Profile)
 * plus a raised center "Book" action that pushes the booking wizard rather
 * than switching tabs, matching the floating "+" button in the design.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const routes = state.routes;
  const half = Math.ceil(routes.length / 2);
  const firstHalf = routes.slice(0, half);
  const secondHalf = routes.slice(half);

  const renderItem = (route: (typeof routes)[number], index: number) => {
    const isFocused = state.index === index;
    const iconName = ICONS[route.name] ?? "ellipse";
    const label = LABELS[route.name] ?? route.name;
    const color = isFocused ? colors.primary : colors.textMuted;

    const onPress = () => {
      const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={label}
        style={styles.item}
        hitSlop={8}
      >
        <Ionicons name={iconName} size={22} color={color} />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.wrap}>
      {firstHalf.map((route: any, i: number) => renderItem(route, i))}

      <Pressable
        onPress={() => router.push("/book/details")}
        accessibilityRole="button"
        accessibilityLabel="Book a shipment"
        style={styles.centerItem}
        hitSlop={8}
      >
        <View style={styles.centerButton}>
          <Ionicons name="add" size={26} color={colors.white} />
        </View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Book</Text>
      </Pressable>

      {secondHalf.map((route: any, i: number) => renderItem(route, i + half))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  item: {
    alignItems: "center",
    gap: 4,
    minWidth: 56,
    paddingVertical: 4,
  },
  centerItem: {
    alignItems: "center",
    gap: 4,
    minWidth: 56,
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: colors.gold,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    ...shadow.floating,
  },
  label: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.caption.fontSize,
  },
});

export default TabBar;
