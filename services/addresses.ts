import { api } from "./api";
import { MOCK_ADDRESSES } from "./mockData";
import type { Address } from "@/types/address";

let localAddressesStore: Address[] = [...MOCK_ADDRESSES];

async function withDevFallback<T>(request: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (__DEV__) {
      console.log("[addresses] API unavailable, using local store data:", (error as Error).message);
      return fallback();
    }
    throw error;
  }
}

export async function getAddresses(): Promise<Address[]> {
  return withDevFallback(
    () => api.get<Address[]>("/addresses"),
    () => [...localAddressesStore]
  );
}

export async function createAddress(payload: Omit<Address, "id">): Promise<Address> {
  return withDevFallback(
    () => api.post<Address>("/addresses", payload),
    () => {
      const newAddress: Address = {
        id: `addr-${Date.now()}`,
        ...payload,
      };
      if (payload.isDefault) {
        localAddressesStore = localAddressesStore.map((a) => ({ ...a, isDefault: false }));
      }
      localAddressesStore.push(newAddress);
      return newAddress;
    }
  );
}

export async function updateAddress(id: string, payload: Omit<Address, "id">): Promise<Address> {
  return withDevFallback(
    () => api.put<Address>(`/addresses/${id}`, payload),
    () => {
      if (payload.isDefault) {
        localAddressesStore = localAddressesStore.map((a) => ({ ...a, isDefault: false }));
      }
      const updated: Address = { id, ...payload };
      localAddressesStore = localAddressesStore.map((a) => (a.id === id ? updated : a));
      return updated;
    }
  );
}

export async function deleteAddress(id: string): Promise<void> {
  return withDevFallback(
    () => api.delete(`/addresses/${id}`),
    () => {
      localAddressesStore = localAddressesStore.filter((a) => a.id !== id);
    }
  );
}
