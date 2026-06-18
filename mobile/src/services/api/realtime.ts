import { apiClient } from "./client";

export async function createRealtimeSession(astrologerId?: string) {
  const res = await apiClient.post("/realtime/session", astrologerId ? { astrologerId } : {});
  return res.data as any;
}

