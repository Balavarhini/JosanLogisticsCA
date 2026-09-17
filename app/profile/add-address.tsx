import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, spacing, typography } from "@constants/theme";
import { useAddresses } from "@/hooks/useAddresses";
import { ApiRequestError } from "@/types/api";
import { Header } from "@/components/Header";
import { TextField } from "@/components/TextField";
import { Checkbox } from "@/components/Checkbox";
import { PrimaryButton } from "@/components/PrimaryButton";
import type { AddressLabel } from "@/types/address";

const LABELS: { value: AddressLabel; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "other", label: "Other" },
];

/** Add or edit an address — reused for both flows via the optional `addressId` param. */
export default function AddOrEditAddressScreen() {
  const router = useRouter();
  const { addressId } = useLocalSearchParams<{ addressId?: string }>();
  const { data: addresses, addAddress, editAddress } = useAddresses();
  const isEditing = !!addressId;
  const existing = addresses?.find((a) => a.id === addressId);

  const [label, setLabel] = useState<AddressLabel>("home");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [isDefault, setIsDefault] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existing) {
      setLabel(existing.label);
      setContactName(existing.contactName);
      setContactEmail(existing.contactEmail ?? "");
      setContactPhone(existing.contactPhone ?? "");
      setLine1(existing.line1);
      setLine2(existing.line2 ?? "");
      setCity(existing.city);
      setRegion(existing.state);
      setPostalCode(existing.postalCode);
      setCountry(existing.country);
      setIsDefault(!!existing.isDefault);
    }
  }, [existing]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!contactName.trim()) errors.contactName = "Enter a contact name.";
    if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      errors.contactEmail = "Enter a valid email address.";
    }
    if (!line1.trim()) errors.line1 = "Enter the address line.";
    if (!city.trim()) errors.city = "Enter a city.";
    if (!region.trim()) errors.region = "Enter a state.";
    if (!postalCode.trim()) errors.postalCode = "Enter a postal code.";
    if (!country.trim()) errors.country = "Enter a country.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSave = async () => {
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      label,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      line1: line1.trim(),
      line2: line2.trim() || undefined,
      city: city.trim(),
      state: region.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      isDefault,
    };
    try {
      if (isEditing && addressId) {
        await editAddress(addressId, payload);
      } else {
        await addAddress(payload);
      }
      router.back();
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Couldn't save this address. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Header variant="title" title={isEditing ? "Edit Address" : "Add New Address"} leftAction="back" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Label</Text>
          <View style={styles.labelRow}>
            {LABELS.map((option) => {
              const selected = label === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setLabel(option.value)}
                  style={[styles.labelPill, selected && styles.labelPillSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.labelPillText, selected && styles.labelPillTextSelected]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <TextField label="Contact Name" icon="person-outline" value={contactName} onChangeText={setContactName} error={fieldErrors.contactName} />
        <TextField
          label="Contact Email (optional)"
          icon="mail-outline"
          value={contactEmail}
          onChangeText={setContactEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={fieldErrors.contactEmail}
        />
        <TextField label="Contact Phone" icon="call-outline" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
        <TextField label="Address Line 1" icon="location-outline" value={line1} onChangeText={setLine1} error={fieldErrors.line1} />
        <TextField label="Address Line 2 (optional)" icon="location-outline" value={line2} onChangeText={setLine2} />
        <TextField label="City" icon="business-outline" value={city} onChangeText={setCity} error={fieldErrors.city} />
        <TextField label="State" icon="map-outline" value={region} onChangeText={setRegion} error={fieldErrors.region} />
        <TextField
          label="Postal Code"
          icon="mail-open-outline"
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="number-pad"
          error={fieldErrors.postalCode}
        />
        <TextField label="Country" icon="flag-outline" value={country} onChangeText={setCountry} error={fieldErrors.country} />

        <Checkbox label="Set as default address" checked={isDefault} onChange={setIsDefault} />

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <PrimaryButton
          label={isEditing ? "Save Changes" : "Add Address"}
          onPress={onSave}
          loading={submitting}
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  section: { gap: spacing.sm },
  sectionLabel: { fontFamily: typography.fontFamily.bodyBold, fontSize: 14, color: colors.textPrimary },
  labelRow: { flexDirection: "row", gap: spacing.sm },
  labelPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  labelPillSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  labelPillText: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  labelPillTextSelected: { color: colors.primaryDark },
  formError: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.bodySmall.fontSize, color: colors.error },
  saveButton: { marginTop: spacing.sm },
});
