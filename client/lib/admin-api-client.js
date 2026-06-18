import axios from "axios";
import { getAdminToken } from "./store/adminTokenManager.js";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export const adminApiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

adminApiClient.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized admin request", error.response.data);
    }
    return Promise.reject(error);
  }
);

