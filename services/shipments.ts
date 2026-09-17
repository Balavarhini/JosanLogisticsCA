/**
 * All shipment data access goes through this file — screens never call the
 * API client directly. Every function tries the real backend first; if it's
 * unreachable (no backend configured yet) it falls back to local sample data
 * in __DEV__ only, so the app is fully browsable out of the box. Delete the
 * fallback branches once EXPO_PUBLIC_API_BASE_URL points at a live API.
 */
import { api } from "./api";
import { MOCK_ADDRESSES, MOCK_SHIPMENTS } from "./mockData";
import { ShipmentStatus } from "@/types/shipment";
import type { CreateShipmentRequest, Shipment } from "@/types/shipment";

async function withDevFallback<T>(request: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (__DEV__) {
      console.log("[shipments] API unavailable, using local sample data:", (error as Error).message);
      return fallback();
    }
    throw error;
  }
}

export async function getShipments(): Promise<Shipment[]> {
  return withDevFallback(
    () => api.get<Shipment[]>("/shipments"),
    () => MOCK_SHIPMENTS
  );
}

export async function getShipmentById(id: string): Promise<Shipment> {
  return withDevFallback(
    () => api.get<Shipment>(`/shipments/${id}`),
    () => {
      const shipment = MOCK_SHIPMENTS.find((s) => s.id === id);
      if (!shipment) throw new Error(`Shipment ${id} not found`);
      return shipment;
    }
  );
}

export async function getShipmentByTrackingId(trackingId: string): Promise<Shipment> {
  return withDevFallback(
    () => api.get<Shipment>(`/shipments/track/${trackingId}`),
    () => {
      const shipment = MOCK_SHIPMENTS.find((s) => s.trackingId.toLowerCase() === trackingId.trim().toLowerCase());
      if (!shipment) throw new Error(`No shipment found for tracking ID ${trackingId}`);
      return shipment;
    }
  );
}

export async function createShipment(payload: CreateShipmentRequest): Promise<Shipment> {
  return withDevFallback(
    () => api.post<Shipment>("/shipments", payload),
    () => {
      const pickup = MOCK_ADDRESSES.find((a) => a.id === payload.pickupAddressId) ?? MOCK_ADDRESSES[0];
      const delivery = MOCK_ADDRESSES.find((a) => a.id === payload.deliveryAddressId) ?? MOCK_ADDRESSES[1];
      const newShipment: Shipment = {
        id: `ship-${Date.now()}`,
        trackingId: `JOS${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: ShipmentStatus.Booked,
        pickup,
        delivery,
        shipmentType: payload.shipmentType,
        packageType: payload.packageType,
        cargoType: payload.cargoType,
        timeslot: payload.timeslot,
        dimensions: payload.dimensions,
        weightKg: payload.weightKg,
        description: payload.description,
        fragile: payload.fragile,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        events: [
          {
            status: ShipmentStatus.Booked,
            timestamp: new Date().toISOString(),
            location: pickup.city,
          },
        ],
        rateAmount: payload.paidAmount ?? 45.0,
        currency: payload.paymentMethod ? "SGD" : "INR",
        paymentMethod: payload.paymentMethod ?? "PayPal SG",
        paymentTransactionId: payload.paymentTransactionId,
        paidAmount: payload.paidAmount,
      };
      MOCK_SHIPMENTS.unshift(newShipment);
      return newShipment;
    }
  );
}
