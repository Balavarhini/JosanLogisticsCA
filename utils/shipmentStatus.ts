import { colors } from "@constants/theme";
import { ShipmentStatus, SHIPMENT_STATUS_FLOW } from "@/types/shipment";

export interface ShipmentStatusPresentation {
  label: string;
  color: string;
  softColor: string;
  icon: "checkmark-circle" | "cube" | "bicycle" | "time" | "close-circle";
}

const PRESENTATION: Record<ShipmentStatus, ShipmentStatusPresentation> = {
  [ShipmentStatus.Pending]: { label: "Pending", color: colors.info, softColor: colors.infoSoft, icon: "time" },
  [ShipmentStatus.Booked]: { label: "Shipment Booked", color: colors.info, softColor: colors.infoSoft, icon: "cube" },
  [ShipmentStatus.OutForDelivery]: {
    label: "Out for Delivery",
    color: colors.primary,
    softColor: colors.primarySoft,
    icon: "bicycle",
  },
  [ShipmentStatus.InTransit]: { label: "In Transit", color: colors.info, softColor: colors.infoSoft, icon: "bicycle" },
  [ShipmentStatus.Delivered]: {
    label: "Delivered",
    color: colors.success,
    softColor: colors.successSoft,
    icon: "checkmark-circle",
  },
  [ShipmentStatus.Cancelled]: {
    label: "Cancelled",
    color: colors.error,
    softColor: colors.errorSoft,
    icon: "close-circle",
  },
};

export function getShipmentStatusPresentation(status: ShipmentStatus): ShipmentStatusPresentation {
  return PRESENTATION[status];
}

export function getShipmentStatusStepIndex(status: ShipmentStatus): number {
  return SHIPMENT_STATUS_FLOW.indexOf(status);
}
