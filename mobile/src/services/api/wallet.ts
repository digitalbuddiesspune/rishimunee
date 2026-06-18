import { apiClient } from "./client";

export async function getWallet() {
  const res = await apiClient.get("/wallet");
  return res.data;
}

export async function topUpWallet(amount: number) {
  const res = await apiClient.post("/wallet/topup", { amount, platform: "mobile" });
  return res.data;
}

export async function confirmTopUp(payload: any) {
  const res = await apiClient.post("/wallet/confirm", payload);
  return res.data;
}
