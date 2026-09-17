import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { useBooking } from "@/hooks/useBooking";
import { useCreateShipment } from "@/hooks/useShipments";
import { formatCurrency } from "@utils/format";
import { ApiRequestError } from "@/types/api";
import { Header } from "@/components/Header";
import { Stepper } from "@/components/Stepper";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { TextField } from "@/components/TextField";
import { LoadingState } from "@/components/LoadingState";

const STEPS = ["Details", "Package", "Review", "Payment", "Confirm"];

type PaymentOption = "paypal_account" | "paypal_card";

export default function BookPaymentScreen() {
  const router = useRouter();
  const { amount: rawAmount } = useLocalSearchParams<{ amount?: string }>();
  const { draft, reset } = useBooking();
  const { create, isSubmitting } = useCreateShipment();

  const baseAmount = Number(rawAmount) || 45;
  const gstAmount = Math.round(baseAmount * 0.09 * 100) / 100;
  const totalAmountSgd = baseAmount + gstAmount;

  const [selectedMethod, setSelectedMethod] = useState<PaymentOption>("paypal_account");
  const [paypalEmail, setPaypalEmail] = useState("user.sg@example.com");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  const [isProcessingModalVisible, setIsProcessingModalVisible] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("Connecting to PayPal Gateway…");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onProcessPayment = async () => {
    if (!draft.pickup || !draft.delivery || !draft.packageType) return;
    setErrorMsg(null);
    setIsProcessingModalVisible(true);
    setProcessingStep("Connecting to PayPal Singapore Gateway…");

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessingStep("Authorizing SGD Payment (S$ " + totalAmountSgd.toFixed(2) + ")…");

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProcessingStep("Finalizing Shipment Order…");

      const dimensionsPayload =
        draft.length && draft.width && draft.height
          ? {
              length: Number(draft.length),
              width: Number(draft.width),
              height: Number(draft.height),
              unit: draft.dimensionUnit,
            }
          : undefined;

      const txId = `PAYID-SG-${Math.floor(10000000 + Math.random() * 90000000)}`;

      const shipment = await create({
        pickupAddressId: draft.pickup.id,
        deliveryAddressId: draft.delivery.id,
        shipmentType: draft.shipmentType,
        packageType: draft.packageType,
        cargoType: draft.cargoType,
        timeslot: draft.timeslot,
        dimensions: dimensionsPayload,
        weightKg: Number(draft.weightKg) || 0,
        description: draft.description.trim() || undefined,
        fragile: draft.fragile,
        paymentMethod: selectedMethod === "paypal_account" ? "PayPal SG Express" : "PayPal Credit/Debit Card",
        paymentTransactionId: txId,
        paidAmount: totalAmountSgd,
      });

      setIsProcessingModalVisible(false);
      reset();

      router.replace({
        pathname: "/book/confirm",
        params: {
          trackingId: shipment.trackingId,
          transactionId: txId,
          paymentMethod: selectedMethod === "paypal_account" ? "PayPal Singapore Account" : "PayPal SG Card Processing",
          amountPaid: totalAmountSgd.toFixed(2),
        },
      });
    } catch (err) {
      setIsProcessingModalVisible(false);
      setErrorMsg(err instanceof ApiRequestError ? err.message : "PayPal payment authorization failed. Please try again.");
    }
  };

  if (!draft.pickup || !draft.delivery || !draft.packageType) {
    return (
      <View style={styles.flex}>
        <Header variant="title" title="Payment Gateway" leftAction="back" />
        <View style={styles.missingWrap}>
          <Text style={styles.missingText}>Booking details are incomplete. Please restart from Step 1.</Text>
          <SecondaryButton label="Back to Details" onPress={() => router.replace("/book/details")} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Header variant="title" title="PayPal Gateway" leftAction="back" />

      <ScrollView contentContainerStyle={styles.content}>
        <Stepper steps={STEPS} currentIndex={3} />

        {/* PayPal Singapore Branding Header */}
        <Card style={styles.paypalHeaderCard}>
          <View style={styles.paypalLogoRow}>
            <View style={styles.paypalBadge}>
              <Ionicons name="logo-paypal" size={32} color="#003087" />
              <View style={styles.paypalTitleWrap}>
                <Text style={styles.paypalTitle}>PayPal Singapore</Text>
                <Text style={styles.paypalSubtitle}>Fast, Secure & Protected Payment</Text>
              </View>
            </View>
            <View style={styles.flagBadge}>
              <Text style={styles.flagEmoji}>🇸🇬</Text>
              <Text style={styles.flagCode}>SGD</Text>
            </View>
          </View>

          <View style={styles.amountDivider} />

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Payable</Text>
            <Text style={styles.amountValue}>S$ {totalAmountSgd.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Fare & Tax Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Breakdown</Text>
          <Card style={styles.breakdownCard} flat>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Shipping Fee</Text>
              <Text style={styles.breakdownValue}>S$ {baseAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Singapore GST (9%)</Text>
              <Text style={styles.breakdownValue}>S$ {gstAmount.toFixed(2)}</Text>
            </View>
            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount (SGD)</Text>
              <Text style={styles.totalValue}>S$ {totalAmountSgd.toFixed(2)}</Text>
            </View>
          </Card>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select PayPal Payment Method</Text>

          {/* Option 1: PayPal Account */}
          <Pressable
            style={[styles.methodCard, selectedMethod === "paypal_account" && styles.methodCardSelected]}
            onPress={() => setSelectedMethod("paypal_account")}
          >
            <View style={styles.radioCircle}>
              {selectedMethod === "paypal_account" ? <View style={styles.radioDot} /> : null}
            </View>

            <Ionicons name="wallet-outline" size={24} color={selectedMethod === "paypal_account" ? "#0070BA" : colors.textSecondary} />

            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Pay with PayPal Account</Text>
              <Text style={styles.methodDesc}>Instant checkout using your PayPal SG balance or linked bank</Text>
            </View>
          </Pressable>

          {selectedMethod === "paypal_account" ? (
            <Card style={styles.methodDetailsCard} flat>
              <TextField
                label="PayPal Account Email"
                value={paypalEmail}
                onChangeText={setPaypalEmail}
                placeholder="user@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.protectionNotice}>
                <Ionicons name="shield-checkmark" size={18} color="#0070BA" />
                <Text style={styles.protectionText}>Eligible for PayPal Buyer Protection in Singapore.</Text>
              </View>
            </Card>
          ) : null}

          {/* Option 2: Credit / Debit Card via PayPal */}
          <Pressable
            style={[styles.methodCard, selectedMethod === "paypal_card" && styles.methodCardSelected]}
            onPress={() => setSelectedMethod("paypal_card")}
          >
            <View style={styles.radioCircle}>
              {selectedMethod === "paypal_card" ? <View style={styles.radioDot} /> : null}
            </View>

            <Ionicons name="card-outline" size={24} color={selectedMethod === "paypal_card" ? "#0070BA" : colors.textSecondary} />

            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Debit or Credit Card</Text>
              <Text style={styles.methodDesc}>Processed securely via PayPal Gateway (Visa, Mastercard, AMEX)</Text>
            </View>
          </Pressable>

          {selectedMethod === "paypal_card" ? (
            <Card style={styles.methodDetailsCard} flat>
              <TextField
                label="Cardholder Name"
                value={cardName}
                onChangeText={setCardName}
                placeholder="e.g. Tan Ah Kow"
              />
              <TextField
                label="Card Number"
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="4000 1234 5678 9010"
                keyboardType="numeric"
              />
              <View style={styles.cardRow}>
                <View style={styles.cardCol}>
                  <TextField
                    label="Expiry Date"
                    value={cardExpiry}
                    onChangeText={setCardExpiry}
                    placeholder="MM/YY"
                  />
                </View>
                <View style={styles.cardCol}>
                  <TextField
                    label="CVV / CVC"
                    value={cardCvc}
                    onChangeText={setCardCvc}
                    placeholder="123"
                    keyboardType="numeric"
                    secureTextEntry
                  />
                </View>
              </View>
            </Card>
          ) : null}
        </View>

        {errorMsg ? <Text style={styles.formError}>{errorMsg}</Text> : null}

        {/* Security Trust Badges */}
        <View style={styles.securityTrust}>
          <View style={styles.trustItem}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.trustText}>256-bit SSL Encrypted</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.trustText}>PayPal SG Verified</Text>
          </View>
        </View>
      </ScrollView>

      {/* Processing Modal */}
      <Modal visible={isProcessingModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <LoadingState message={processingStep} />
            <Text style={styles.modalNote}>Please do not close or navigate away during PayPal processing.</Text>
          </Card>
        </View>
      </Modal>

      <View style={styles.footer}>
        <SecondaryButton label="Back" onPress={() => router.back()} style={styles.footerButton} disabled={isSubmitting} />
        <PrimaryButton
          label={`Pay S$ ${totalAmountSgd.toFixed(2)} with PayPal`}
          onPress={onProcessPayment}
          loading={isSubmitting}
          style={styles.footerButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  paypalHeaderCard: {
    backgroundColor: "#F4F7FA",
    borderWidth: 1.5,
    borderColor: "#0070BA",
    borderRadius: radius.card,
    padding: spacing.md + 4,
    gap: spacing.sm,
  },
  paypalLogoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  paypalBadge: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  paypalTitleWrap: { gap: 1 },
  paypalTitle: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.h3.fontSize, color: "#003087" },
  paypalSubtitle: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.caption.fontSize, color: colors.textSecondary },
  flagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6F0FA",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  flagEmoji: { fontSize: 16 },
  flagCode: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.caption.fontSize, color: "#003087" },
  amountDivider: { height: 1, backgroundColor: "#D1E2F2", marginVertical: 4 },
  amountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  amountLabel: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.bodySmall.fontSize, color: colors.textSecondary },
  amountValue: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.h2.fontSize, color: "#0070BA" },
  section: { gap: spacing.sm },
  sectionTitle: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.h3.fontSize, color: colors.textPrimary },
  breakdownCard: { gap: spacing.xs + 2 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  breakdownLabel: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.textSecondary },
  breakdownValue: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  totalRow: { paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4 },
  totalLabel: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  totalValue: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.h3.fontSize, color: colors.primary },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  methodCardSelected: { borderColor: "#0070BA", backgroundColor: "#F4F7FA" },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#0070BA" },
  methodInfo: { flex: 1, gap: 2 },
  methodTitle: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  methodDesc: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.caption.fontSize, color: colors.textSecondary },
  methodDetailsCard: { gap: spacing.sm, marginTop: -spacing.xs, borderColor: "#0070BA" },
  protectionNotice: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingTop: 4 },
  protectionText: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.caption.fontSize, color: "#0070BA" },
  cardRow: { flexDirection: "row", gap: spacing.sm },
  cardCol: { flex: 1 },
  formError: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.error, textAlign: "center" },
  securityTrust: { flexDirection: "row", justifyContent: "center", gap: spacing.lg, paddingVertical: spacing.xs },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  trustText: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.caption.fontSize, color: colors.textSecondary },
  missingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xl },
  missingText: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.textSecondary, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: spacing.xl },
  modalCard: { width: "100%", padding: spacing.xl, alignItems: "center", gap: spacing.md },
  modalNote: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.caption.fontSize, color: colors.textSecondary, textAlign: "center" },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  footerButton: { flex: 1 },
});
