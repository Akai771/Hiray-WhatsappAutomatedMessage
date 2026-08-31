import type { EntityStatus, Role } from "../../../shared/constants";

export interface Faculty {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId: string | null;
  courseId: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

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
  role?: Role;
}

export interface ListFacultyFilter {
  branchId?: string;
  courseId?: string;
  status?: string;
}
