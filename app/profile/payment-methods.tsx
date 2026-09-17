import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@constants/theme";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import type { PaymentMethod, PaymentMethodType } from "@/types/payment";

const TYPE_ICON: Record<PaymentMethodType, keyof typeof Ionicons.glyphMap> = {
  card: "card-outline",
  upi: "phone-portrait-outline",
  wallet: "wallet-outline",
};

/** Payment Methods — list saved cards/UPI/wallets and remove any of them. */
export default function PaymentMethodsScreen() {
  const { data: methods, isLoading, error, refresh, removeMethod } = usePaymentMethods();
  const [pendingDelete, setPendingDelete] = useState<PaymentMethod | null>(null);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await removeMethod(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <View style={styles.flex}>
      <Header variant="title" title="Payment Methods" leftAction="back" />
      <FlatList
        data={methods ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name={TYPE_ICON[item.type]} size={18} color={colors.primaryDark} />
            </View>
            <View style={styles.body}>
              <Text style={styles.label}>{item.label}</Text>
              {item.last4 ? (
                <Text style={styles.meta}>
                  •••• {item.last4}
                  {item.expiry ? `  ·  Exp ${item.expiry}` : ""}
                </Text>
              ) : null}
              {item.isDefault ? <Text style={styles.defaultTag}>Default</Text> : null}
            </View>
            <Pressable onPress={() => setPendingDelete(item)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove">
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </Pressable>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm + 2 }} />}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState message="Loading payment methods…" />
          ) : error ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : (
            <EmptyState icon="card-outline" title="No payment methods" description="Add a card, UPI, or wallet to speed up checkout." />
          )
        }
      />

      <ConfirmationModal
        visible={!!pendingDelete}
        title="Remove payment method?"
        message={pendingDelete ? `Remove "${pendingDelete.label}" from your account?` : undefined}
        confirmLabel="Remove"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  card: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 2 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.button,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  label: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.bodySmall.fontSize, color: colors.textPrimary },
  meta: { fontFamily: typography.fontFamily.bodyRegular, fontSize: typography.caption.fontSize, color: colors.textSecondary },
  defaultTag: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.caption.fontSize, color: colors.primary, marginTop: 2 },
});
