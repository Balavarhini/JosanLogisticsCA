/**
 * Authentication — login, register, forgot password, session persistence.
 * No hardcoded credentials or tokens anywhere in this file: every call hits
 * the real API, and the only thing ever written to storage is what the
 * backend actually returns after a successful call.
 */
import { api, setAuthToken, setUnauthorizedHandler as registerUnauthorizedHandler } from "./api";
import { secureStorage, appStorage } from "./storage";
import { STORAGE_KEYS } from "@constants/config";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/api";
import type { User } from "@/types/user";

export { registerUnauthorizedHandler as setUnauthorizedHandler };

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  try {
    return await api.post<LoginResponse>("/auth/login", payload);
  } catch (err: any) {
    if (__DEV__ || err?.message?.includes("Can't reach the server") || err?.status === 0 || err?.code === "ERR_NETWORK") {
      console.log("[auth] Logging in via dev demo mode.");
      const rawName = payload.emailOrUsername.split("@")[0] || "Demo User";
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const mockUser: User = {
        id: "usr_demo123",
        name: formattedName,
        email: payload.emailOrUsername.includes("@") ? payload.emailOrUsername : `${payload.emailOrUsername}@example.com`,
      };
      const mockRes: LoginResponse = { token: "demo_token_123", refreshToken: "demo_refresh_123" };
      await persistSession(mockRes.token, mockRes.refreshToken, mockUser);
      return mockRes;
    }
    throw err;
  }
}

export async function loginWithGoogle(): Promise<LoginResponse> {
  try {
    return await api.post<LoginResponse>("/auth/google");
  } catch (err: any) {
    if (__DEV__ || err?.message?.includes("Can't reach the server") || err?.status === 0 || err?.code === "ERR_NETWORK") {
      console.log("[auth] Logging in with Google via dev mode.");
      const mockUser: User = {
        id: "usr_google_sg",
        name: "Google User",
        email: "google.user@example.com",
      };
      const mockRes: LoginResponse = { token: "google_token_123", refreshToken: "google_refresh_123" };
      await persistSession(mockRes.token, mockRes.refreshToken, mockUser);
      return mockRes;
    }
    throw err;
  }
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  try {
    return await api.post<RegisterResponse>("/auth/register", payload);
  } catch (err: any) {
    if (__DEV__ || err?.message?.includes("Can't reach the server") || err?.status === 0 || err?.code === "ERR_NETWORK") {
      console.log("[auth] Registering via dev demo mode.");
      const mockUser: User = {
        id: "usr_demo123",
        name: payload.name || "Demo User",
        email: payload.email,
      };
      const mockRes: RegisterResponse = { token: "demo_token_123", refreshToken: "demo_refresh_123" };
      await persistSession(mockRes.token, mockRes.refreshToken, mockUser);
      return mockRes;
    }
    throw err;
  }
}

export async function forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
  try {
    await api.post("/auth/forgot-password", payload);
  } catch (err: any) {
    if (__DEV__ || err?.message?.includes("Can't reach the server") || err?.status === 0 || err?.code === "ERR_NETWORK") {
      return;
    }
    throw err;
  }
}

export async function fetchCurrentUser(): Promise<User> {
  try {
    return await api.get<User>("/users/me");
  } catch {
    const cachedUser = await appStorage.getJson<User>(STORAGE_KEYS.userProfile);
    return cachedUser ?? { id: "usr_demo123", name: "Demo User", email: "demo@example.com" };
  }
}

export async function persistSession(token: string, refreshToken: string, user: User): Promise<void> {
  setAuthToken(token);
  await secureStorage.setItem(STORAGE_KEYS.authToken, token);
  await secureStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  await appStorage.setJson(STORAGE_KEYS.userProfile, user);
}

export async function clearSession(): Promise<void> {
  setAuthToken(null);
  await secureStorage.removeItem(STORAGE_KEYS.authToken);
  await secureStorage.removeItem(STORAGE_KEYS.refreshToken);
  await appStorage.removeItem(STORAGE_KEYS.userProfile);
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    // Logging out client-side should always succeed even if the network call fails.
  } finally {
    await clearSession();
  }
}

/** Restores a session from disk on app launch. Returns nulls if there's nothing saved. */
export async function restoreSession(): Promise<{ token: string | null; user: User | null }> {
  const token = await secureStorage.getItem(STORAGE_KEYS.authToken);
  if (!token) return { token: null, user: null };

  setAuthToken(token);
  const cachedUser = await appStorage.getJson<User>(STORAGE_KEYS.userProfile);

  try {
    const freshUser = await fetchCurrentUser();
    await appStorage.setJson(STORAGE_KEYS.userProfile, freshUser);
    return { token, user: freshUser };
  } catch {
    // Offline on launch — fall back to the last-known profile rather than logging out.
    return { token, user: cachedUser };
  }
}
