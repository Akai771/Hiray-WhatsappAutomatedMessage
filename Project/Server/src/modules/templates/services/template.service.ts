import * as templateRepository from "../repositories/template.repository";
import { ApiError } from "../../../shared/errors";
import type { CreateTemplateInput, UpdateTemplateInput } from "../types/template.types";

export async function createTemplate(input: CreateTemplateInput) {
  return templateRepository.create(input);
}

export async function listTemplates(page: number, limit: number, category?: string) {
  return templateRepository.findAll(page, limit, category);
}

export async function getTemplate(id: string) {
  const template = await templateRepository.findById(id);
  if (!template) throw ApiError.notFound("Template not found");
  return template;
}

export async function updateTemplate(id: string, input: UpdateTemplateInput) {
  const template = await templateRepository.update(id, input);
  if (!template) throw ApiError.notFound("Template not found");
  return template;
}

export async function deleteTemplate(id: string) {
  await getTemplate(id);
  await templateRepository.remove(id);
}
