import * as parentRepository from "../repositories/parent.repository";
import * as studentRepository from "../../students/repositories/student.repository";
import { resolveBranchScope } from "../../../middleware/branchScope";
import { ApiError } from "../../../shared/errors";
import type { AuthUser } from "../../../shared/types";
import type { CreateParentInput, ListParentsFilter, UpdateParentInput } from "../types/parent.types";

async function assertLinkedStudentInScope(user: AuthUser, linkedStudentId: string) {
  const student = await studentRepository.findById(linkedStudentId);
  if (!student) throw ApiError.badRequest("Linked student does not exist");
  resolveBranchScope(user, student.branchId);
  return student;
}

export async function createParent(user: AuthUser, input: CreateParentInput) {
  await assertLinkedStudentInScope(user, input.linkedStudentId);
  return parentRepository.create(input);
}

export async function listParents(
  user: AuthUser,
  page: number,
  limit: number,
  filter: Omit<ListParentsFilter, "branchId"> & { branchId?: string },
) {
  const branchId = resolveBranchScope(user, filter.branchId);
  return parentRepository.findAll(page, limit, { ...filter, branchId });
}

async function getScopedParent(user: AuthUser, id: string) {
  const parent = await parentRepository.findById(id);
  if (!parent) throw ApiError.notFound("Parent not found");
  await assertLinkedStudentInScope(user, parent.linkedStudentId);
  return parent;
}

export async function getParent(user: AuthUser, id: string) {
  return getScopedParent(user, id);
}

export async function updateParent(user: AuthUser, id: string, input: UpdateParentInput) {
  await getScopedParent(user, id);
  if (input.linkedStudentId) await assertLinkedStudentInScope(user, input.linkedStudentId);

  const parent = await parentRepository.update(id, input);
  if (!parent) throw ApiError.notFound("Parent not found");
  return parent;
}

export async function deleteParent(user: AuthUser, id: string) {
  await getScopedParent(user, id);
  await parentRepository.remove(id);
}

export async function bulkDeleteParents(user: AuthUser, ids: string[]) {
  await Promise.all(ids.map((id) => getScopedParent(user, id)));
  return parentRepository.removeMany(ids);
}
