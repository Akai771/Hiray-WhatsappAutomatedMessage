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

  const delay = isFutureSchedule ? scheduledAt!.getTime() - Date.now() : 0;

  await Promise.all(
    logs.map((log) =>
      notificationQueue.add(
        SEND_NOTIFICATION_JOB,
        {
          logId: log.id,
          notificationId: notification.id,
          phone: log.phone,
          whatsappTemplateName: template.whatsappTemplateName,
          // Notification model has no per-variable value map (server.md) —
          // `message` fills the template's single body placeholder.
          bodyVariables: [input.message],
          attachmentUrl: input.attachmentUrl,
          attachmentType: input.attachmentType,
          buttonUrl: input.buttonUrl,
        },
        { jobId: log.id, delay },
      ),
    ),
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
