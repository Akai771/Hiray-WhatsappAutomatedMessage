import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";
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
