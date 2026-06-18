import axios from "axios";

const baseURL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" }
});

export function setAuthToken(token?: string | null) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

export function withAbort<T>(promise: Promise<T>) {
  const controller = new AbortController();
  const p = promise;
  return { promise: p, cancel: () => controller.abort(), signal: controller.signal };
}

