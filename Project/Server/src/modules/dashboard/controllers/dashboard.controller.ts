import type { Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service";
import { sendSuccess } from "../../../shared/responses";

export async function getStats(req: Request, res: Response) {
  const stats = await dashboardService.getDashboardStats(req.user!);
  return sendSuccess(res, stats);
}

export async function getAnalytics(req: Request, res: Response) {
  const analytics = await dashboardService.getAnalytics(req.user!);
  return sendSuccess(res, analytics);
}
