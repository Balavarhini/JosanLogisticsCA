import type { Address } from "./address";

/**
 * The shipment lifecycle, oldest to newest. Mirrors the "Recent Tracking"
 * timeline in the design (Shipment Booked -> Out for Delivery -> In Transit
 * -> Delivered), plus Pending/Cancelled for the dashboard's shipment list.
 */
export enum ShipmentStatus {
  Pending = "pending",
  Booked = "booked",
  OutForDelivery = "out_for_delivery",
  InTransit = "in_transit",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

/** Ordered list used to render the tracking timeline. Terminal states are excluded. */
export const SHIPMENT_STATUS_FLOW: ShipmentStatus[] = [
  ShipmentStatus.Booked,
  ShipmentStatus.OutForDelivery,
  ShipmentStatus.InTransit,
  ShipmentStatus.Delivered,
];

export type ShipmentType = "domestic" | "international";

export type PackageType = "document" | "parcel" | "box" | "pallet" | "fragile";

export type CargoType = "general" | "perishable" | "electronics" | "heavy" | "hazardous" | "express";

export type Timeslot = "morning" | "afternoon" | "evening" | "anytime";

export type DimensionUnit = "cm" | "inch";

export interface ItemDimensions {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

export interface TrackingEvent {
  status: ShipmentStatus;
  timestamp: string;
  location: string;
}

export interface Shipment {
  id: string;
  trackingId: string;
  status: ShipmentStatus;
  pickup: Address;
  delivery: Address;
  shipmentType: ShipmentType;
  packageType: PackageType;
  cargoType?: CargoType;
  timeslot?: Timeslot;
  dimensions?: ItemDimensions;
  weightKg: number;
  description?: string;
  fragile?: boolean;
  estimatedDelivery: string;
  createdAt: string;
  events: TrackingEvent[];
  rateAmount?: number;
  currency?: string;
  paymentMethod?: string;
  paymentTransactionId?: string;
  paidAmount?: number;
}

export interface CreateShipmentRequest {
  pickupAddressId: string;
  deliveryAddressId: string;
  shipmentType: ShipmentType;
  packageType: PackageType;
  cargoType?: CargoType;
  timeslot?: Timeslot;
  dimensions?: ItemDimensions;
  weightKg: number;
  description?: string;
  fragile?: boolean;
  paymentMethod?: string;
  paymentTransactionId?: string;
  paidAmount?: number;
}
