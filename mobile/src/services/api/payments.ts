import { apiClient } from "./client";

export async function initiatePayment(payload: { serviceType: string; items?: { name: string; price: number; quantity?: number }[]; gateway?: string; platform?: string }) {
  const res = await apiClient.post("/payments/initiate", payload);
  return res.data;
}

export async function getPaymentStatus(orderId: string) {
  const res = await apiClient.get(`/orders/${orderId}/payment-status`);
  return res.data?.data || res.data;
}
