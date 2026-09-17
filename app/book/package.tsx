import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { useBooking } from "@/hooks/useBooking";
import { Header } from "@/components/Header";
import { Stepper } from "@/components/Stepper";
import { TextField } from "@/components/TextField";
import { Checkbox } from "@/components/Checkbox";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import type { CargoType, PackageType, Timeslot } from "@/types/shipment";

const STEPS = ["Details", "Package", "Review", "Payment", "Confirm"];

const PACKAGE_TYPES: { value: PackageType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "document", label: "Document", icon: "document-text-outline" },
  { value: "parcel", label: "Parcel", icon: "cube-outline" },
  { value: "box", label: "Box", icon: "archive-outline" },
  { value: "pallet", label: "Pallet", icon: "layers-outline" },
  { value: "fragile", label: "Fragile", icon: "alert-circle-outline" },
];

const CARGO_TYPES: { value: CargoType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "general", label: "General", icon: "cube-outline" },
  { value: "perishable", label: "Perishable", icon: "leaf-outline" },
  { value: "electronics", label: "Electronics", icon: "hardware-chip-outline" },
  { value: "heavy", label: "Heavy Cargo", icon: "construct-outline" },
  { value: "hazardous", label: "Hazardous", icon: "warning-outline" },
  { value: "express", label: "Express", icon: "flash-outline" },
];

const TIMESLOTS: { value: Timeslot; label: string; sublabel: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "morning", label: "Morning", sublabel: "09:00 - 12:00", icon: "sunny-outline" },
  { value: "afternoon", label: "Afternoon", sublabel: "12:00 - 16:00", icon: "partly-sunny-outline" },
  { value: "evening", label: "Evening", sublabel: "16:00 - 20:00", icon: "moon-outline" },
  { value: "anytime", label: "Full Day", sublabel: "Flexible", icon: "time-outline" },
];

