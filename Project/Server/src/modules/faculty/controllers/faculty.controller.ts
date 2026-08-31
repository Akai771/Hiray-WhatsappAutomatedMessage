import type { Request, Response } from "express";
import * as facultyService from "../services/faculty.service";
import { sendSuccess, sendPaginated } from "../../../shared/responses";

export async function create(req: Request, res: Response) {
  const faculty = await facultyService.createFaculty(req.body);
  return sendSuccess(res, faculty, "Faculty account created", 201);
}

export async function list(req: Request, res: Response) {
  const { page, limit, branchId, status, courseId } = req.query as unknown as {
    page: number;
    limit: number;
    branchId?: string;
    status?: string;
    courseId?: string;
  };
  const { items, pagination } = await facultyService.listFaculty(page, limit, branchId, status, courseId);
  return sendPaginated(res, items, pagination);
}

export async function getById(req: Request, res: Response) {
  const faculty = await facultyService.getFaculty((req.params.id as string));
  return sendSuccess(res, faculty);
}

export async function update(req: Request, res: Response) {
  const faculty = await facultyService.updateFaculty((req.params.id as string), req.body);
  return sendSuccess(res, faculty, "Faculty updated");
}

export async function updateStatus(req: Request, res: Response) {
  const faculty = await facultyService.setFacultyStatus((req.params.id as string), req.body.status);
  return sendSuccess(res, faculty, "Faculty status updated");
}

export async function resetPassword(req: Request, res: Response) {
  const faculty = await facultyService.resetFacultyPassword((req.params.id as string), req.body.password);
  return sendSuccess(res, faculty, "Password reset");
}

export async function remove(req: Request, res: Response) {
  await facultyService.deleteFaculty(req.user!.id, req.params.id as string);
  return sendSuccess(res, null, "Faculty account deleted");
}
