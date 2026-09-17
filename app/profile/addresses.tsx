import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { colors, spacing } from "@constants/theme";
import { useAddresses } from "@/hooks/useAddresses";
import { Header } from "@/components/Header";
import { AddressCard } from "@/components/AddressCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import type { Address } from "@/types/address";

/** Address Book — list saved addresses, add a new one, or edit/delete an existing one. */
export default function AddressBookScreen() {
  const router = useRouter();
  const { data: addresses, isLoading, error, refresh, removeAddress } = useAddresses();
  const [pendingDelete, setPendingDelete] = useState<Address | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await removeAddress(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <View style={styles.flex}>
      <Header variant="title" title="Address Book" leftAction="back" />
      <FlatList
        data={addresses ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            onEdit={() => router.push({ pathname: "/profile/add-address", params: { addressId: item.id } })}
            onDelete={() => setPendingDelete(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm + 2 }} />}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState message="Loading addresses…" />
          ) : error ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : (
            <EmptyState
              icon="location-outline"
              title="No saved addresses"
              description="Add an address to use it for pickups and deliveries."
            />
          )
        }
      />
      <View style={styles.footer}>
        <PrimaryButton label="Add New Address" onPress={() => router.push("/profile/add-address")} />
      </View>

      <ConfirmationModal
        visible={!!pendingDelete}
        title="Delete address?"
        message={pendingDelete ? `Remove "${pendingDelete.line1}" from your address book?` : undefined}
        confirmLabel="Delete"
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
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
});
