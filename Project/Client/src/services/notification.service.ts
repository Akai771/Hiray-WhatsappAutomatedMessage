import { apiGet, apiGetPaginated, apiPost } from "./apiClient";
import type {
  ApiNotification,
  ApiNotificationLog,
  DeliveryReport,
  NotificationStatus,
  PaginatedEnvelope,
  RecipientType,
  SendQuota,
} from "./types";

export interface CreateNotificationInput {
  templateId: string;
  /** Internal label only, never sent to WhatsApp. */
  title?: string;
  /**
   * Ordered values for the template's placeholders, excluding the
   * auto-filled recipient-name slot (if any) — e.g. a 4-variable template
   * with autoFillRecipientName only needs 3 of these.
   */
  variableValues?: string[];
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

// How much of Meta's rolling-24h send cap is left right now — used to
// estimate how long a bulk send will take to fully go out (see
// estimatedSendSpan in messages-page.tsx).
export async function getSendQuota(): Promise<SendQuota> {
  const { data } = await apiGet<SendQuota>("/notifications/quota");
  return data;
}

export interface RecipientCountQuery {
  branchId?: string;
  courseId?: string;
  year?: number;
  semester?: number;
}

export interface RecipientCount {
  students: number;
  parents: number;
}

// Exact server-side count for the Messages page's Recipients preview — runs
// the same filter createNotification's resolveRecipients uses. Deliberately
// not derived from the client's Students/Parents tables, which only ever
// hold one paginated page of those (that's what undercounted before this
// existed).
export async function getRecipientCount(query: RecipientCountQuery): Promise<RecipientCount> {
  const { data } = await apiGet<RecipientCount>("/notifications/recipient-count", { ...query });
  return data;
}
