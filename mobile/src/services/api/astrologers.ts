import { apiClient } from "./client";

export type Astrologer = {
  _id: string;
  name: string;
  description?: string;
  specialty?: string[];
  languages?: string[];
  isFeatured?: boolean;
  avatarUrl?: string;
};

export type ListAstrologersResponse = {
  success?: boolean;
  data?: { astrologers: Astrologer[] };
  astrologers?: Astrologer[];
};

export async function listAstrologers(params?: { type?: string; specialty?: string }) {
  const res = await apiClient.get("/astrologers", { params });
  const data: ListAstrologersResponse = res.data;
  return (data?.data?.astrologers || (data as any)?.astrologers || []) as Astrologer[];
}

