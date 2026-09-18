import "react-native-gesture-handler";
import React, { useCallback, useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts, Merriweather_400Regular, Merriweather_700Bold } from "@expo-google-fonts/merriweather";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { colors } from "@constants/theme";

// Keep the native splash screen up until fonts are loaded AND the auth
// session has finished restoring — this avoids any flash of the wrong
// screen (login vs. home) while `restoreSession()` resolves.
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Redirects between the (auth) group and the (tabs) group based on session
 * state. This is the single source of truth for "protected routes" — screens
 * never need to check auth themselves.
 */
function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    if (isBootstrapping) return;

    const inAuthGroup = segments[0] === "(auth)";
    const atOnboarding = segments.length < 1;
    if (!isAuthenticated && !inAuthGroup && !atOnboarding) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/home");
    }

    if (!splashHidden) {
      setSplashHidden(true);
      SplashScreen.hideAsync().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isBootstrapping, segments]);

  return <>{children}</>;
}

function AppShell() {
  return (
    <RouteGuard>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="book" />
        <Stack.Screen name="rate-calculator" />
        <Stack.Screen name="shipment/[trackingId]" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/addresses" />
        <Stack.Screen name="profile/add-address" />
        <Stack.Screen name="profile/payment-methods" />
        <Stack.Screen name="profile/change-password" />
      </Stack>
    </RouteGuard>
  );
}

export default function RootLayout() {
  // Icon glyph fonts are loaded alongside the type fonts — otherwise
  // Ionicons can render as an empty box for a frame on first paint, since
  // @expo/vector-icons loads its fonts asynchronously on its own.
  const [fontsLoaded, fontError] = useFonts({
    Merriweather_400Regular,
    Merriweather_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    ...Ionicons.font,
  });

  const ready = fontsLoaded || !!fontError;

  const onLayout = useCallback(() => {
    // Native splash stays up (see RouteGuard) until auth bootstrap resolves.
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
