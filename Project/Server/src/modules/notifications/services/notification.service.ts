import * as notificationRepository from "../repositories/notification.repository";
import * as notificationLogRepository from "../repositories/notificationLog.repository";
import { resolveRecipients } from "../repositories/recipient.repository";
import * as templateRepository from "../../templates/repositories/template.repository";
import { notificationQueue, SEND_NOTIFICATION_JOB } from "../../../queue";
import { resolveBranchScope } from "../../../middleware/branchScope";
import { ApiError } from "../../../shared/errors";
import { NOTIFICATION_STATUS } from "../../../shared/constants";
import type { AuthUser } from "../../../shared/types";
import type { CreateNotificationInput } from "../types/notification.types";

export async function createNotification(user: AuthUser, input: CreateNotificationInput) {
  const template = await templateRepository.findById(input.templateId);
  if (!template) throw ApiError.notFound("Notification template not found");

  // What the template actually allows drives what's valid here — a client
  // UI can hide these fields based on the same flags, but that's just UX;
  // this is what actually stops a bad payload from reaching WhatsApp.
  // autoFillRecipientName templates need no typed message — {{1}} comes
  // from each recipient's own name instead, built per-log below.
  if (template.variables.length > 0 && !template.autoFillRecipientName && !input.message?.trim()) {
    throw ApiError.badRequest("This template has a {{1}} placeholder — a message is required to fill it");
  }
  if (input.attachmentUrl && !template.attachmentAllowed) {
    throw ApiError.badRequest("This template does not support an attachment");
  }
  if (input.buttonUrl && !template.buttonAllowed) {
    throw ApiError.badRequest("This template does not support a CTA button");
  }
  // A static-URL button is fixed at approval — WhatsApp rejects any button
  // parameter sent with it, so there's nothing for an admin to fill in here.
  if (input.buttonUrl && template.buttonAllowed && !template.buttonUrlIsDynamic) {
    throw ApiError.badRequest("This template's button URL is fixed and does not accept a custom URL");
  }

  const branchId = resolveBranchScope(user, input.branchId);

  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : undefined;
  const isFutureSchedule = scheduledAt !== undefined && scheduledAt.getTime() > Date.now();
  const status = isFutureSchedule ? NOTIFICATION_STATUS.SCHEDULED : NOTIFICATION_STATUS.QUEUED;

  const notification = await notificationRepository.create(
    { ...input, branchId, createdBy: user.id },
    status,
  );

  const recipients = await resolveRecipients({
    branchId,
    courseId: input.courseId,
    year: input.targetYear,
    semester: input.targetSemester,
    audience: input.audience,
  });

  const logs = await notificationLogRepository.createPendingLogs(notification.id, recipients);

  // Keyed by recipientId so autoFillRecipientName can look up each log's own
  // recipient name — recipients came from the same resolveRecipients() call
  // that produced these logs, just not guaranteed to be in the same order.
  const nameByRecipientId = new Map(recipients.map((r) => [r.recipientId, r.name]));

  const delay = isFutureSchedule ? scheduledAt!.getTime() - Date.now() : 0;

  await Promise.all(
    logs.map((log) => {
      // Notification model has no general per-variable value map
      // (server.md) — only two sources fill the template's single body
      // placeholder: one admin-typed value shared by the whole batch, or
      // (autoFillRecipientName) each recipient's own name, built per-log
      // here. A zero-variable template sends its approved body as-is.
      const bodyVariables =
        template.variables.length === 0
          ? []
          : template.autoFillRecipientName
            ? [nameByRecipientId.get(log.recipientId) ?? ""]
            : [input.message!.trim()];

      return notificationQueue.add(
        SEND_NOTIFICATION_JOB,
        {
          logId: log.id,
          notificationId: notification.id,
          phone: log.phone,
          whatsappTemplateName: template.whatsappTemplateName,
          bodyVariables,
          attachmentUrl: input.attachmentUrl,
          attachmentType: input.attachmentType,
          // Only a dynamic button takes a parameter — a static one must get
          // no button component at all (see buildComponents in the worker).
          buttonUrl: template.buttonUrlIsDynamic ? input.buttonUrl : undefined,
        },
        { jobId: log.id, delay },
      );
    }),
  );

  return notification;
}

export async function listNotifications(
  user: AuthUser,
  page: number,
  limit: number,
  requestedBranchId?: string,
  status?: string,
) {
  const branchId = resolveBranchScope(user, requestedBranchId);
  return notificationRepository.findAll(page, limit, { branchId, status });
}

async function getScopedNotification(user: AuthUser, id: string) {
  const notification = await notificationRepository.findById(id);
  if (!notification) throw ApiError.notFound("Notification not found");
  resolveBranchScope(user, notification.branchId ?? undefined);
  return notification;
}

export async function getNotificationDetails(user: AuthUser, id: string) {
  return getScopedNotification(user, id);
}

export async function getNotificationLogs(user: AuthUser, id: string, page: number, limit: number) {
  await getScopedNotification(user, id);
  return notificationLogRepository.findByNotificationId(id, page, limit);
}

export async function getDeliveryReport(user: AuthUser, id: string) {
  await getScopedNotification(user, id);
  return notificationLogRepository.getDeliveryReport(id);
}

export async function cancelNotification(user: AuthUser, id: string) {
  const notification = await getScopedNotification(user, id);

  if (notification.status !== NOTIFICATION_STATUS.SCHEDULED && notification.status !== NOTIFICATION_STATUS.QUEUED) {
    throw ApiError.badRequest("Only scheduled or queued notifications can be cancelled");
  }

  const { items: logs } = await notificationLogRepository.findByNotificationId(id, 1, 10_000);
  await Promise.all(
    logs.map(async (log) => {
      const job = await notificationQueue.getJob(log.id);
      // A job already picked up by a worker can't be removed — that
      // recipient will still receive the message; best-effort otherwise.
      await job?.remove().catch(() => undefined);
    }),
  );

  return notificationRepository.updateStatus(id, NOTIFICATION_STATUS.CANCELLED);
}
