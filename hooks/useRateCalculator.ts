import { useCallback, useState } from "react";
import * as ratesService from "@services/rates";
import type { RateEstimate, RateRequest } from "@/types/rate";

export function useRateCalculator() {
  const [estimate, setEstimate] = useState<RateEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async (payload: RateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ratesService.calculateRate(payload);
      setEstimate(result);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't calculate a rate. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { estimate, isLoading, error, calculate };
}
