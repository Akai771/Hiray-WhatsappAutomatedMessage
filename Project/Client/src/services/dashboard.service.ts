import { apiGet } from "./apiClient";
import type { AnalyticsData, DashboardStats } from "./types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiGet<DashboardStats>("/dashboard/stats");
  return data;
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const { data } = await apiGet<AnalyticsData>("/dashboard/analytics");
  return data;
}
