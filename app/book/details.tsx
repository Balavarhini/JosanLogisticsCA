import React, { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { useBooking } from "@/hooks/useBooking";
import { useAddresses } from "@/hooks/useAddresses";
import { Header } from "@/components/Header";
import { Stepper } from "@/components/Stepper";
import { AddressCard } from "@/components/AddressCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import type { Address } from "@/types/address";

const STEPS = ["Details", "Package", "Review", "Payment", "Confirm"];

/** Book Shipment — Step 1: choose pickup/delivery addresses. */
export default function BookDetailsScreen() {
  const router = useRouter();
  const { draft, update } = useBooking();
  const { data: addresses, isLoading, error, refresh } = useAddresses();
  const [pickerTarget, setPickerTarget] = useState<"pickup" | "delivery" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Picks up any address added via Address Book while this screen was backgrounded.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const selectAddress = (address: Address) => {
    if (pickerTarget === "pickup") update({ pickup: address });
    else if (pickerTarget === "delivery") update({ delivery: address });
    setPickerTarget(null);
  };

  const onNext = () => {
    if (!draft.pickup || !draft.delivery) {
      setFormError("Please select both a pickup and delivery address.");
      return;
    }
    if (draft.pickup.id === draft.delivery.id) {
      setFormError("Pickup and delivery addresses must be different.");
      return;
    }
    setFormError(null);
    router.push("/book/package");
  };

  return (
    <View style={styles.flex}>
      <Header variant="title" title="Book Shipment" leftAction="back" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Stepper steps={STEPS} currentIndex={0} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PickUp Location</Text>
          {draft.pickup ? (
            <AddressCard address={draft.pickup} onChange={() => setPickerTarget("pickup")} />
          ) : (
            <Pressable style={styles.addAddressCard} onPress={() => setPickerTarget("pickup")} accessibilityRole="button">
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.addAddressText}>Select pickup address</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Location</Text>
          {draft.delivery ? (
            <AddressCard address={draft.delivery} onChange={() => setPickerTarget("delivery")} />
          ) : (
            <Pressable style={styles.addAddressCard} onPress={() => setPickerTarget("delivery")} accessibilityRole="button">
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.addAddressText}>Select delivery address</Text>
            </Pressable>
          )}
        </View>

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Next" onPress={onNext} />
      </View>

      <Modal visible={pickerTarget !== null} transparent animationType="slide" onRequestClose={() => setPickerTarget(null)}>
        <Pressable style={styles.overlay} onPress={() => setPickerTarget(null)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select {pickerTarget === "pickup" ? "Pickup" : "Delivery"} Address</Text>
              <Pressable onPress={() => setPickerTarget(null)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={styles.sheetList} contentContainerStyle={{ gap: spacing.sm }}>
              {isLoading ? (
                <LoadingState message="Loading addresses…" />
              ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
              ) : !addresses || addresses.length === 0 ? (
                <EmptyState icon="location-outline" title="No saved addresses" description="Add an address to use it here." />
              ) : (
                addresses.map((address) => (
                  <Pressable key={address.id} onPress={() => selectAddress(address)} accessibilityRole="button">
                    <AddressCard address={address} />
                  </Pressable>
                ))
              )}
            </ScrollView>
            <PrimaryButton
              label="Add New Address"
              variant="dark"
              onPress={() => {
                setPickerTarget(null);
                router.push("/profile/add-address");
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  section: { gap: spacing.sm },
  sectionTitle: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.h3.fontSize, color: colors.textPrimary },
  addAddressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radius.card,
    padding: spacing.md,
  },
  addAddressText: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize, color: colors.primary },
  formError: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.error },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    padding: spacing.lg,
    maxHeight: "80%",
    gap: spacing.md,
  },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.h3.fontSize, color: colors.textPrimary },
  sheetList: { flexGrow: 0 },
});
