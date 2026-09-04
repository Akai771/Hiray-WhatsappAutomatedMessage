import { Worker, DelayedError, type Job } from "bullmq";
import { redisConnection } from "../../config/redis";
import { NOTIFICATION_QUEUE } from "../queue";
import type { SendNotificationJobData } from "../jobs/sendNotification.job";
import {
  sendTemplateMessage,
  reserveSendSlot,
  releaseSendSlot,
  type WhatsAppTemplateComponent,
} from "../../integrations/whatsapp";
import { categoryForMime } from "../../integrations/storage";
import * as notificationRepository from "../../modules/notifications/repositories/notification.repository";
import * as notificationLogRepository from "../../modules/notifications/repositories/notificationLog.repository";
import { logger } from "../../shared/logger";

function buildComponents(data: SendNotificationJobData): WhatsAppTemplateComponent[] {
  const components: WhatsAppTemplateComponent[] = [];

  if (data.attachmentUrl && data.attachmentType) {
    const category = categoryForMime(data.attachmentType);
    if (category === "image") {
      components.push({ type: "header", parameters: [{ type: "image", image: { link: data.attachmentUrl } }] });
    } else if (category === "video") {
      components.push({ type: "header", parameters: [{ type: "video", video: { link: data.attachmentUrl } }] });
    } else if (category === "document") {
      components.push({
        type: "header",
        parameters: [{ type: "document", document: { link: data.attachmentUrl } }],
      });
    }
  }

  if (data.bodyVariables.length > 0) {
    components.push({
      type: "body",
      parameters: data.bodyVariables.map((text) => ({ type: "text", text })),
    });
  }

  // notification.service.ts only sets buttonUrl when the template's button
  // was approved as dynamic ({{1}} suffix) — a static-URL button must never
  // get a button component at all, or WhatsApp rejects the send with
  // #132018 ("Button ... does not require parameters").
  if (data.buttonUrl) {
    components.push({
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [{ type: "text", text: data.buttonUrl }],
    });
  }

  return components;
}

async function settleNotificationIfDone(notificationId: string): Promise<void> {
  const stillPending = await notificationLogRepository.hasPendingLogs(notificationId);
  if (!stillPending) {
    await notificationRepository.updateStatus(notificationId, "COMPLETED");
  }
}

async function processSendNotificationJob(job: Job<SendNotificationJobData>, token?: string): Promise<void> {
  const { data } = job;

  // Reserve a slot against Meta's rolling-24h send cap before attempting
  // anything. If the day's quota (WHATSAPP_DAILY_LIMIT) is already spent,
  // park this job until a slot ages out instead of sending anyway (Meta
  // would reject it and risks throttling the number) or burning one of its
  // retry attempts / marking it FAILED for something that isn't a failure.
  const quota = await reserveSendSlot(data.logId);
  if (!quota.reserved) {
    if (!token) {
      // Only happens if this worker's processor is ever invoked outside
      // BullMQ's normal lock-holding flow — moveToDelayed requires the lock
      // token, so there's nothing safe to do but fail loudly.
      throw new Error("Cannot delay job for quota: missing lock token");
    }
    const delayUntil = (quota.retryAt ?? Date.now() + 60_000) + 1_000; // +1s past the window edge
    logger.info(
      `Daily WhatsApp send limit reached — delaying log ${data.logId} until ${new Date(delayUntil).toISOString()}`,
    );
    await job.moveToDelayed(delayUntil, token);
    throw new DelayedError();
  }

  try {
    const { whatsappMessageId } = await sendTemplateMessage({
      to: data.phone,
      templateName: data.whatsappTemplateName,
      languageCode: data.languageCode,
      components: buildComponents(data),
    });

    await notificationLogRepository.markSent(data.logId, whatsappMessageId);
  } catch (err) {
    // The reserved slot only counts once WhatsApp actually accepts the
    // message — give it back on failure so a bad number/template doesn't
    // quietly eat into today's limit for nothing.
    await releaseSendSlot(data.logId).catch(() => undefined);

    const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
    if (isLastAttempt) {
      const message = err instanceof Error ? err.message : "Unknown send failure";
      await notificationLogRepository.markFailed(data.logId, message);
    }
    throw err;
  } finally {
    if (job.attemptsMade + 1 >= (job.opts.attempts ?? 1)) {
      await settleNotificationIfDone(data.notificationId).catch((settleErr) =>
        logger.error("Failed to settle notification status", settleErr),
      );
    }
  }
}

export function startNotificationWorker(): Worker<SendNotificationJobData> {
  const worker = new Worker<SendNotificationJobData>(NOTIFICATION_QUEUE, processSendNotificationJob, {
    connection: redisConnection,
    concurrency: 10,
  });

  worker.on("completed", (job) => {
    settleNotificationIfDone(job.data.notificationId).catch((err) =>
      logger.error("Failed to settle notification status after completion", err),
    );
  });

  worker.on("failed", (job, err) => {
    logger.error(`Notification job ${job?.id} failed`, err);
  });

  // Same reasoning as notificationQueue.on("error", ...) in queue.ts — the
  // Worker has its own duplicated Redis connections whose errors surface
  // here, not on the shared redisConnection client.
  worker.on("error", (err: NodeJS.ErrnoException) => {
    logger.warn(`Notification worker Redis error: ${err.code ?? err.message}`);
  });

  return worker;
}
