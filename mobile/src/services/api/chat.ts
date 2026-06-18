import { apiClient } from "./client";

export async function startChatSession({ astrologerId, astrologerSlug }: { astrologerId?: string; astrologerSlug?: string }) {
  const res = await apiClient.post("/chat/start", { astrologerId, astrologerSlug });
  return res.data as { success: boolean; data: { chatId: string } } as any;
}

export async function sendChatMessage(chatId: string, message: string) {
  const res = await apiClient.post(`/chat/${chatId}/messages`, { message });
  return res.data;
}

export async function fetchChatHistory(params?: { astrologerId?: string; astrologerSlug?: string }) {
  const res = await apiClient.get("/chat/history", { params });
  return res.data;
}

// SSE streaming endpoint is available at POST /chat/:chatId/messages/stream.
// Streaming on React Native requires an EventSource polyfill or chunked fetch handling.
// Implement later if needed; for now we use the non-streaming endpoint above.

export async function quoteChatAccess(astrologerId: string, minutes?: number) {
  const res = await apiClient.get("/chat/access/quote", { params: { astrologerId, minutes } });
  return res.data;
}

export async function confirmChatAccess(astrologerId: string, minutes?: number) {
  const res = await apiClient.post("/chat/access/confirm", { astrologerId, minutes });
  return res.data;
}
