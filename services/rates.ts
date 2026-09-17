/**
 * Rate estimation. Tries the backend's real pricing endpoint first; falls
 * back to a simple illustrative formula in __DEV__ so the Rate Calculator
 * screen has something to show before a backend exists.
 */
import { api } from "./api";
import type { RateEstimate, RateRequest } from "@/types/rate";

export async function calculateRate(payload: RateRequest): Promise<RateEstimate> {
  try {
    return await api.post<RateEstimate>("/rates/calculate", payload);
  } catch (error) {
    if (__DEV__) {
      console.log("[rates] API unavailable, using an illustrative estimate:", (error as Error).message);
      const isInter = payload.shipmentType === "international";
      const base = isInter ? 25 : 8;
      const perKg = isInter ? 4.5 : 0.85;
      const amount = base + perKg * Math.max(payload.weightKg, 0.5);
      return {
        amount: Math.round(amount * 100) / 100,
        currency: "USD",
        deliveryTimeLabel: isInter ? "5 - 8 Working Days" : "2 - 3 Working Days",
        serviceType: "Standard",
      };
    }
    throw error;
  }
}
