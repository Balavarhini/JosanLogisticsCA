import { useCallback, useEffect, useState } from "react";
import * as addressesService from "@services/addresses";
import type { Address } from "@/types/address";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useAddresses() {
  const [state, setState] = useState<AsyncState<Address[]>>({ data: null, isLoading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await addressesService.getAddresses();
      setState({ data, isLoading: false, error: null });
    } catch (e) {
      setState({ data: null, isLoading: false, error: e instanceof Error ? e.message : "Failed to load addresses." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addAddress = useCallback(
    async (payload: Omit<Address, "id">) => {
      const created = await addressesService.createAddress(payload);
      setState((s) => ({ ...s, data: [...(s.data ?? []), created] }));
      return created;
    },
    []
  );

  const editAddress = useCallback(async (id: string, payload: Omit<Address, "id">) => {
    const updated = await addressesService.updateAddress(id, payload);
    setState((s) => ({ ...s, data: (s.data ?? []).map((a) => (a.id === id ? updated : a)) }));
    return updated;
  }, []);

  const removeAddress = useCallback(async (id: string) => {
    await addressesService.deleteAddress(id);
    setState((s) => ({ ...s, data: (s.data ?? []).filter((a) => a.id !== id) }));
  }, []);

  return { ...state, refresh: load, addAddress, editAddress, removeAddress };
}
