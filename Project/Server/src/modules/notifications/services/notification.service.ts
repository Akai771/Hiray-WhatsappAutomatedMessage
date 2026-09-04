import * as notificationRepository from "../repositories/notification.repository";
import * as notificationLogRepository from "../repositories/notificationLog.repository";
import { resolveRecipients, countRecipients } from "../repositories/recipient.repository";
import * as templateRepository from "../../templates/repositories/template.repository";
import { notificationQueue, SEND_NOTIFICATION_JOB } from "../../../queue";
import { getQuotaUsage } from "../../../integrations/whatsapp";
import { resolveBranchScope } from "../../../middleware/branchScope";
import { ApiError } from "../../../shared/errors";
import { NOTIFICATION_STATUS } from "../../../shared/constants";
import type { AuthUser } from "../../../shared/types";
import type { CreateNotificationInput } from "../types/notification.types";

// autoFillRecipientName always claims {{1}} specifically (that's the
// convention every template here follows: "Hello {{1}},") — every other
// placeholder is admin-typed and shared across the whole batch. This is how
// many of those the admin actually has to fill in.
function manualVariableCount(template: { variables: string[]; autoFillRecipientName: boolean }): number {
  return Math.max(0, template.variables.length - (template.autoFillRecipientName ? 1 : 0));
}

// Expands the template's {{1}}..{{n}} into one ordered array per send: the
// auto-filled slot (if any) comes from this recipient's own name, everything
// else comes from the admin-typed values in positional order.
function buildBodyVariables(
  template: { variables: string[]; autoFillRecipientName: boolean },
  manualValues: string[] | undefined,
  recipientName: string,
): string[] {
  let manualIndex = 0;
  return template.variables.map((_, i) => {
    if (i === 0 && template.autoFillRecipientName) return recipientName;
    return (manualValues?.[manualIndex++] ?? "").trim();
  });
}

export async function createNotification(user: AuthUser, input: CreateNotificationInput) {
  const template = await templateRepository.findById(input.templateId);
  if (!template) throw ApiError.notFound("Notification template not found");

  // What the template actually allows drives what's valid here — a client
  // UI can hide these fields based on the same flags, but that's just UX;
  // this is what actually stops a bad payload from reaching WhatsApp.
  const neededValues = manualVariableCount(template);
  if (neededValues > 0) {
    const values = input.variableValues ?? [];
    if (values.length !== neededValues || values.some((v) => !v.trim())) {
      throw ApiError.badRequest(
        `This template needs ${neededValues} value${neededValues === 1 ? "" : "s"} to fill its placeholders`,
      );
    }
  }
  if (input.attachmentUrl && !template.attachmentAllowed) {
    throw ApiError.badRequest("This template does not support an attachment");
  }
  // attachmentAllowed means the approved template has a media header
  // (IMAGE/VIDEO/DOCUMENT) — that header component is mandatory on every
  // send, not optional decoration. Skipping the upload here would send a
  // request WhatsApp rejects for missing the header parameter.
  if (template.attachmentAllowed && !input.attachmentUrl) {
    throw ApiError.badRequest("This template requires an attachment — upload an image, video, or document first");
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
      const bodyVariables = buildBodyVariables(template, input.variableValues, nameByRecipientId.get(log.recipientId) ?? "");

      return notificationQueue.add(
        SEND_NOTIFICATION_JOB,
        {
          logId: log.id,
          notificationId: notification.id,
          phone: log.phone,
          whatsappTemplateName: template.whatsappTemplateName,
          languageCode: template.languageCode,
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

// Lets the Messages page estimate how long a send will take to fully go out
// (remaining quota today, then WHATSAPP_DAILY_LIMIT/24h after) before the
// admin commits to it — same numbers the worker's reserveSendSlot() enforces.
export async function getSendQuota() {
  const { used, limit, windowMs } = await getQuotaUsage();
  return { used, limit, remaining: Math.max(limit - used, 0), windowMs };
}

// Real, exact reach for the Messages page's recipient/cost/time preview —
// runs the same students/parents filter createNotification's resolveRecipients
// uses, just as a count. Not derived from the client's Students/Parents
// tables, which only ever hold one paginated page of those.
export async function getRecipientCount(
  user: AuthUser,
  query: { branchId?: string; courseId?: string; year?: number; semester?: number },
) {
  const branchId = resolveBranchScope(user, query.branchId);
  return countRecipients({ branchId, courseId: query.courseId, year: query.year, semester: query.semester });
}

export async function listNotifications(
  user: AuthUser,
  page: number,
  limit: number,
  requestedBranchId?: string,
  status?: string,
) {
  const branchId = resolveBranchScope(user, requestedBranchId);
  const { items, pagination } = await notificationRepository.findAll(page, limit, { branchId, status });

  // One query for every notification on this page instead of the client
  // firing a separate getDeliveryReport request per row — that N+1 was what
  // made the history page slow to load.
  const reports = await notificationLogRepository.getBulkDeliveryReports(items.map((n) => n.id));
  return { items: items.map((n) => ({ ...n, deliveryReport: reports[n.id] })), pagination };
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
