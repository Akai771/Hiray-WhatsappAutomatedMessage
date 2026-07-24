import { apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost } from "./apiClient";
import type { ApiNotificationTemplate, PaginatedEnvelope, TemplateCategory } from "./types";

export interface CreateTemplateInput {
  name: string;
  whatsappTemplateName: string;
  category: TemplateCategory;
  variables: string[];
  attachmentAllowed: boolean;
  buttonAllowed: boolean;
}

export type UpdateTemplateInput = Partial<CreateTemplateInput>;

export function listTemplates(
  page = 1,
  limit = 20,
  category?: TemplateCategory,
): Promise<PaginatedEnvelope<ApiNotificationTemplate>> {
  return apiGetPaginated<ApiNotificationTemplate>("/templates", { page, limit, category });
}

export async function getTemplate(id: string): Promise<ApiNotificationTemplate> {
  const { data } = await apiGet<ApiNotificationTemplate>(`/templates/${id}`);
  return data;
}

export async function createTemplate(input: CreateTemplateInput): Promise<ApiNotificationTemplate> {
  const { data } = await apiPost<ApiNotificationTemplate>("/templates", input);
  return data;
}

export async function updateTemplate(id: string, input: UpdateTemplateInput): Promise<ApiNotificationTemplate> {
  const { data } = await apiPatch<ApiNotificationTemplate>(`/templates/${id}`, input);
  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await apiDelete<null>(`/templates/${id}`);
}
