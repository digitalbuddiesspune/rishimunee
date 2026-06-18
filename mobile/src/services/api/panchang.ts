import { apiClient } from "./client";

export type Panchang = {
  sunrise?: string;
  sunset?: string;
  tithi?: string;
  nakshatra?: string;
  yoga?: string;
  karana?: string;
  [key: string]: any;
};

export async function fetchPanchang(location: string) {
  const res = await apiClient.get("/panchang", { params: { location } });
  const data = res.data?.data || res.data;
  return data?.panchang as Panchang;
}

