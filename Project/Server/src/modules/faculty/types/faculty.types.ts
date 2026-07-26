import type { EntityStatus, Role } from "../../../shared/constants";

export interface Faculty {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFacultyInput {
  name: string;
  email: string;
  password: string;
  branchId: string;
}

export interface UpdateFacultyInput {
  name?: string;
  branchId?: string;
  role?: Role;
}

export interface ListFacultyFilter {
  branchId?: string;
  status?: string;
}
