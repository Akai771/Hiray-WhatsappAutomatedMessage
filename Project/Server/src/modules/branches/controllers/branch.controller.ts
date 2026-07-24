import type { Request, Response } from "express";
import * as branchService from "../services/branch.service";
import { sendSuccess, sendPaginated } from "../../../shared/responses";

export async function create(req: Request, res: Response) {
  const branch = await branchService.createBranch(req.body);
  return sendSuccess(res, branch, "Branch created", 201);
}

export async function list(req: Request, res: Response) {
  const { page, limit, status } = req.query as unknown as { page: number; limit: number; status?: string };
  const { items, pagination } = await branchService.listBranches(page, limit, status);
  return sendPaginated(res, items, pagination);
}

export async function getById(req: Request, res: Response) {
  const branch = await branchService.getBranch((req.params.id as string));
  return sendSuccess(res, branch);
}

export async function update(req: Request, res: Response) {
  const branch = await branchService.updateBranch((req.params.id as string), req.body);
  return sendSuccess(res, branch, "Branch updated");
}

export async function remove(req: Request, res: Response) {
  await branchService.deleteBranch((req.params.id as string));
  return sendSuccess(res, null, "Branch deleted");
}
