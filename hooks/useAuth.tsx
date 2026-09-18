/**
 * Auth session context. Wraps services/auth.ts so screens/components consume
 * a simple `{ user, isAuthenticated, login, logout, ... }` API and never
 * touch tokens or storage directly. Mounted once in app/_layout.tsx.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "@services/auth";
import { appStorage } from "@services/storage";
import { STORAGE_KEYS } from "@constants/config";
import type { User } from "@/types/user";
import type { LoginRequest, RegisterRequest } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** True only during the initial session-restore on app launch. */
  isBootstrapping: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      const restored = await authService.restoreSession();
      setToken(restored.token);
      setUserState(restored.user);
      setIsBootstrapping(false);
    })();
  }, []);

  useEffect(() => {
    authService.setUnauthorizedHandler(() => {
      setToken(null);
      setUserState(null);
    });
    return () => authService.setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const result = await authService.login(payload);
    const freshUser = await authService.fetchCurrentUser();
    await authService.persistSession(result.token, result.refreshToken, freshUser);
    setToken(result.token);
    setUserState(freshUser);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const result = await authService.loginWithGoogle();
    const freshUser = await authService.fetchCurrentUser();
    await authService.persistSession(result.token, result.refreshToken, freshUser);
    setToken(result.token);
    setUserState(freshUser);
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const result = await authService.register(payload);
    const freshUser = await authService.fetchCurrentUser();
    await authService.persistSession(result.token, result.refreshToken, freshUser);
    setToken(result.token);
    setUserState(freshUser);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await authService.forgotPassword({ email });
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setToken(null);
    setUserState(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const freshUser = await authService.fetchCurrentUser();
    setUserState(freshUser);
  }, []);

  const setUser = useCallback((next: User) => {
    setUserState(next);
    appStorage.setJson(STORAGE_KEYS.userProfile, next);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!token,
      isBootstrapping,
      login,
      loginWithGoogle,
      register,
      forgotPassword,
      logout,
      refreshUser,
      setUser,
    }),
    [user, token, isBootstrapping, login, loginWithGoogle, register, forgotPassword, logout, refreshUser, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
