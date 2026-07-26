import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";
import { logger } from "../shared/logger";
import type { SendNotificationJobData } from "./jobs/sendNotification.job";

export const NOTIFICATION_QUEUE = "notifications";

export const notificationQueue = new Queue<SendNotificationJobData>(NOTIFICATION_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 7 * 24 * 60 * 60, count: 5000 },
    removeOnFail: { age: 30 * 24 * 60 * 60 },
  },
});

// BullMQ re-emits Redis connection errors on the Queue's own EventEmitter
// (from the internal duplicated connections it creates) — an unlistened
// 'error' event throws, which is what was flooding the console on top of
// the plain ioredis client's own error handling in config/redis.ts.
notificationQueue.on("error", (err: NodeJS.ErrnoException) => {
  logger.warn(`Notification queue Redis error: ${err.code ?? err.message}`);
});
