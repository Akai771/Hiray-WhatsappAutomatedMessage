import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

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
export const notificationSendRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.user?.id ?? ipKeyGenerator(req.ip ?? "unknown"),
});
