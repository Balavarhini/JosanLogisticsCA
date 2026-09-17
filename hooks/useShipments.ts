import { useCallback, useEffect, useState } from "react";
import * as shipmentsService from "@services/shipments";
import type { CreateShipmentRequest, Shipment } from "@/types/shipment";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useShipmentList() {
  const [state, setState] = useState<AsyncState<Shipment[]>>({ data: null, isLoading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await shipmentsService.getShipments();
      setState({ data, isLoading: false, error: null });
    } catch (e) {
      setState({ data: null, isLoading: false, error: e instanceof Error ? e.message : "Failed to load shipments." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}

export function useShipment(id: string | undefined) {
  const [state, setState] = useState<AsyncState<Shipment>>({ data: null, isLoading: true, error: null });

  const load = useCallback(async () => {
    if (!id) return;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await shipmentsService.getShipmentById(id);
      setState({ data, isLoading: false, error: null });
    } catch (e) {
      setState({ data: null, isLoading: false, error: e instanceof Error ? e.message : "Failed to load shipment." });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}

/** Look up a shipment by tracking ID — used by the Track Shipment search bar. */
export function useTrackShipment() {
  const [state, setState] = useState<AsyncState<Shipment>>({ data: null, isLoading: false, error: null });

  const search = useCallback(async (trackingId: string) => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const data = await shipmentsService.getShipmentByTrackingId(trackingId);
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : "No shipment found for that tracking ID.";
      setState({ data: null, isLoading: false, error: message });
      return null;
    }
  }, []);

  return { ...state, search };
}

export function useCreateShipment() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const create = useCallback(async (payload: CreateShipmentRequest) => {
    setIsSubmitting(true);
    try {
      return await shipmentsService.createShipment(payload);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { create, isSubmitting };
}
