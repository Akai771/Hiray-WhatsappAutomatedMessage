import { Worker, type Job } from "bullmq";
import { redisConnection } from "../../config/redis";
import { NOTIFICATION_QUEUE } from "../queue";
import type { SendNotificationJobData } from "../jobs/sendNotification.job";
import { sendTemplateMessage, type WhatsAppTemplateComponent } from "../../integrations/whatsapp";
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

async function processSendNotificationJob(job: Job<SendNotificationJobData>): Promise<void> {
  const { data } = job;

  try {
    const { whatsappMessageId } = await sendTemplateMessage({
      to: data.phone,
      templateName: data.whatsappTemplateName,
      languageCode: data.languageCode,
      components: buildComponents(data),
    });

    await notificationLogRepository.markSent(data.logId, whatsappMessageId);
  } catch (err) {
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
