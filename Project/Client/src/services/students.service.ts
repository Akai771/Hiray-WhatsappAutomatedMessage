import { apiDelete, apiDownload, apiGet, apiGetPaginated, apiPatch, apiPost, apiUpload } from "./apiClient";
import type { ApiStudent, PaginatedEnvelope, StudentStatus } from "./types";

export interface ImportStudentsResult {
  imported: number;
  failed: number;
  errors: { row: number; message: string }[];
}

export interface CreateStudentInput {
  rollNo: string;
  name: string;
  phone: string;
  email?: string;
  branchId: string;
  courseId: string;
  year: number;
  semester: number;
  division?: string;
  gender?: string;
}

export interface UpdateStudentInput {
  rollNo?: string;
  name?: string;
  phone?: string;
  email?: string;
  branchId?: string;
  courseId?: string;
  year?: number;
  semester?: number;
  division?: string;
  gender?: string;
  status?: StudentStatus;
}

export interface ListStudentsFilter {
  branchId?: string;
  courseId?: string;
  year?: number;
  semester?: number;
  status?: StudentStatus;
  search?: string;
}

export function listStudents(
  page = 1,
  limit = 20,
  filter: ListStudentsFilter = {},
): Promise<PaginatedEnvelope<ApiStudent>> {
  return apiGetPaginated<ApiStudent>("/students", { page, limit, ...filter });
}

export async function getStudent(id: string): Promise<ApiStudent> {
  const { data } = await apiGet<ApiStudent>(`/students/${id}`);
  return data;
}

export async function createStudent(input: CreateStudentInput): Promise<ApiStudent> {
  const { data } = await apiPost<ApiStudent>("/students", input);
  return data;
}

export async function updateStudent(id: string, input: UpdateStudentInput): Promise<ApiStudent> {
  const { data } = await apiPatch<ApiStudent>(`/students/${id}`, input);
  return data;
}

export async function deleteStudent(id: string): Promise<void> {
  await apiDelete<null>(`/students/${id}`);
}

export async function bulkDeleteStudents(ids: string[]): Promise<number> {
  const { data } = await apiPost<{ deleted: number }>("/students/bulk-delete", { ids });
  return data.deleted;
}

export interface PromoteStudentsInput {
  courseId: string;
  year: number;
  semester: number;
}

export interface PromoteStudentsResult {
  promoted: number;
  graduated: number;
  newYear: number | null;
  newSemester: number | null;
}

export async function promoteStudents(input: PromoteStudentsInput): Promise<PromoteStudentsResult> {
  const { data } = await apiPost<PromoteStudentsResult>("/students/promote", input);
  return data;
}

export async function importStudents(file: File): Promise<ImportStudentsResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiUpload<ImportStudentsResult>("/students/import", formData);
  return data;
}

export async function downloadImportTemplate(): Promise<Blob> {
  return apiDownload("/students/import-template");
}
