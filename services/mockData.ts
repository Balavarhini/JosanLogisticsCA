/**
 * Local sample data used only as a __DEV__ fallback when the real backend is
 * unreachable (see the withDevFallback pattern in shipments.ts /
 * addresses.ts / payments.ts), so the app is fully browsable before a
 * backend exists. Never imported directly by screens. Mirrors the example
 * data shown in the source design (tracking IDs, routes, the "Dharani"
 * greeting on the dashboard).
 */
import type { Address } from "@/types/address";
import type { PaymentMethod } from "@/types/payment";
import type { Shipment } from "@/types/shipment";
import { ShipmentStatus } from "@/types/shipment";
import type { User } from "@/types/user";

export const MOCK_USER: User = {
  id: "user-1",
  name: "Dharani",
  email: "dharani@example.com",
  phone: "+65 6789 0123",
};

export const MOCK_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "home",
    contactName: "Dharani",
    contactPhone: "+91 98765 43210",
    line1: "23, Anna Salai",
    city: "Chennai",
    state: "Tamil Nadu",
    postalCode: "600002",
    country: "India",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "work",
    contactName: "Dharani",
    contactPhone: "+91 98765 43210",
    line1: "45, MG Road",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560001",
    country: "India",
  },
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm-1", type: "card", label: "Visa", last4: "4242", expiry: "09/28", isDefault: true },
  { id: "pm-2", type: "upi", label: "UPI" },
];

export const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: "ship-1",
    trackingId: "JSN123456789IN",
    status: ShipmentStatus.OutForDelivery,
    pickup: MOCK_ADDRESSES[0],
    delivery: { ...MOCK_ADDRESSES[1], city: "Mumbai", state: "Maharashtra", line1: "12, Marine Drive", postalCode: "400001" },
    shipmentType: "domestic",
    packageType: "parcel",
    weightKg: 10,
    estimatedDelivery: new Date().toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    events: [
      { status: ShipmentStatus.Booked, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), location: "Chennai, Tamil Nadu" },
      { status: ShipmentStatus.InTransit, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), location: "Bangalore, Karnataka" },
      { status: ShipmentStatus.OutForDelivery, timestamp: new Date().toISOString(), location: "Mumbai, Maharashtra" },
    ],
  },
  {
    id: "ship-2",
    trackingId: "JSN987654321IN",
    status: ShipmentStatus.Delivered,
    pickup: { ...MOCK_ADDRESSES[0], city: "Coimbatore", state: "Tamil Nadu" },
    delivery: MOCK_ADDRESSES[1],
    shipmentType: "domestic",
    packageType: "box",
    weightKg: 4.5,
    estimatedDelivery: "2026-09-12T00:00:00.000Z",
    createdAt: "2026-09-09T12:00:00.000Z",
    events: [
      { status: ShipmentStatus.Booked, timestamp: "2026-09-09T12:00:00.000Z", location: "Coimbatore, Tamil Nadu" },
      { status: ShipmentStatus.OutForDelivery, timestamp: "2026-09-11T09:30:00.000Z", location: "Hosur, Tamil Nadu" },
      { status: ShipmentStatus.InTransit, timestamp: "2026-09-12T11:20:00.000Z", location: "Bangalore, Karnataka" },
      { status: ShipmentStatus.Delivered, timestamp: "2026-09-12T15:45:00.000Z", location: "Bangalore, Karnataka" },
    ],
  },
  {
    id: "ship-3",
    trackingId: "JSN112233445IN",
    status: ShipmentStatus.Pending,
    pickup: MOCK_ADDRESSES[0],
    delivery: { ...MOCK_ADDRESSES[0], city: "Trichy" },
    shipmentType: "domestic",
    packageType: "document",
    weightKg: 0.5,
    estimatedDelivery: "2026-09-12T00:00:00.000Z",
    createdAt: "2026-09-11T08:00:00.000Z",
    events: [{ status: ShipmentStatus.Booked, timestamp: "2026-09-11T08:00:00.000Z", location: "Chennai, Tamil Nadu" }],
  },
];
