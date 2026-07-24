import * as facultyRepository from "../repositories/faculty.repository";
import { createAuthUser, deleteAuthUser } from "../../../integrations/auth";
import { ApiError } from "../../../shared/errors";
import { logger } from "../../../shared/logger";
import type { CreateFacultyInput, UpdateFacultyInput } from "../types/faculty.types";

export async function createFaculty(input: CreateFacultyInput) {
  const authUser = await createAuthUser(input.email, input.password);

  try {
    return await facultyRepository.createFacultyRow({
      id: authUser.id,
      name: input.name,
      email: input.email,
      branchId: input.branchId,
    });
  } catch (err) {
    // Keep the Supabase Auth user and the `faculty` table in sync — if the
    // profile row fails to insert, don't leave an orphaned auth account.
    await deleteAuthUser(authUser.id).catch((cleanupErr) =>
      logger.error("Failed to roll back orphaned auth user after faculty insert failure", cleanupErr),
    );
    throw err;
  }
}

export async function listFaculty(page: number, limit: number, branchId?: string, status?: string) {
  return facultyRepository.findAll(page, limit, { branchId, status });
}

export async function getFaculty(id: string) {
  const faculty = await facultyRepository.findById(id);
  if (!faculty) throw ApiError.notFound("Faculty not found");
  return faculty;
}

export async function updateFaculty(id: string, input: UpdateFacultyInput) {
  const faculty = await facultyRepository.update(id, input);
  if (!faculty) throw ApiError.notFound("Faculty not found");
  return faculty;
}

export async function setFacultyStatus(id: string, status: string) {
  const faculty = await facultyRepository.updateStatus(id, status);
  if (!faculty) throw ApiError.notFound("Faculty not found");
  return faculty;
}
