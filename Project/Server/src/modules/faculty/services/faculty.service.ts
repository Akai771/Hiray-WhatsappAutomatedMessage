import * as facultyRepository from "../repositories/faculty.repository";
import * as courseRepository from "../../courses/repositories/course.repository";
import { createAuthUser, deleteAuthUser, setUserPassword } from "../../../integrations/auth";
import { ApiError } from "../../../shared/errors";
import { logger } from "../../../shared/logger";
import type { CreateFacultyInput, UpdateFacultyInput } from "../types/faculty.types";

// A faculty's course, if set, must actually belong to their branch — same
// "child scope must nest inside parent scope" check parents get against
// their linked student's branch.
async function assertCourseInBranch(courseId: string, branchId: string) {
  const course = await courseRepository.findById(courseId);
  if (!course) throw ApiError.badRequest("Course does not exist");
  if (course.branchId !== branchId) throw ApiError.badRequest("Course does not belong to the selected branch");
}

export async function createFaculty(input: CreateFacultyInput) {
  if (input.courseId) await assertCourseInBranch(input.courseId, input.branchId);

  const authUser = await createAuthUser(input.email, input.password);

  try {
    return await facultyRepository.createFacultyRow({
      id: authUser.id,
      name: input.name,
      email: input.email,
      branchId: input.branchId,
      courseId: input.courseId,
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

export async function listFaculty(page: number, limit: number, branchId?: string, status?: string, courseId?: string) {
  return facultyRepository.findAll(page, limit, { branchId, status, courseId });
}

export async function getFaculty(id: string) {
  const faculty = await facultyRepository.findById(id);
  if (!faculty) throw ApiError.notFound("Faculty not found");
  return faculty;
}

export async function updateFaculty(id: string, input: UpdateFacultyInput) {
  if (input.courseId) {
    const existing = await facultyRepository.findById(id);
    if (!existing) throw ApiError.notFound("Faculty not found");
    const branchId = input.branchId ?? existing.branchId;
    if (!branchId) throw ApiError.badRequest("Faculty must have a branch before a course can be set");
    await assertCourseInBranch(input.courseId, branchId);
  }

  const faculty = await facultyRepository.update(id, input);
  if (!faculty) throw ApiError.notFound("Faculty not found");
  return faculty;
}

export async function setFacultyStatus(id: string, status: string) {
  const faculty = await facultyRepository.updateStatus(id, status);
  if (!faculty) throw ApiError.notFound("Faculty not found");
  return faculty;
}

export async function resetFacultyPassword(id: string, newPassword: string) {
  const faculty = await facultyRepository.findById(id);
  if (!faculty) throw ApiError.notFound("Faculty not found");
  await setUserPassword(id, newPassword);
  return faculty;
}

export async function deleteFaculty(actorId: string, id: string) {
  if (actorId === id) throw ApiError.badRequest("You can't delete your own account");
  const faculty = await facultyRepository.findById(id);
  if (!faculty) throw ApiError.notFound("Faculty not found");

  await facultyRepository.remove(id);
  await deleteAuthUser(id).catch((err) => logger.error("Failed to delete auth user for removed faculty", err));
}
