import { apiClient } from "./client";

export type KundliInput = {
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  place: string;
};

export type KundliResult = {
  chart: any;
  narrative: string;
  reportId: string;
};

export async function generateKundli(payload: KundliInput) {
  const res = await apiClient.post("/kundli/generate", payload);
  const data = res.data?.data || res.data;
  return data as KundliResult;
}

export async function matchKundli(payload: any) {
  const res = await apiClient.post("/kundli/match", payload);
  return res.data?.data || res.data;
}

export async function mangalDosha(payload: { chart: any }) {
  const res = await apiClient.post("/kundli/mangal-dosha", payload);
  return res.data?.data || res.data;
}

export async function kalSarpDosh(payload: { chart: any }) {
  const res = await apiClient.post("/kundli/kal-sarp", payload);
  return res.data?.data || res.data;
}

export async function babyNameSuggestions(payload: { chart: any; preferences?: any }) {
  const res = await apiClient.post("/kundli/baby-names", payload);
  return res.data?.data || res.data;
}
