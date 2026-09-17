import React from "react";
import { Stack } from "expo-router";
import { colors } from "@constants/theme";
import { BookingProvider } from "@/hooks/useBooking";

/** Stack for the 5-step Book Shipment wizard (Details -> Package -> Review -> Payment -> Confirm), sharing one draft via BookingProvider. */
export default function BookLayout() {
  return (
    <BookingProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="details" />
        <Stack.Screen name="package" />
        <Stack.Screen name="review" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="confirm" />
      </Stack>
    </BookingProvider>
  );
}
