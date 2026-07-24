import type { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { sendSuccess } from "../../../shared/responses";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const session = await authService.login(email, password);
  return sendSuccess(res, session, "Logged in successfully");
}

export async function logout(req: Request, res: Response) {
  const header = req.headers.authorization!;
  const token = header.slice("Bearer ".length);
  await authService.logout(token);
  return sendSuccess(res, null, "Logged out successfully");
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  const session = await authService.refresh(refreshToken);
  return sendSuccess(res, session, "Session refreshed");
}

export async function me(req: Request, res: Response) {
  return sendSuccess(res, req.user, "Current user");
}

export async function resetFacultyPassword(req: Request, res: Response) {
  const id = req.params.id as string;
  const { newPassword } = req.body;
  await authService.resetFacultyPassword(id, newPassword);
  return sendSuccess(res, null, "Password reset successfully");
}
