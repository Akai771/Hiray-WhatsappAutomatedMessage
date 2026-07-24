import { apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost } from "./apiClient";
import type { ApiBranch, EntityStatus, PaginatedEnvelope } from "./types";

export interface CreateBranchInput {
  name: string;
  code: string;
  address?: string;
}

export interface UpdateBranchInput {
  name?: string;
  code?: string;
  address?: string;
  status?: EntityStatus;
}

export function listBranches(page = 1, limit = 20, status?: EntityStatus): Promise<PaginatedEnvelope<ApiBranch>> {
  return apiGetPaginated<ApiBranch>("/branches", { page, limit, status });
}

export async function getBranch(id: string): Promise<ApiBranch> {
  const { data } = await apiGet<ApiBranch>(`/branches/${id}`);
  return data;
}

export async function createBranch(input: CreateBranchInput): Promise<ApiBranch> {
  const { data } = await apiPost<ApiBranch>("/branches", input);
  return data;
}

export async function updateBranch(id: string, input: UpdateBranchInput): Promise<ApiBranch> {
  const { data } = await apiPatch<ApiBranch>(`/branches/${id}`, input);
  return data;
}

export async function deleteBranch(id: string): Promise<void> {
  await apiDelete<null>(`/branches/${id}`);
}
