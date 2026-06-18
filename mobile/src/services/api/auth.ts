import { apiClient } from "./client";

export type LoginPayload = { email: string; password: string };
export type SignupPayload = { name: string; email: string; phone: string; password: string };

export async function login(data: LoginPayload) {
  const res = await apiClient.post("/auth/login", data);
  return res.data;
}

export async function requestSignupOtp(data: SignupPayload) {
  const res = await apiClient.post("/auth/register/request-otp", data);
  return res.data;
}

export async function verifySignupOtp(challengeId: string, otp: string) {
  const res = await apiClient.post("/auth/register/verify-otp", { challengeId, otp });
  return res.data;
}

export async function resendOtp(challengeId: string) {
  const res = await apiClient.post("/auth/otp/resend", { challengeId });
  return res.data;
}

export async function getProfile() {
  const res = await apiClient.get("/auth/me");
  return res.data;
}

export async function updateProfile(payload: any) {
  const res = await apiClient.put("/auth/me", payload);
  return res.data;
}

export async function getOverview() {
  const res = await apiClient.get("/auth/overview");
  return res.data;
}
