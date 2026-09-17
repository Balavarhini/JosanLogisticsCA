import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { colors, radius, shadow, spacing } from "@constants/theme";

interface CardProps extends ViewProps {
  flat?: boolean;
}

/** Generic elevated surface used as the base for every *Card component. */
export function Card({ style, flat, children, ...rest }: CardProps) {
  return (
    <View style={[styles.base, flat ? styles.flat : shadow.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  flat: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default Card;
