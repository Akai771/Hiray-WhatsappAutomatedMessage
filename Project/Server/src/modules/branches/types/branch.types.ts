import type { EntityStatus } from "../../../shared/constants";

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

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
