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
