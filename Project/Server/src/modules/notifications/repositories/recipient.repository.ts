import { supabaseAdmin } from "../../../config/supabase";
import { ApiError } from "../../../shared/errors";
import { RECIPIENT_TYPE, STUDENT_STATUS, type RecipientType } from "../../../shared/constants";

export interface RecipientFilter {
  branchId?: string;
  courseId?: string;
  year?: number;
  semester?: number;
  audience: RecipientType[];
}

export interface Recipient {
  recipientId: string;
  recipientType: RecipientType;
  phone: string;
  // The recipient's own name — student's name for a STUDENT recipient, the
  // parent's own name (not the student's) for a PARENT recipient. Used to
  // personalize a template's {{1}} per-recipient (autoFillRecipientName).
  name: string;
}

async function resolveStudents(filter: RecipientFilter): Promise<Recipient[]> {
  let query = supabaseAdmin.from("students").select("id, name, phone").eq("status", STUDENT_STATUS.ACTIVE);
  if (filter.branchId) query = query.eq("branch_id", filter.branchId);
  if (filter.courseId) query = query.eq("course_id", filter.courseId);
  if (filter.year) query = query.eq("year", filter.year);
  if (filter.semester) query = query.eq("semester", filter.semester);

  const { data, error } = await query;
  if (error) throw ApiError.internal("Failed to resolve student recipients", error.message);

  return (data ?? []).map((row) => ({
    recipientId: row.id,
    recipientType: RECIPIENT_TYPE.STUDENT,
    phone: row.phone,
    name: row.name,
  }));
}

async function resolveParents(filter: RecipientFilter): Promise<Recipient[]> {
  // Parents have no branch/course/year/semester of their own — scope
  // through the linked student via an inner join, same approach as
  // parent.repository.ts's branch-scoped listing.
  let query = supabaseAdmin
    .from("parents")
    .select("id, name, phone, students!parents_linked_student_id_fkey!inner(branch_id, course_id, year, semester, status)")
    .eq("status", "ACTIVE")
    .eq("students.status", STUDENT_STATUS.ACTIVE);

  if (filter.branchId) query = query.eq("students.branch_id", filter.branchId);
  if (filter.courseId) query = query.eq("students.course_id", filter.courseId);
  if (filter.year) query = query.eq("students.year", filter.year);
  if (filter.semester) query = query.eq("students.semester", filter.semester);

  const { data, error } = await query;
  if (error) throw ApiError.internal("Failed to resolve parent recipients", error.message);

  return (data ?? []).map((row: any) => ({
    recipientId: row.id,
    recipientType: RECIPIENT_TYPE.PARENT,
    phone: row.phone,
    name: row.name,
  }));
}

export interface RecipientCountFilter {
  branchId?: string;
  courseId?: string;
  year?: number;
  semester?: number;
}

// Same filter shape as resolveStudents/resolveParents above — head:true asks
// Supabase for just the row count, not the rows, so the Messages page can
// preview an accurate reach without pulling every matching record over the
// wire (and without depending on whatever page of the Students/Parents
// tables happens to be loaded client-side, which is what undercounted
// before this existed).
export async function countRecipients(filter: RecipientCountFilter): Promise<{ students: number; parents: number }> {
  let studentQuery = supabaseAdmin
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("status", STUDENT_STATUS.ACTIVE);
  if (filter.branchId) studentQuery = studentQuery.eq("branch_id", filter.branchId);
  if (filter.courseId) studentQuery = studentQuery.eq("course_id", filter.courseId);
  if (filter.year) studentQuery = studentQuery.eq("year", filter.year);
  if (filter.semester) studentQuery = studentQuery.eq("semester", filter.semester);

  let parentQuery = supabaseAdmin
    .from("parents")
    .select("id, students!parents_linked_student_id_fkey!inner(branch_id, course_id, year, semester, status)", {
      count: "exact",
      head: true,
    })
    .eq("status", "ACTIVE")
    .eq("students.status", STUDENT_STATUS.ACTIVE);
  if (filter.branchId) parentQuery = parentQuery.eq("students.branch_id", filter.branchId);
  if (filter.courseId) parentQuery = parentQuery.eq("students.course_id", filter.courseId);
  if (filter.year) parentQuery = parentQuery.eq("students.year", filter.year);
  if (filter.semester) parentQuery = parentQuery.eq("students.semester", filter.semester);

  const [studentResult, parentResult] = await Promise.all([studentQuery, parentQuery]);
  if (studentResult.error) throw ApiError.internal("Failed to count student recipients", studentResult.error.message);
  if (parentResult.error) throw ApiError.internal("Failed to count parent recipients", parentResult.error.message);

  return { students: studentResult.count ?? 0, parents: parentResult.count ?? 0 };
}

export async function resolveRecipients(filter: RecipientFilter): Promise<Recipient[]> {
  const results: Recipient[] = [];

  if (filter.audience.includes(RECIPIENT_TYPE.STUDENT)) {
    results.push(...(await resolveStudents(filter)));
  }
  if (filter.audience.includes(RECIPIENT_TYPE.PARENT)) {
    results.push(...(await resolveParents(filter)));
  }

  return results;
}