/** Book Shipment — Step 2: package type, cargo type, dimensions, timeslot, weight, description, fragile flag. */
export default function BookPackageScreen() {
  const router = useRouter();
  const { draft, update } = useBooking();
  const [formError, setFormError] = useState<string | null>(null);

  const onNext = () => {
    if (!draft.packageType) {
      setFormError("Please select a package type.");
      return;
    }
    const weight = Number(draft.weightKg);
    if (!draft.weightKg.trim() || Number.isNaN(weight) || weight <= 0) {
      setFormError("Please enter a valid estimated weight.");
      return;
    }

    // Validate dimensions if any value is entered
    if (draft.length || draft.width || draft.height) {
      const l = Number(draft.length);
      const w = Number(draft.width);
      const h = Number(draft.height);
      if (Number.isNaN(l) || l <= 0 || Number.isNaN(w) || w <= 0 || Number.isNaN(h) || h <= 0) {
        setFormError("Please enter valid positive dimensions (L × W × H).");
        return;
      }
    }

    setFormError(null);
    router.push("/book/review");
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Header variant="title" title="Book Shipment" leftAction="back" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Stepper steps={STEPS} currentIndex={1} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Type</Text>
          <View style={styles.typeGrid}>
            {PACKAGE_TYPES.map((option) => {
              const selected = draft.packageType === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => update({ packageType: option.value })}
                  style={[styles.typeTile, selected && styles.typeTileSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Ionicons name={option.icon} size={20} color={selected ? colors.white : colors.primary} />
                  <Text style={[styles.typeTileLabel, selected && styles.typeTileLabelSelected]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cargo Type</Text>
          <View style={styles.typeGrid}>
            {CARGO_TYPES.map((option) => {
              const selected = draft.cargoType === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => update({ cargoType: option.value })}
                  style={[styles.typeTile, selected && styles.typeTileSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Ionicons name={option.icon} size={20} color={selected ? colors.white : colors.primary} />
                  <Text style={[styles.typeTileLabel, selected && styles.typeTileLabelSelected]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Dimensions (Optional)</Text>
            <View style={styles.unitToggle}>
              <Pressable
                onPress={() => update({ dimensionUnit: "cm" })}
                style={[styles.unitPill, draft.dimensionUnit === "cm" && styles.unitPillSelected]}
                accessibilityRole="button"
              >
                <Text style={[styles.unitText, draft.dimensionUnit === "cm" && styles.unitTextSelected]}>cm</Text>
              </Pressable>
              <Pressable
                onPress={() => update({ dimensionUnit: "inch" })}
                style={[styles.unitPill, draft.dimensionUnit === "inch" && styles.unitPillSelected]}
                accessibilityRole="button"
              >
                <Text style={[styles.unitText, draft.dimensionUnit === "inch" && styles.unitTextSelected]}>inch</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.dimRow}>
            <View style={styles.dimField}>
              <TextField
                label="Length"
                placeholder="L"
                keyboardType="decimal-pad"
                value={draft.length}
                onChangeText={(text) => update({ length: text })}
              />
            </View>
            <Text style={styles.dimSeparator}>×</Text>
            <View style={styles.dimField}>
              <TextField
                label="Width"
                placeholder="W"
                keyboardType="decimal-pad"
                value={draft.width}
                onChangeText={(text) => update({ width: text })}
              />
            </View>
            <Text style={styles.dimSeparator}>×</Text>
            <View style={styles.dimField}>
              <TextField
                label="Height"
                placeholder="H"
                keyboardType="decimal-pad"
                value={draft.height}
                onChangeText={(text) => update({ height: text })}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Timeslot</Text>
          <View style={styles.timeslotGrid}>
            {TIMESLOTS.map((slot) => {
              const selected = draft.timeslot === slot.value;
              return (
                <Pressable
                  key={slot.value}
                  onPress={() => update({ timeslot: slot.value })}
                  style={[styles.timeslotTile, selected && styles.timeslotTileSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Ionicons name={slot.icon} size={18} color={selected ? colors.white : colors.primary} />
                  <View style={styles.timeslotTextWrap}>
                    <Text style={[styles.timeslotLabel, selected && styles.timeslotLabelSelected]}>{slot.label}</Text>
                    <Text style={[styles.timeslotSublabel, selected && styles.timeslotSublabelSelected]}>{slot.sublabel}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <TextField
            label="Estimated Weight (kg)"
            icon="scale-outline"
            placeholder="e.g. 2.5"
            keyboardType="decimal-pad"
            value={draft.weightKg}
            onChangeText={(text) => update({ weightKg: text })}
          />
        </View>

        <View style={styles.section}>
          <TextField
            label="Description (optional)"
            icon="create-outline"
            placeholder="What are you shipping?"
            value={draft.description}
            onChangeText={(text) => update({ description: text })}
            multiline
            numberOfLines={3}
            style={styles.multiline}
          />
        </View>

        <Checkbox
          label="This package is fragile and needs careful handling"
          checked={draft.fragile}
          onChange={(value) => update({ fragile: value })}
        />

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <SecondaryButton label="Back" onPress={() => router.back()} style={styles.footerButton} />
        <PrimaryButton label="Next" onPress={onNext} style={styles.footerButton} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  section: { gap: spacing.sm },
  sectionTitle: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.h3.fontSize, color: colors.textPrimary },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  unitToggle: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.button,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitPill: { paddingVertical: 4, paddingHorizontal: spacing.sm + 2, borderRadius: radius.button - 2 },
  unitPillSelected: { backgroundColor: colors.primary },
  unitText: { fontFamily: typography.fontFamily.bodyBold, fontSize: 12, color: colors.textSecondary },
  unitTextSelected: { color: colors.white },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  typeTile: {
    flexBasis: "31%",
    flexGrow: 1,
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.card,
  },
  typeTileSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  typeTileLabel: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.caption.fontSize, color: colors.textPrimary },
  typeTileLabelSelected: { color: colors.white },
  dimRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  dimField: { flex: 1 },
  dimSeparator: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.md,
    alignSelf: "center",
  },
  timeslotGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  timeslotTile: {
    flexBasis: "47%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.sm + 2,
    backgroundColor: colors.card,
  },
  timeslotTileSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  timeslotTextWrap: { flex: 1 },
  timeslotLabel: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.caption.fontSize, color: colors.textPrimary },
  timeslotLabelSelected: { color: colors.white },
  timeslotSublabel: { fontFamily: typography.fontFamily.bodyRegular, fontSize: 11, color: colors.textMuted },
  timeslotSublabelSelected: { color: colors.primarySoft },
  multiline: { height: 72, textAlignVertical: "top", paddingTop: spacing.sm },
  formError: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.error },
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
