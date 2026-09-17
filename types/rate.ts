import type { ShipmentType } from "./shipment";

export interface RateRequest {
  fromLocation: string;
  toLocation: string;
  weightKg: number;
  shipmentType?: ShipmentType;
}

export interface RateEstimate {
  amount: number;
  currency: string;
  deliveryTimeLabel: string;
  serviceType: string;
}
