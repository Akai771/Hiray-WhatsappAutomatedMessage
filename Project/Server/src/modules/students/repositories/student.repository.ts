import { supabaseAdmin } from "../../../config/supabase";
import { ApiError } from "../../../shared/errors";
import { buildPagination, type Pagination } from "../../../shared/responses";
import type { CreateStudentInput, ListStudentsFilter, Student, UpdateStudentInput } from "../types/student.types";

const TABLE = "students";

function mapRow(row: any): Student {
  return {
    id: row.id,
    rollNo: row.roll_no,
    name: row.name,
    phone: row.phone,
    email: row.email,
    branchId: row.branch_id,
    courseId: row.course_id,
    year: row.year,
    semester: row.semester,
    division: row.division,
    gender: row.gender,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function create(input: CreateStudentInput): Promise<Student> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      roll_no: input.rollNo,
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      branch_id: input.branchId,
      course_id: input.courseId,
      year: input.year,
      semester: input.semester,
      division: input.division ?? null,
      gender: input.gender ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw ApiError.conflict("A student with this roll number already exists in this branch");
    if (error.code === "23503") throw ApiError.badRequest("Branch or course does not exist");
    throw ApiError.internal("Failed to create student", error.message);
  }
  return mapRow(data);
}

export async function findAll(
  page: number,
  limit: number,
  filter: ListStudentsFilter,
): Promise<{ items: Student[]; pagination: Pagination }> {
  let query = supabaseAdmin.from(TABLE).select("*", { count: "exact" });
  if (filter.branchId) query = query.eq("branch_id", filter.branchId);
  if (filter.courseId) query = query.eq("course_id", filter.courseId);
  if (filter.year) query = query.eq("year", filter.year);
  if (filter.semester) query = query.eq("semester", filter.semester);
  if (filter.status) query = query.eq("status", filter.status);
  if (filter.search) query = query.or(`name.ilike.%${filter.search}%,roll_no.ilike.%${filter.search}%`);

  const from = (page - 1) * limit;
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, from + limit - 1);

  if (error) throw ApiError.internal("Failed to list students", error.message);

  return {
    items: (data ?? []).map(mapRow),
    pagination: buildPagination(page, limit, count ?? 0),
  };
}

export async function findById(id: string): Promise<Student | null> {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw ApiError.internal("Failed to fetch student", error.message);
  return data ? mapRow(data) : null;
}

export async function update(id: string, input: UpdateStudentInput): Promise<Student | null> {
  const patch: Record<string, unknown> = {};
  if (input.rollNo !== undefined) patch.roll_no = input.rollNo;
  if (input.name !== undefined) patch.name = input.name;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.email !== undefined) patch.email = input.email;
  if (input.courseId !== undefined) patch.course_id = input.courseId;
  if (input.year !== undefined) patch.year = input.year;
  if (input.semester !== undefined) patch.semester = input.semester;
  if (input.division !== undefined) patch.division = input.division;
  if (input.gender !== undefined) patch.gender = input.gender;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabaseAdmin.from(TABLE).update(patch).eq("id", id).select().maybeSingle();

  if (error) {
    if (error.code === "23505") throw ApiError.conflict("A student with this roll number already exists in this branch");
    throw ApiError.internal("Failed to update student", error.message);
  }
  return data ? mapRow(data) : null;
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", id);
  if (error) throw ApiError.internal("Failed to delete student", error.message);
}

export async function removeMany(ids: string[]): Promise<number> {
  const { data, error } = await supabaseAdmin.from(TABLE).delete().in("id", ids).select("id");
  if (error) throw ApiError.internal("Failed to delete students", error.message);
  return data?.length ?? 0;
}
