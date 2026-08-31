import { apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost } from "./apiClient";
import type { ApiParent, EntityStatus, ParentRelation, PaginatedEnvelope } from "./types";

export interface CreateParentInput {
  name: string;
  phone: string;
  email?: string;
  relation?: ParentRelation;
  linkedStudentId: string;
}

export interface UpdateParentInput {
  name?: string;
  phone?: string;
  email?: string;
  relation?: ParentRelation;
  linkedStudentId?: string;
  status?: EntityStatus;
}

export interface ListParentsFilter {
  branchId?: string;
  linkedStudentId?: string;
  status?: EntityStatus;
  relation?: ParentRelation;
  search?: string;
}

export function listParents(
  page = 1,
  limit = 20,
  filter: ListParentsFilter = {},
): Promise<PaginatedEnvelope<ApiParent>> {
  return apiGetPaginated<ApiParent>("/parents", { page, limit, ...filter });
}

export async function getParent(id: string): Promise<ApiParent> {
  const { data } = await apiGet<ApiParent>(`/parents/${id}`);
  return data;
}

export async function createParent(input: CreateParentInput): Promise<ApiParent> {
  const { data } = await apiPost<ApiParent>("/parents", input);
  return data;
}

export async function updateParent(id: string, input: UpdateParentInput): Promise<ApiParent> {
  const { data } = await apiPatch<ApiParent>(`/parents/${id}`, input);
  return data;
}

export async function deleteParent(id: string): Promise<void> {
  await apiDelete<null>(`/parents/${id}`);
}

export async function bulkDeleteParents(ids: string[]): Promise<number> {
  const { data } = await apiPost<{ deleted: number }>("/parents/bulk-delete", { ids });
  return data.deleted;
}
