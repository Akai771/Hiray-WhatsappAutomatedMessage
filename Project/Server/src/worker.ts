import { startNotificationWorker } from "./queue";
import { logger } from "./shared/logger";

const worker = startNotificationWorker();
logger.info("Notification worker started");

async function shutdown() {
  logger.info("Shutting down notification worker...");
  await worker.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
