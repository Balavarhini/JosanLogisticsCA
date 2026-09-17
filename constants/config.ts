/**
 * App-wide runtime configuration, sourced from environment variables.
 * Expo only inlines variables prefixed with EXPO_PUBLIC_ into the JS bundle.
 * See .env.example for the full list and services/api.ts for how this is consumed.
 */

export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.josanlogistics.com/v1",
  apiTimeoutMs: Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 15000),
  apiDebug: process.env.EXPO_PUBLIC_API_DEBUG === "true",
} as const;

export const STORAGE_KEYS = {
  authToken: "josan.customer.auth.token",
  refreshToken: "josan.customer.auth.refreshToken",
  userProfile: "josan.customer.auth.userProfile",
} as const;
