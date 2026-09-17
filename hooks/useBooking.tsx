/**
 * Shared state for the 4-step Book Shipment wizard (Details -> Package ->
 * Review -> Confirm). Scoped to app/book/_layout.tsx so each step screen is
 * its own route (clean back-navigation, deep-linkable) while sharing one
 * in-progress draft via context instead of passing everything through
 * router params.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Address } from "@/types/address";
import type { CargoType, DimensionUnit, PackageType, ShipmentType, Timeslot } from "@/types/shipment";

export interface BookingDraft {
  pickup: Address | null;
  delivery: Address | null;
  shipmentType: ShipmentType;
  packageType: PackageType | null;
  cargoType: CargoType;
  timeslot: Timeslot;
  dimensionUnit: DimensionUnit;
  length: string;
  width: string;
  height: string;
  weightKg: string;
  description: string;
  fragile: boolean;
}

const INITIAL_DRAFT: BookingDraft = {
  pickup: null,
  delivery: null,
  shipmentType: "domestic",
  packageType: null,
  cargoType: "general",
  timeslot: "anytime",
  dimensionUnit: "cm",
  length: "",
  width: "",
  height: "",
  weightKg: "",
  description: "",
  fragile: false,
};

interface BookingContextValue {
  draft: BookingDraft;
  update: (patch: Partial<BookingDraft>) => void;
  reset: () => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft>(INITIAL_DRAFT);

  const update = useCallback((patch: Partial<BookingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => setDraft(INITIAL_DRAFT), []);

  const value = useMemo(() => ({ draft, update, reset }), [draft, update, reset]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within a BookingProvider");
  return ctx;
}
