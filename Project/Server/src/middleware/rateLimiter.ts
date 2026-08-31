import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";
import { isProduction } from "../config/env";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts, try again later.", data: null },
});

// Keyed per authenticated user, not per IP — a Faculty account shouldn't be
// able to queue unbounded notification jobs from rotating IPs.
// 20/hour was way too tight for real use (an admin sending a few different
// notifications to different audiences within the same hour is normal) and
// made local testing hit the wall almost immediately. 60/hour in prod, and
// effectively unthrottled in dev/test so iterating on sends never blocks.
export const notificationSendRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: isProduction ? 60 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.user?.id ?? ipKeyGenerator(req.ip ?? "unknown"),
});
