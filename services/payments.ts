import { api } from "./api";
import { MOCK_PAYMENT_METHODS } from "./mockData";
import type { PaymentMethod } from "@/types/payment";

async function withDevFallback<T>(request: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (__DEV__) {
      console.log("[payments] API unavailable, using local sample data:", (error as Error).message);
      return fallback();
    }
    throw error;
  }
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return withDevFallback(
    () => api.get<PaymentMethod[]>("/payment-methods"),
    () => MOCK_PAYMENT_METHODS
  );
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await api.delete(`/payment-methods/${id}`);
}
