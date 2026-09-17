/**
 * Centralized API client. Every service (auth.ts, shipments.ts, ...) goes
 * through this file rather than calling axios/fetch directly, so the backend
 * URL, auth header, timeout and error shape are all defined in exactly one
 * place.
 *
 * To point the app at a real backend, set EXPO_PUBLIC_API_BASE_URL in .env
 * (see .env.example) — nothing in this file needs to change.
 */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { config, STORAGE_KEYS } from "@constants/config";
import { secureStorage } from "./storage";
import { ApiError, ApiRequestError } from "@/types/api";

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Called once from the auth session bootstrap so the client can attach the token. */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** Registered by the auth provider; invoked when the API returns 401 so the app can log out. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

const client: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeoutMs,
  headers: { "Content-Type": "application/json" },
});

const isPlaceholderUrl = (url: string) => !url || url.includes("josanlogistics.com") || url.includes("example.com");

client.interceptors.request.use(async (requestConfig) => {
  if (isPlaceholderUrl(config.apiBaseUrl)) {
    return Promise.reject(
      new ApiRequestError({
        status: 0,
        code: "ERR_NETWORK",
        message: "Can't reach the server. Check your connection and try again.",
      })
    );
  }
  if (!authToken) {
    authToken = await secureStorage.getItem(STORAGE_KEYS.authToken);
  }
  if (authToken) {
    requestConfig.headers.Authorization = `Bearer ${authToken}`;
  }
  if (config.apiDebug) {
    console.log(`[api] -> ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
  }
  return requestConfig;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ code?: string; message?: string; fieldErrors?: Record<string, string> }>) => {
    const status = error.response?.status ?? 0;
    const apiError: ApiError = {
      status,
      code: error.response?.data?.code ?? (error.code || "UNKNOWN_ERROR"),
      message:
        error.response?.data?.message ??
        (error.message === "Network Error"
          ? "Can't reach the server. Check your connection and try again."
          : "Something went wrong. Please try again."),
      fieldErrors: error.response?.data?.fieldErrors,
    };

    if (status === 401) {
      onUnauthorized?.();
    }

    if (config.apiDebug) {
      console.log(`[api] <- error ${status} ${error.config?.url}`, apiError.message);
    }

    return Promise.reject(new ApiRequestError(apiError));
  }
);

async function request<T>(requestConfig: AxiosRequestConfig): Promise<T> {
  const response = await client.request<T>(requestConfig);
  return response.data;
}

export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) => request<T>({ method: "GET", url, params }),
  post: <T>(url: string, data?: unknown) => request<T>({ method: "POST", url, data }),
  patch: <T>(url: string, data?: unknown) => request<T>({ method: "PATCH", url, data }),
  put: <T>(url: string, data?: unknown) => request<T>({ method: "PUT", url, data }),
  delete: <T>(url: string) => request<T>({ method: "DELETE", url }),
  /** Multipart upload helper for the profile photo — pass a FormData built by the caller. */
  upload: <T>(url: string, formData: FormData) =>
    request<T>({
      method: "POST",
      url,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default client;
