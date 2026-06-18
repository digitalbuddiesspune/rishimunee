import { apiClient } from "./client";

export type Service = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  serviceType: string;
  basePrice?: number;
  isPaid?: boolean;
  features?: string[];
};

export type ListServicesResponse = {
  success?: boolean;
  data?: { services: Service[] };
  services?: Service[];
};

export async function listServices(): Promise<Service[]> {
  const res = await apiClient.get("/services");
  const data: ListServicesResponse = res.data;
  return (data?.data?.services || (data as any)?.services || []) as Service[];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const res = await apiClient.get(`/services/${slug}`);
  const data = res.data?.data || res.data;
  return (data?.service || null) as Service | null;
}
