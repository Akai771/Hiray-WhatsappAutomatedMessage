import type { Request, Response } from "express";
import * as notificationService from "../services/notification.service";
import { sendSuccess, sendPaginated } from "../../../shared/responses";

export async function create(req: Request, res: Response) {
  const notification = await notificationService.createNotification(req.user!, req.body);
  return sendSuccess(res, notification, "Notification created", 201);
}

export async function list(req: Request, res: Response) {
  const { page, limit, branchId, status } = req.query as unknown as {
    page: number;
    limit: number;
    branchId?: string;
    status?: string;
  };
  const { items, pagination } = await notificationService.listNotifications(req.user!, page, limit, branchId, status);
  return sendPaginated(res, items, pagination);
}

export async function getById(req: Request, res: Response) {
  const notification = await notificationService.getNotificationDetails(req.user!, (req.params.id as string));
  return sendSuccess(res, notification);
}

export async function getLogs(req: Request, res: Response) {
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const { items, pagination } = await notificationService.getNotificationLogs(req.user!, (req.params.id as string), page, limit);
  return sendPaginated(res, items, pagination);
}

export async function getDeliveryReport(req: Request, res: Response) {
  const report = await notificationService.getDeliveryReport(req.user!, (req.params.id as string));
  return sendSuccess(res, report);
}

export async function cancel(req: Request, res: Response) {
  const notification = await notificationService.cancelNotification(req.user!, (req.params.id as string));
  return sendSuccess(res, notification, "Notification cancelled");
}
