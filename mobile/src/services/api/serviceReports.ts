import { apiClient } from "./client";
import type { KundliInput } from "./kundli";

export type GeneratedReport = {
  narrative: string;
  reportId: string;
};

export async function generateCareerReport(payload: { focus?: string } & KundliInput) {
  const res = await apiClient.post("/service-reports/career", payload || {});
  return (res.data?.data || res.data) as GeneratedReport;
}

export async function generateLifeReport(payload: { notes?: string } & KundliInput) {
  const res = await apiClient.post("/service-reports/life", payload || {});
  return (res.data?.data || res.data) as GeneratedReport;
}

export async function generateYearAnalysis(payload: { notes?: string } & KundliInput) {
  const res = await apiClient.post("/service-reports/year", payload || {});
  return (res.data?.data || res.data) as GeneratedReport;
}
