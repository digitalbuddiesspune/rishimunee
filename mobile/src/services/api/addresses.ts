import { apiClient } from "./client";

export async function listAddresses() {
  const { data } = await apiClient.get("/addresses");
  return data?.data?.addresses || [];
}

export async function createAddress(payload: Record<string, string | boolean>) {
  const { data } = await apiClient.post("/addresses", payload);
  return data?.data?.address;
}
