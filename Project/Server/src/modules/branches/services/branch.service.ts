import * as branchRepository from "../repositories/branch.repository";
import { ApiError } from "../../../shared/errors";
import type { CreateBranchInput, UpdateBranchInput } from "../types/branch.types";

export async function createBranch(input: CreateBranchInput) {
  return branchRepository.create(input);
}

export async function listBranches(page: number, limit: number, status?: string) {
  return branchRepository.findAll(page, limit, status);
}

export async function getBranch(id: string) {
  const branch = await branchRepository.findById(id);
  if (!branch) throw ApiError.notFound("Branch not found");
  return branch;
}

export async function updateBranch(id: string, input: UpdateBranchInput) {
  const branch = await branchRepository.update(id, input);
  if (!branch) throw ApiError.notFound("Branch not found");
  return branch;
}

export async function deleteBranch(id: string) {
  await getBranch(id);
  await branchRepository.remove(id);
}
