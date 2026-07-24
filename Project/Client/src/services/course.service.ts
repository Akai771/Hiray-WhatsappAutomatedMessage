import { apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost } from "./apiClient";
import type { ApiCourse, EntityStatus, PaginatedEnvelope } from "./types";

export interface CreateCourseInput {
  branchId: string;
  name: string;
  code: string;
  totalYears: number;
  semestersPerYear: number;
}

export interface UpdateCourseInput {
  name?: string;
  code?: string;
  totalYears?: number;
  semestersPerYear?: number;
  status?: EntityStatus;
}

export function listCourses(
  page = 1,
  limit = 20,
  branchId?: string,
  status?: EntityStatus,
): Promise<PaginatedEnvelope<ApiCourse>> {
  return apiGetPaginated<ApiCourse>("/courses", { page, limit, branchId, status });
}

export async function getCourse(id: string): Promise<ApiCourse> {
  const { data } = await apiGet<ApiCourse>(`/courses/${id}`);
  return data;
}

export async function createCourse(input: CreateCourseInput): Promise<ApiCourse> {
  const { data } = await apiPost<ApiCourse>("/courses", input);
  return data;
}

export async function updateCourse(id: string, input: UpdateCourseInput): Promise<ApiCourse> {
  const { data } = await apiPatch<ApiCourse>(`/courses/${id}`, input);
  return data;
}

export async function deleteCourse(id: string): Promise<void> {
  await apiDelete<null>(`/courses/${id}`);
}
