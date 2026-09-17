/**
 * Live Tracking Socket service for the Customer App.
 *
 * Customers connect to the backend via Socket.IO to receive real-time
 * driver location updates for a specific shipment's trip.
 *
 * Usage:
 *   const socket = connectTrackingSocket();
 *   joinTripRoom(socket, tripId);
 *   socket.on("location:update", handler);
 *   leaveAndDisconnect(socket, tripId);
 */
import { io, Socket } from "socket.io-client";
import { config } from "@constants/config";

export interface DriverLocationUpdate {
  tripId: string;
  driverId: string | null;
  latitude: number;
  longitude: number;
  heading: number | null;
  speedKph: number | null;
  accuracy: number | null;
  timestamp: number;
}

let socket: Socket | null = null;

/**
 * Creates (or reuses) a Socket.IO connection for the customer.
 * Customers authenticate as guests — no token required for tracking.
 */
export function connectTrackingSocket(): Socket {
  if (socket?.connected) return socket;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Strip /v1 suffix — socket connects to root
  const baseUrl = config.apiBaseUrl.replace(/\/v\d+\/?$/, "");

  socket = io(baseUrl, {
    transports: ["websocket", "polling"],
    auth: { role: "CUSTOMER" },
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 2_000,
    reconnectionDelayMax: 10_000,
    timeout: 10_000,
  });

  socket.on("connect", () => {
    if (__DEV__) console.log("[tracking-socket] customer connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    if (__DEV__) console.log("[tracking-socket] connect error:", err.message);
  });

  return socket;
}

/** Join the Socket.IO room for a specific trip to receive location updates. */
export function joinTripRoom(sock: Socket, tripId: string): void {
  if (!sock || !tripId) return;
  sock.emit("join:trip", { tripId });
}

/** Leave a trip room (e.g., when closing the tracking screen). */
export function leaveTripRoom(sock: Socket, tripId: string): void {
  if (!sock || !tripId) return;
  sock.emit("leave:trip", { tripId });
}

/** Disconnects the customer socket completely. */
export function disconnectTrackingSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
