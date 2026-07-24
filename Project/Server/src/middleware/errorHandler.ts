import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ApiError } from "../shared/errors";
import { logger } from "../shared/logger";
import { sendError } from "../shared/responses";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) logger.error(err.message, err);
    return sendError(res, err.message, err.statusCode, err.details ?? null);
  }

  if (err instanceof MulterError) {
    return sendError(res, err.message, 400);
  }

  const error = err instanceof Error ? err : new Error("Unknown error");
  logger.error("Unhandled error", error);
  return sendError(res, "Internal server error", 500);
}
