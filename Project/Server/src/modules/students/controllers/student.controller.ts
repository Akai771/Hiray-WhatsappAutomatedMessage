import type { Request, Response } from "express";
import * as studentService from "../services/student.service";
import { sendSuccess, sendPaginated } from "../../../shared/responses";
import { ApiError } from "../../../shared/errors";

export async function create(req: Request, res: Response) {
  const student = await studentService.createStudent(req.user!, req.body);
  return sendSuccess(res, student, "Student created", 201);
}

export async function list(req: Request, res: Response) {
  const { page, limit, branchId, courseId, year, semester, status, search } = req.query as unknown as {
    page: number;
    limit: number;
    branchId?: string;
    courseId?: string;
    year?: number;
    semester?: number;
    status?: string;
    search?: string;
  };
  const { items, pagination } = await studentService.listStudents(req.user!, page, limit, {
    branchId,
    courseId,
    year,
    semester,
    status,
    search,
  });
  return sendPaginated(res, items, pagination);
}

export async function getById(req: Request, res: Response) {
  const student = await studentService.getStudent(req.user!, req.params.id as string);
  return sendSuccess(res, student);
}

export async function update(req: Request, res: Response) {
  const student = await studentService.updateStudent(req.user!, req.params.id as string, req.body);
  return sendSuccess(res, student, "Student updated");
}

export async function remove(req: Request, res: Response) {
  await studentService.deleteStudent(req.user!, req.params.id as string);
  return sendSuccess(res, null, "Student deleted");
}

export async function bulkRemove(req: Request, res: Response) {
  const count = await studentService.bulkDeleteStudents(req.user!, req.body.ids);
  return sendSuccess(res, { deleted: count }, "Students deleted");
}

export async function importTemplate(_req: Request, res: Response) {
  const buffer = studentService.getImportTemplate();
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="students-import-template.xlsx"');
  return res.send(buffer);
}

export async function importStudents(req: Request, res: Response) {
  const file = req.file;
  if (!file) throw ApiError.badRequest("No file provided");
  const result = await studentService.importStudents(req.user!, file.buffer);
  return sendSuccess(res, result, "Import complete");
}
