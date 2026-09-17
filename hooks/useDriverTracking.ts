/**
 * useDriverTracking hook
 *
 * Opens a Socket.IO connection to the backend and subscribes to real-time
 * driver location updates for the specified trip.
 *
 * Falls back to HTTP polling if the socket is unavailable so the customer
 * still sees driver location updates, just with higher latency.
 *
 * Usage:
 *   const { driverLocation, isConnected } = useDriverTracking(tripId);
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  connectTrackingSocket,
  joinTripRoom,
  leaveTripRoom,
  type DriverLocationUpdate,
} from "@services/tracking";
import { api } from "@services/api";
import type { Socket } from "socket.io-client";

interface UseDriverTrackingResult {
  /** Latest known driver location, or null if not yet received. */
  driverLocation: DriverLocationUpdate | null;
  /** True when the Socket.IO connection is established. */
  isConnected: boolean;
  /** True when using HTTP polling fallback instead of WebSocket. */
  isPolling: boolean;
}

const POLL_INTERVAL_MS = 8_000; // Poll every 8 s as fallback

export function useDriverTracking(
  tripId: string | null | undefined,
  shipmentId: string | null | undefined
): UseDriverTrackingResult {
  const [driverLocation, setDriverLocation] = useState<DriverLocationUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── HTTP Polling Fallback ─────────────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (!shipmentId || pollTimerRef.current) return;
    setIsPolling(true);

    const fetchLocation = async () => {
      try {
        const result = await api.get<{
          latitude: number; longitude: number;
          heading?: number; speed_kph?: number; accuracy?: number; recorded_at?: string;
        }>(`/shipments/${shipmentId}/location`);

        setDriverLocation({
          tripId: tripId ?? "",
          driverId: null,
          latitude: result.latitude,
          longitude: result.longitude,
          heading: result.heading ?? null,
          speedKph: result.speed_kph ?? null,
          accuracy: result.accuracy ?? null,
          timestamp: result.recorded_at ? new Date(result.recorded_at).getTime() : Date.now(),
        });
      } catch {
        // Silently ignore — driver may not have started yet
      }
    };

    fetchLocation();
    pollTimerRef.current = setInterval(fetchLocation, POLL_INTERVAL_MS);
  }, [tripId, shipmentId]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // ─── Socket.IO Real-Time ───────────────────────────────────────────────────
  useEffect(() => {
    if (!tripId) return;

    let sock: Socket;

    try {
      sock = connectTrackingSocket();
      socketRef.current = sock;

      const onConnect = () => {
        setIsConnected(true);
        stopPolling();
        joinTripRoom(sock, tripId);
      };

      const onDisconnect = () => {
        setIsConnected(false);
        // Start polling as fallback when socket disconnects
        startPolling();
      };

      const onLocationUpdate = (payload: DriverLocationUpdate) => {
        if (payload.tripId === tripId) {
          setDriverLocation(payload);
        }
      };

      sock.on("connect", onConnect);
      sock.on("disconnect", onDisconnect);
      sock.on("location:update", onLocationUpdate);

      // If already connected (reused socket), join the room immediately
      if (sock.connected) {
        setIsConnected(true);
        joinTripRoom(sock, tripId);
      } else {
        // Start polling until socket connects
        startPolling();
      }

      return () => {
        leaveTripRoom(sock, tripId);
        sock.off("connect", onConnect);
        sock.off("disconnect", onDisconnect);
        sock.off("location:update", onLocationUpdate);
        stopPolling();
      };
    } catch (err) {
      if (__DEV__) console.warn("[useDriverTracking] socket error:", (err as Error).message);
      startPolling();
    }
  }, [tripId]);

  // Clean up polling on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  return { driverLocation, isConnected, isPolling };
}
