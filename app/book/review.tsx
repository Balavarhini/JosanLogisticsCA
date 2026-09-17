import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@constants/theme";
import { useBooking } from "@/hooks/useBooking";
import { useRateCalculator } from "@/hooks/useRateCalculator";
import { useCreateShipment } from "@/hooks/useShipments";
import { formatCurrency } from "@utils/format";
import { ApiRequestError } from "@/types/api";
import { Header } from "@/components/Header";
import { Stepper } from "@/components/Stepper";
import { Card } from "@/components/Card";
import { AddressCard } from "@/components/AddressCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { LoadingState } from "@/components/LoadingState";

const STEPS = ["Details", "Package", "Review", "Payment", "Confirm"];

const PACKAGE_TYPE_LABEL: Record<string, string> = {
  document: "Document",
  parcel: "Parcel",
  box: "Box",
  pallet: "Pallet",
  fragile: "Fragile",
};

const CARGO_TYPE_LABEL: Record<string, string> = {
  general: "General",
  perishable: "Perishable",
  electronics: "Electronics",
  heavy: "Heavy Cargo",
  hazardous: "Hazardous",
  express: "Express",
};

const TIMESLOT_LABEL: Record<string, string> = {
  morning: "Morning (09:00 - 12:00)",
  afternoon: "Afternoon (12:00 - 16:00)",
  evening: "Evening (16:00 - 20:00)",
  anytime: "Full Day (Flexible)",
};

/** Book Shipment — Step 3: read-only summary, a rate estimate, and proceed to PayPal payment. */
export default function BookReviewScreen() {
  const router = useRouter();
  const { draft } = useBooking();
  const { estimate, isLoading: isEstimating, error: estimateError, calculate } = useRateCalculator();

  useEffect(() => {
    if (draft.pickup && draft.delivery && draft.weightKg) {
      calculate({
        fromLocation: draft.pickup.city,
        toLocation: draft.delivery.city,
        weightKg: Number(draft.weightKg) || 0,
        shipmentType: draft.shipmentType,
      });
    }
    // Only ever needs to run once when the review screen mounts with a complete draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onProceedToPayment = () => {
    if (!draft.pickup || !draft.delivery || !draft.packageType) return;
    const amount = estimate ? estimate.amount : 45;
    router.push({
      pathname: "/book/payment",
      params: { amount: amount.toString() },
    });
  };

  if (!draft.pickup || !draft.delivery || !draft.packageType) {
    return (
      <View style={styles.flex}>
        <Header variant="title" title="Book Shipment" leftAction="back" />
        <View style={styles.missingWrap}>
          <Text style={styles.missingText}>Some details are missing. Please start again from Step 1.</Text>
          <SecondaryButton label="Back to Details" onPress={() => router.replace("/book/details")} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Header variant="title" title="Book Shipment" leftAction="back" />
      <ScrollView contentContainerStyle={styles.content}>
        <Stepper steps={STEPS} currentIndex={2} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PickUp Location</Text>
          <AddressCard address={draft.pickup} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Location</Text>
          <AddressCard address={draft.delivery} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Details</Text>
          <Card style={styles.detailsCard} flat>
            <DetailRow icon="cube-outline" label="Package Type" value={PACKAGE_TYPE_LABEL[draft.packageType]} />
            <DetailRow icon="briefcase-outline" label="Cargo Type" value={CARGO_TYPE_LABEL[draft.cargoType] ?? "General"} />
            {draft.length && draft.width && draft.height ? (
              <DetailRow icon="resize-outline" label="Dimensions" value={`${draft.length} × ${draft.width} × ${draft.height} ${draft.dimensionUnit}`} />
            ) : null}
            <DetailRow icon="time-outline" label="Timeslot" value={TIMESLOT_LABEL[draft.timeslot] ?? "Full Day"} />
            <DetailRow icon="scale-outline" label="Weight" value={`${draft.weightKg} kg`} />
            {draft.description ? <DetailRow icon="create-outline" label="Description" value={draft.description} /> : null}
            <DetailRow icon="alert-circle-outline" label="Fragile" value={draft.fragile ? "Yes" : "No"} />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimated Charges</Text>
          {isEstimating ? (
            <LoadingState message="Calculating rate…" />
          ) : estimateError ? (
            <Text style={styles.formError}>{estimateError}</Text>
          ) : estimate ? (
            <Card style={styles.rateCard}>
              <Text style={styles.rateAmount}>{formatCurrency(estimate.amount, estimate.currency)}</Text>
              <Text style={styles.rateMeta}>{estimate.serviceType} · {estimate.deliveryTimeLabel}</Text>
            </Card>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <SecondaryButton label="Back" onPress={() => router.back()} style={styles.footerButton} />
        <PrimaryButton
          label="Proceed to Payment"
          onPress={onProceedToPayment}
          style={styles.footerButton}
        />
      </View>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} style={styles.detailIcon} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  section: { gap: spacing.sm },
  sectionTitle: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.h3.fontSize, color: colors.textPrimary },
  detailsCard: { gap: spacing.sm },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  detailIcon: { marginTop: 2 },
  detailLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    width: 110,
  },
  detailValue: {
    flex: 1,
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textPrimary,
  },
  rateCard: { alignItems: "center", gap: 2 },
  rateAmount: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.metric.fontSize, color: colors.primary },
  rateMeta: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.textSecondary },
  formError: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.error },
  missingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xl },
  missingText: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.textSecondary, textAlign: "center" },
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
