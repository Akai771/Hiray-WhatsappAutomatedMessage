import type { Request, Response } from "express";
import * as templateService from "../services/template.service";
import { sendSuccess, sendPaginated } from "../../../shared/responses";

export async function create(req: Request, res: Response) {
  const template = await templateService.createTemplate(req.body);
  return sendSuccess(res, template, "Template created", 201);
}

export async function list(req: Request, res: Response) {
  const { page, limit, category } = req.query as unknown as { page: number; limit: number; category?: string };
  const { items, pagination } = await templateService.listTemplates(page, limit, category);
  return sendPaginated(res, items, pagination);
}

export async function getById(req: Request, res: Response) {
  const template = await templateService.getTemplate((req.params.id as string));
  return sendSuccess(res, template);
}

export async function update(req: Request, res: Response) {
  const template = await templateService.updateTemplate((req.params.id as string), req.body);
  return sendSuccess(res, template, "Template updated");
}

export async function remove(req: Request, res: Response) {
  await templateService.deleteTemplate((req.params.id as string));
  return sendSuccess(res, null, "Template deleted");
}
