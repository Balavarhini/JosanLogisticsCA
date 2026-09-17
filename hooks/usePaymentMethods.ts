import { useCallback, useEffect, useState } from "react";
import * as paymentsService from "@services/payments";
import type { PaymentMethod } from "@/types/payment";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function usePaymentMethods() {
  const [state, setState] = useState<AsyncState<PaymentMethod[]>>({ data: null, isLoading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await paymentsService.getPaymentMethods();
      setState({ data, isLoading: false, error: null });
    } catch (e) {
      setState({
        data: null,
        isLoading: false,
        error: e instanceof Error ? e.message : "Failed to load payment methods.",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeMethod = useCallback(async (id: string) => {
    await paymentsService.deletePaymentMethod(id);
    setState((s) => ({ ...s, data: (s.data ?? []).filter((m) => m.id !== id) }));
  }, []);

  return { ...state, refresh: load, removeMethod };
}
