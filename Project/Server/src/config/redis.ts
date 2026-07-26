import IORedis from "ioredis";
import { env } from "./env";
import { logger } from "../shared/logger";

// BullMQ requires maxRetriesPerRequest: null on the connection it manages.
export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy: (attempt) => Math.min(attempt * 1000, 30_000),
});

// ioredis throws an unhandled exception on connection errors if nothing is
// listening for the 'error' event (Node EventEmitter default) — this is
// what was flooding the console with raw ECONNREFUSED stack traces. Redis
// is only needed for the notification queue; every other route works fine
// without it, so log once per failure instead of crashing/spamming.
let hasLoggedConnectionError = false;
redisConnection.on("error", (err: NodeJS.ErrnoException) => {
  if (!hasLoggedConnectionError) {
    // ioredis surfaces connection failures as AggregateError with an empty
    // .message — the real info is on .code (e.g. "ECONNREFUSED").
    logger.warn(`Redis connection failed (${err.code ?? err.message}) — notification queue/worker unavailable until it's reachable`);
    hasLoggedConnectionError = true;
  }
});
redisConnection.on("connect", () => {
  hasLoggedConnectionError = false;
  logger.info("Redis connected");
});
