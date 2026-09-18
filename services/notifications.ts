import { Alert, Platform } from "react-native";
import { Shipment, ShipmentStatus } from "@/types/shipment";

export interface DeliveryNotificationItem {
  id: string;
  trackingId: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: "arriving_today" | "out_for_delivery" | "delivered";
}

/** Helper to filter shipments that are arriving today or out for delivery. */
export function getArrivingTodayShipments(shipments: Shipment[]): Shipment[] {
  const todayStr = new Date().toDateString();
  return shipments.filter((s) => {
    if (s.status === ShipmentStatus.Delivered || s.status === ShipmentStatus.Cancelled) {
      return false;
    }
    const isOutForDelivery = s.status === ShipmentStatus.OutForDelivery;
    const isTodayEstimated = s.estimatedDelivery
      ? new Date(s.estimatedDelivery).toDateString() === todayStr
      : false;
    return isOutForDelivery || isTodayEstimated;
  });
}

/** Triggers an immediate local delivery intimation alert / notification. */
export function triggerDeliveryIntimationNotification(trackingId: string, destinationCity?: string) {
  const title = "📦 Parcel Arriving Today!";
  const body = `Your shipment (${trackingId}) is out for delivery ${
    destinationCity ? `to ${destinationCity}` : ""
  } and is expected to arrive today by 5:00 PM.`;

  if (Platform.OS === "web") {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.png" });
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    } else {
      console.log(`[Notification Intimation] ${title} - ${body}`);
    }
  } else {
    Alert.alert(title, body, [{ text: "Got it", style: "default" }]);
  }
}
