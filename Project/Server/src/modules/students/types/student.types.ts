import type { StudentStatus } from "../../../shared/constants";

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  phone: string;
  email: string | null;
  branchId: string;
  courseId: string;
  year: number;
  semester: number;
  division: string | null;
  gender: string | null;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
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
  status?: string;
  search?: string;
}

export interface ImportStudentsResult {
  imported: number;
  failed: number;
  errors: { row: number; message: string }[];
}
