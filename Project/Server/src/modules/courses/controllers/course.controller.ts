import type { Request, Response } from "express";
import * as courseService from "../services/course.service";
import { sendSuccess, sendPaginated } from "../../../shared/responses";

export async function create(req: Request, res: Response) {
  const course = await courseService.createCourse(req.body);
  return sendSuccess(res, course, "Course created", 201);
}

export async function list(req: Request, res: Response) {
  const { page, limit, branchId, status } = req.query as unknown as {
    page: number;
    limit: number;
    branchId?: string;
    status?: string;
  };
  const { items, pagination } = await courseService.listCourses(req.user!, page, limit, branchId, status);
  return sendPaginated(res, items, pagination);
}

export async function getById(req: Request, res: Response) {
  const course = await courseService.getCourse(req.user!, (req.params.id as string));
  return sendSuccess(res, course);
}

export async function update(req: Request, res: Response) {
  const course = await courseService.updateCourse((req.params.id as string), req.body);
  return sendSuccess(res, course, "Course updated");
}

export async function remove(req: Request, res: Response) {
  await courseService.deleteCourse((req.params.id as string));
  return sendSuccess(res, null, "Course deleted");
}
