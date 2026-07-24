import { apiGet, apiGetPaginated, apiPost } from "./apiClient";
import type {
  ApiNotification,
  ApiNotificationLog,
  DeliveryReport,
  NotificationStatus,
  PaginatedEnvelope,
  RecipientType,
} from "./types";

export interface CreateNotificationInput {
  templateId: string;
  title: string;
  message: string;
  attachmentUrl?: string;
  attachmentType?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  branchId?: string;
  courseId?: string;
  targetYear?: number;
  targetSemester?: number;
  audience: RecipientType[];
  /** ISO datetime — omit to send immediately */
  scheduledAt?: string;
}

export function listNotifications(
  page = 1,
  limit = 20,
  branchId?: string,
  status?: NotificationStatus,
): Promise<PaginatedEnvelope<ApiNotification>> {
  return apiGetPaginated<ApiNotification>("/notifications", { page, limit, branchId, status });
}

export async function getNotification(id: string): Promise<ApiNotification> {
  const { data } = await apiGet<ApiNotification>(`/notifications/${id}`);
  return data;
}

export async function createNotification(input: CreateNotificationInput): Promise<ApiNotification> {
  const { data } = await apiPost<ApiNotification>("/notifications", input);
  return data;
}

export function getNotificationLogs(
  id: string,
  page = 1,
  limit = 20,
): Promise<PaginatedEnvelope<ApiNotificationLog>> {
  return apiGetPaginated<ApiNotificationLog>(`/notifications/${id}/logs`, { page, limit });
}

export async function getDeliveryReport(id: string): Promise<DeliveryReport> {
  const { data } = await apiGet<DeliveryReport>(`/notifications/${id}/delivery-report`);
  return data;
}

export async function cancelNotification(id: string): Promise<ApiNotification> {
  const { data } = await apiPost<ApiNotification>(`/notifications/${id}/cancel`);
  return data;
}
