import * as courseRepository from "../repositories/course.repository";
import { ApiError } from "../../../shared/errors";
import { resolveBranchScope } from "../../../middleware/branchScope";
import { generateSemesters } from "../../../shared/utils";
import type { AuthUser } from "../../../shared/types";
import type { CourseWithSemesters, CreateCourseInput, UpdateCourseInput } from "../types/course.types";

function withSemesters(course: Awaited<ReturnType<typeof courseRepository.findById>>): CourseWithSemesters {
  if (!course) throw ApiError.notFound("Course not found");
  return { ...course, semesters: generateSemesters(course.totalYears, course.semestersPerYear) };
}

export async function createCourse(input: CreateCourseInput) {
  const course = await courseRepository.create(input);
  return withSemesters(course);
}

export async function listCourses(user: AuthUser, page: number, limit: number, requestedBranchId?: string, status?: string) {
  const branchId = resolveBranchScope(user, requestedBranchId);
  const { items, pagination } = await courseRepository.findAll(page, limit, { branchId, status });
  return { items: items.map((course) => withSemesters(course)), pagination };
}

export async function getCourse(user: AuthUser, id: string) {
  const course = await courseRepository.findById(id);
  if (!course) throw ApiError.notFound("Course not found");
  resolveBranchScope(user, course.branchId);
  return withSemesters(course);
}

export async function updateCourse(id: string, input: UpdateCourseInput) {
  const course = await courseRepository.update(id, input);
  return withSemesters(course);
}

export async function deleteCourse(id: string) {
  const course = await courseRepository.findById(id);
  if (!course) throw ApiError.notFound("Course not found");
  await courseRepository.remove(id);
}
