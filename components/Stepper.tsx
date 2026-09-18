import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, typography } from "@constants/theme";

interface StepperProps {
  steps: string[];
  currentIndex: number;
}

/** 4-step numbered progress header used on the Book Shipment wizard (Details/Package/Review/Confirm). */
export function Stepper({ steps, currentIndex }: StepperProps) {
  return (
    <View style={styles.row}>
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        const isLast = index === steps.length - 1;
        return (
          <View key={step} style={styles.stepWrap}>
            <View style={styles.circleRow}>
              <View style={[styles.circle, isDone && styles.circleDone, isActive && styles.circleActive]}>
                <Text style={[styles.circleText, (isDone || isActive) && styles.circleTextActive]}>{index + 1}</Text>
              </View>
              {!isLast ? <View style={[styles.connector, isDone && styles.connectorDone]} /> : null}
            </View>
            <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]} numberOfLines={1}>
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start" },
  stepWrap: { flex: 1, alignItems: "center" },
  circleRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -15,
    backgroundColor: colors.card,
  },
  circleDone: { backgroundColor: colors.gold, borderColor: colors.gold },
  circleActive: { backgroundColor: colors.primary, borderColor: colors.gold, borderWidth: 2 },
  circleText: { fontFamily: typography.fontFamily.bodyBold, fontSize: 13, color: colors.textMuted },
  circleTextActive: { color: colors.white },
  connector: { flex: 1, height: 2, backgroundColor: colors.border },
  connectorDone: { backgroundColor: colors.gold },
  stepLabel: {
    marginTop: 6,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    textAlign: "center",
  },
  stepLabelActive: { color: colors.textPrimary, fontFamily: typography.fontFamily.bodyBold },
});

export default Stepper;
