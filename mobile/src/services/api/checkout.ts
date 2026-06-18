import { apiClient } from "./client";

export async function initiateProductCheckout(payload: { addressId?: string; address?: Record<string, string>; gateway?: string; platform?: string }) {
  const { data } = await apiClient.post("/checkout/initiate", payload || {});
  return data;
}
