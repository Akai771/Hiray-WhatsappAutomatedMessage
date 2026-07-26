import type { EntityStatus, ParentRelation } from "../../../shared/constants";

export interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  relation: ParentRelation | null;
  linkedStudentId: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

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
  status?: string;
  search?: string;
}
