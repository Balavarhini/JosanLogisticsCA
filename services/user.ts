import { api } from "./api";
import { appStorage } from "./storage";
import { STORAGE_KEYS } from "@constants/config";
import type { User } from "@/types/user";

async function withDevFallback<T>(request: () => Promise<T>, fallback: () => Promise<T> | T): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (__DEV__) {
      console.log("[user] API unavailable, using local profile fallback:", (error as Error).message);
      return await fallback();
    }
    throw error;
  }
}

export async function updateProfile(payload: Partial<Pick<User, "name" | "email" | "phone">>): Promise<User> {
  return withDevFallback(
    () => api.patch<User>("/users/me", payload),
    async () => {
      const cached = await appStorage.getJson<User>(STORAGE_KEYS.userProfile);
      const updatedUser: User = {
        id: cached?.id ?? "usr_demo123",
        name: payload.name ?? cached?.name ?? "Demo User",
        email: payload.email ?? cached?.email ?? "demo@example.com",
        phone: payload.phone ?? cached?.phone,
        avatarUrl: cached?.avatarUrl,
      };
      await appStorage.setJson(STORAGE_KEYS.userProfile, updatedUser);
      return updatedUser;
    }
  );
}

export async function uploadAvatar(photoUri: string): Promise<User> {
  const formData = new FormData();
  formData.append("avatar", { uri: photoUri, name: "avatar.jpg", type: "image/jpeg" } as unknown as Blob);
  return withDevFallback(
    () => api.upload<User>("/users/me/avatar", formData),
    async () => {
      const cached = await appStorage.getJson<User>(STORAGE_KEYS.userProfile);
      const updatedUser: User = {
        ...(cached ?? { id: "usr_demo123", name: "Demo User", email: "demo@example.com" }),
        avatarUrl: photoUri,
      };
      await appStorage.setJson(STORAGE_KEYS.userProfile, updatedUser);
      return updatedUser;
    }
  );
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return withDevFallback(
    () => api.post("/users/me/change-password", { currentPassword, newPassword }),
    () => {
      console.log("[user] Password changed in dev fallback mode.");
    }
  );
}
