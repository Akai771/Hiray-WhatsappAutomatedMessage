import { apiGet } from "./apiClient";
import type { DashboardStats } from "./types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiGet<DashboardStats>("/dashboard/stats");
  return data;
}
