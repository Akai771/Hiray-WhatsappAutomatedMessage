import { supabaseAdmin } from "../../../config/supabase";
import { ApiError } from "../../../shared/errors";
import { buildPagination, type Pagination } from "../../../shared/responses";
import type { DeliveryReport, NotificationLog } from "../types/notification.types";
import type { Recipient } from "./recipient.repository";

const TABLE = "notification_logs";

function mapRow(row: any): NotificationLog {
  return {
    id: row.id,
    notificationId: row.notification_id,
    recipientId: row.recipient_id,
    recipientType: row.recipient_type,
    phone: row.phone,
    status: row.status,
    whatsappMessageId: row.whatsapp_message_id,
    errorMessage: row.error_message,
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
}

export async function createPendingLogs(notificationId: string, recipients: Recipient[]): Promise<NotificationLog[]> {
  if (recipients.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert(
      recipients.map((r) => ({
        notification_id: notificationId,
        recipient_id: r.recipientId,
        recipient_type: r.recipientType,
        phone: r.phone,
        status: "PENDING",
      })),
    )
    .select();

  if (error) throw ApiError.internal("Failed to create notification logs", error.message);
  return (data ?? []).map(mapRow);
}

export async function markSent(logId: string, whatsappMessageId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .update({ status: "SENT", whatsapp_message_id: whatsappMessageId, sent_at: new Date().toISOString() })
    .eq("id", logId);
  if (error) throw ApiError.internal("Failed to mark log as sent", error.message);
}

export async function markFailed(logId: string, errorMessage: string): Promise<void> {
  const { error } = await supabaseAdmin.from(TABLE).update({ status: "FAILED", error_message: errorMessage }).eq("id", logId);
  if (error) throw ApiError.internal("Failed to mark log as failed", error.message);
}

export async function updateStatusByWhatsAppMessageId(
  whatsappMessageId: string,
  status: string,
  errorMessage?: string,
): Promise<void> {
  const patch: Record<string, unknown> = { status };
  if (errorMessage) patch.error_message = errorMessage;

  const { error } = await supabaseAdmin.from(TABLE).update(patch).eq("whatsapp_message_id", whatsappMessageId);
  if (error) throw ApiError.internal("Failed to update log status from webhook", error.message);
}

export async function findByNotificationId(
  notificationId: string,
  page: number,
  limit: number,
): Promise<{ items: NotificationLog[]; pagination: Pagination }> {
  const from = (page - 1) * limit;
  const { data, error, count } = await supabaseAdmin
    .from(TABLE)
    .select("*", { count: "exact" })
    .eq("notification_id", notificationId)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw ApiError.internal("Failed to fetch notification logs", error.message);

  return {
    items: (data ?? []).map(mapRow),
    pagination: buildPagination(page, limit, count ?? 0),
  };
}

export async function hasPendingLogs(notificationId: string): Promise<boolean> {
  const { count, error } = await supabaseAdmin
    .from(TABLE)
    .select("id", { head: true, count: "exact" })
    .eq("notification_id", notificationId)
    .eq("status", "PENDING");

  if (error) throw ApiError.internal("Failed to check pending logs", error.message);
  return (count ?? 0) > 0;
}

export async function getDeliveryReport(notificationId: string): Promise<DeliveryReport> {
  const { data, error } = await supabaseAdmin.from(TABLE).select("status").eq("notification_id", notificationId);
  if (error) throw ApiError.internal("Failed to compute delivery report", error.message);

  const report: DeliveryReport = { total: 0, pending: 0, sent: 0, delivered: 0, read: 0, failed: 0 };
  for (const row of data ?? []) {
    report.total++;
    switch (row.status) {
      case "PENDING":
        report.pending++;
        break;
      case "SENT":
        report.sent++;
        break;
      case "DELIVERED":
        report.delivered++;
        break;
      case "READ":
        report.read++;
        break;
      case "FAILED":
        report.failed++;
        break;
    }
  }
  return report;
}
