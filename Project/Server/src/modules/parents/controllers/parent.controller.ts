import type { Request, Response } from "express";
import * as parentService from "../services/parent.service";
import { sendSuccess, sendPaginated } from "../../../shared/responses";

export async function create(req: Request, res: Response) {
  const parent = await parentService.createParent(req.user!, req.body);
  return sendSuccess(res, parent, "Parent created", 201);
}

export async function list(req: Request, res: Response) {
  const { page, limit, branchId, linkedStudentId, status, search } = req.query as unknown as {
    page: number;
    limit: number;
    branchId?: string;
    linkedStudentId?: string;
    status?: string;
    search?: string;
  };
  const { items, pagination } = await parentService.listParents(req.user!, page, limit, {
    branchId,
    linkedStudentId,
    status,
    search,
  });
  return sendPaginated(res, items, pagination);
}

export async function getById(req: Request, res: Response) {
  const parent = await parentService.getParent(req.user!, req.params.id as string);
  return sendSuccess(res, parent);
}

export async function update(req: Request, res: Response) {
  const parent = await parentService.updateParent(req.user!, req.params.id as string, req.body);
  return sendSuccess(res, parent, "Parent updated");
}

export async function remove(req: Request, res: Response) {
  await parentService.deleteParent(req.user!, req.params.id as string);
  return sendSuccess(res, null, "Parent deleted");
}

export async function bulkRemove(req: Request, res: Response) {
  const count = await parentService.bulkDeleteParents(req.user!, req.body.ids);
  return sendSuccess(res, { deleted: count }, "Parents deleted");
}
