import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { colors, spacing, typography } from "@constants/theme";
import { useRateCalculator } from "@/hooks/useRateCalculator";
import { formatCurrency } from "@utils/format";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { TextField } from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LoadingState } from "@/components/LoadingState";

/** Rate Calculator — estimate delivery charges from route and weight. */
export default function RateCalculatorScreen() {
  const { estimate, isLoading, error, calculate } = useRateCalculator();
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const onCalculate = () => {
    const weight = Number(weightKg);
    if (!fromLocation.trim() || !toLocation.trim()) {
      setFormError("Please enter both a from and to location.");
      return;
    }
    if (!weightKg.trim() || Number.isNaN(weight) || weight <= 0) {
      setFormError("Please enter a valid weight.");
      return;
    }
    setFormError(null);
    calculate({ fromLocation: fromLocation.trim(), toLocation: toLocation.trim(), weightKg: weight });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Header variant="title" title="Rate Calculator" leftAction="back" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField label="From Location" icon="location-outline" placeholder="e.g. Chennai" value={fromLocation} onChangeText={setFromLocation} />
        <TextField label="To Location" icon="navigate-outline" placeholder="e.g. Bangalore" value={toLocation} onChangeText={setToLocation} />
        <TextField
          label="Weight (kg)"
          icon="scale-outline"
          placeholder="e.g. 2.5"
          keyboardType="decimal-pad"
          value={weightKg}
          onChangeText={setWeightKg}
        />

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <PrimaryButton label="Calculate Rate" onPress={onCalculate} loading={isLoading} style={styles.calculateButton} />

        {isLoading ? (
          <LoadingState message="Calculating…" />
        ) : error ? (
          <Text style={styles.formError}>{error}</Text>
        ) : estimate ? (
          <Card style={styles.resultCard}>
            <Text style={styles.resultLabel}>Estimated Charges</Text>
            <Text style={styles.resultAmount}>{formatCurrency(estimate.amount, estimate.currency)}</Text>
            <Text style={styles.resultMeta}>
              {estimate.serviceType} · {estimate.deliveryTimeLabel}
            </Text>
          </Card>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  formError: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.error },
  calculateButton: { marginTop: spacing.sm },
  resultCard: { alignItems: "center", gap: 4, marginTop: spacing.sm },
  resultLabel: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.bodySmall.fontSize, color: colors.textSecondary },
  resultAmount: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.metric.fontSize, color: colors.primary },
  resultMeta: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.textSecondary },
});
