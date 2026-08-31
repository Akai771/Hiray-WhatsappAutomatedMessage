import { apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost } from "./apiClient";
import type { ApiFaculty, ApiRole, EntityStatus, PaginatedEnvelope } from "./types";

export interface CreateFacultyInput {
  name: string;
  email: string;
  password: string;
  branchId: string;
  courseId?: string;
}

export interface UpdateFacultyInput {
  name?: string;
  branchId?: string;
  courseId?: string | null;
  role?: ApiRole;
}

export function listFaculty(
  page = 1,
  limit = 20,
  branchId?: string,
  status?: EntityStatus,
  courseId?: string,
): Promise<PaginatedEnvelope<ApiFaculty>> {
  return apiGetPaginated<ApiFaculty>("/faculty", { page, limit, branchId, status, courseId });
}

export async function getFaculty(id: string): Promise<ApiFaculty> {
  const { data } = await apiGet<ApiFaculty>(`/faculty/${id}`);
  return data;
}

export async function createFaculty(input: CreateFacultyInput): Promise<ApiFaculty> {
  const { data } = await apiPost<ApiFaculty>("/faculty", input);
  return data;
}

export async function updateFaculty(id: string, input: UpdateFacultyInput): Promise<ApiFaculty> {
  const { data } = await apiPatch<ApiFaculty>(`/faculty/${id}`, input);
  return data;
}

export async function setFacultyStatus(id: string, status: EntityStatus): Promise<ApiFaculty> {
  const { data } = await apiPatch<ApiFaculty>(`/faculty/${id}/status`, { status });
  return data;
}

export async function deleteFaculty(id: string): Promise<void> {
  await apiDelete(`/faculty/${id}`);
}

export async function resetFacultyPassword(id: string, password: string): Promise<ApiFaculty> {
  const { data } = await apiPatch<ApiFaculty>(`/faculty/${id}/reset-password`, { password });
  return data;
}
