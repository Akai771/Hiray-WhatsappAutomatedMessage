import * as studentRepository from "../repositories/student.repository";
import * as courseRepository from "../../courses/repositories/course.repository";
import * as branchRepository from "../../branches/repositories/branch.repository";
import { resolveBranchScope } from "../../../middleware/branchScope";
import { ApiError } from "../../../shared/errors";
import type { AuthUser } from "../../../shared/types";
import type { Course } from "../../courses/types/course.types";
import type {
  CreateStudentInput,
  ImportStudentsResult,
  ListStudentsFilter,
  PromoteStudentsInput,
  PromoteStudentsResult,
  UpdateStudentInput,
} from "../types/student.types";
import { buildImportTemplate, parseImportFile } from "../utils/spreadsheet";

export async function createStudent(user: AuthUser, input: CreateStudentInput) {
  const branchId = resolveBranchScope(user, input.branchId);
  if (!branchId) throw ApiError.badRequest("branchId is required");
  return studentRepository.create({ ...input, branchId });
}

export async function listStudents(
  user: AuthUser,
  page: number,
  limit: number,
  filter: Omit<ListStudentsFilter, "branchId"> & { branchId?: string },
) {
  const branchId = resolveBranchScope(user, filter.branchId);
  return studentRepository.findAll(page, limit, { ...filter, branchId });
}

async function getScopedStudent(user: AuthUser, id: string) {
  const student = await studentRepository.findById(id);
  if (!student) throw ApiError.notFound("Student not found");
  resolveBranchScope(user, student.branchId);
  return student;
}

export async function getStudent(user: AuthUser, id: string) {
  return getScopedStudent(user, id);
}

export async function updateStudent(user: AuthUser, id: string, input: UpdateStudentInput) {
  await getScopedStudent(user, id);

  // A requested branchId still goes through resolveBranchScope — a
  // SUPER_ADMIN's choice is honored, but Faculty can never move a student
  // out of (or into) a branch other than their own, no matter what the
  // client sends.
  const patch = { ...input };
  if (input.branchId !== undefined) {
    const branchId = resolveBranchScope(user, input.branchId);
    if (!branchId) throw ApiError.badRequest("branchId is required");
    patch.branchId = branchId;
  }

  const student = await studentRepository.update(id, patch);
  if (!student) throw ApiError.notFound("Student not found");
  return student;
}

export async function deleteStudent(user: AuthUser, id: string) {
  await getScopedStudent(user, id);
  await studentRepository.remove(id);
}

// Bulk-promotes an entire cohort (one course × year × semester) to the next
// semester, or graduates it if that semester was the course's last — instead
// of requiring every student to be selected and edited one at a time.
export async function promoteStudents(user: AuthUser, input: PromoteStudentsInput): Promise<PromoteStudentsResult> {
  const course = await courseRepository.findById(input.courseId);
  if (!course) throw ApiError.notFound("Course not found");
  // Faculty can only promote cohorts within their own branch's course.
  resolveBranchScope(user, course.branchId);

  // `semester` is course-wide absolute (Year 2 Sem 1 of a 2-sem/year course
  // is semester 3, never reset back to 1) — matches
  // shared/utils/academicStructure.ts's generateSemesters and what's
  // actually stored on every student row. `year` is redundant with it but
  // still validated for consistency, since the client sends both.
  const totalSemesters = course.totalYears * course.semestersPerYear;
  const expectedYear = Math.ceil(input.semester / course.semestersPerYear);
  if (input.semester < 1 || input.semester > totalSemesters || expectedYear !== input.year) {
    throw ApiError.badRequest(`Invalid year/semester for a course with ${course.totalYears} year(s) × ${course.semestersPerYear} semester(s)`);
  }

  const nextSemester = input.semester + 1;
  if (nextSemester > totalSemesters) {
    const graduated = await studentRepository.graduateCohort(input.courseId, input.year, input.semester);
    return { promoted: 0, graduated, newYear: null, newSemester: null };
  }

  const newYear = Math.ceil(nextSemester / course.semestersPerYear);
  const promoted = await studentRepository.promoteCohort(input.courseId, input.year, input.semester, newYear, nextSemester);
  return { promoted, graduated: 0, newYear, newSemester: nextSemester };
}

export async function bulkDeleteStudents(user: AuthUser, ids: string[]) {
  // Verify branch scope on every id individually — a Faculty account must
  // not be able to delete another branch's students by guessing UUIDs.
  await Promise.all(ids.map((id) => getScopedStudent(user, id)));
  return studentRepository.removeMany(ids);
}

export async function getImportTemplate(): Promise<Buffer> {
  return await buildImportTemplate();
}

export async function importStudents(user: AuthUser, fileBuffer: Buffer): Promise<ImportStudentsResult> {
  // Branch and course travel per row as codes (e.g. "BE" / "CS"), not ids —
  // a single sheet can span multiple branches, and Faculty gets rejected
  // per-row by resolveBranchScope rather than blocked from importing at all.
  const { items: branches } = await branchRepository.findAll(1, 100);
  const branchByCode = new Map(branches.map((b) => [b.code.toUpperCase(), b]));
  const coursesByBranchId = new Map<string, Map<string, Course>>();

  const rows = await parseImportFile(fileBuffer);
  const result: ImportStudentsResult = { imported: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // header occupies row 1
    const raw = rows[i]!;
    try {
      const rollNo = String(raw.rollNo ?? "").trim();
      const name = String(raw.name ?? "").trim();
      const phone = String(raw.phone ?? "").trim();
      const branchCode = String(raw.branch_code ?? "").trim().toUpperCase();
      const courseCode = String(raw.course_code ?? "").trim().toUpperCase();
      const year = Number(raw.year);
      const semester = Number(raw.semester);

      if (!rollNo || !name || !phone || !branchCode || !courseCode || !Number.isFinite(year) || !Number.isFinite(semester)) {
        throw new Error("Missing required field(s): rollNo, name, phone, branch_id, course_id, year, semester");
      }

      const branch = branchByCode.get(branchCode);
      if (!branch) throw new Error(`Unknown branch code "${branchCode}"`);
      const branchId = resolveBranchScope(user, branch.id);
      if (!branchId) throw new Error(`branch code "${branchCode}" could not be resolved`);

      if (!coursesByBranchId.has(branchId)) {
        const { items } = await courseRepository.findAll(1, 100, { branchId });
        coursesByBranchId.set(branchId, new Map(items.map((c) => [c.code.toUpperCase(), c])));
      }
      const course = coursesByBranchId.get(branchId)!.get(courseCode);
      if (!course) throw new Error(`Unknown course code "${courseCode}" for branch "${branchCode}"`);

      const email = String(raw.email ?? "").trim();
      const gender = String(raw.gender ?? "").trim();

      await studentRepository.create({
        rollNo,
        name,
        phone,
        email: email || undefined,
        branchId,
        courseId: course.id,
        year,
        semester,
        gender: gender || undefined,
      });
      result.imported++;
    } catch (err) {
      result.failed++;
      result.errors.push({ row: rowNum, message: err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return result;
}
