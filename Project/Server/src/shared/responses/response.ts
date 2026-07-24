import type { Response } from "express";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(res: Response, data: T, message = "", statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: Pagination,
  message = "",
  statusCode = 200,
) {
  return res.status(statusCode).json({ success: true, message, data, pagination });
}

export function sendError(res: Response, message: string, statusCode = 500, data: unknown = null) {
  return res.status(statusCode).json({ success: false, message, data });
}

export function buildPagination(page: number, limit: number, total: number): Pagination {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
