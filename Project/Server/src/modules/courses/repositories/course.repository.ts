import { supabaseAdmin } from "../../../config/supabase";
import { ApiError } from "../../../shared/errors";
import { buildPagination, type Pagination } from "../../../shared/responses";
import type { Course, CreateCourseInput, ListCoursesFilter, UpdateCourseInput } from "../types/course.types";

const TABLE = "courses";

function mapRow(row: any): Course {
  return {
    id: row.id,
    branchId: row.branch_id,
    name: row.name,
    code: row.code,
    totalYears: row.total_years,
    semestersPerYear: row.semesters_per_year,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function create(input: CreateCourseInput): Promise<Course> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      branch_id: input.branchId,
      name: input.name,
      code: input.code,
      total_years: input.totalYears,
      semesters_per_year: input.semestersPerYear,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw ApiError.conflict("Course code already exists in this branch");
    if (error.code === "23503") throw ApiError.badRequest("Branch does not exist");
    throw ApiError.internal("Failed to create course", error.message);
  }
  return mapRow(data);
}

export async function findAll(
  page: number,
  limit: number,
  filter: ListCoursesFilter,
): Promise<{ items: Course[]; pagination: Pagination }> {
  let query = supabaseAdmin.from(TABLE).select("*", { count: "exact" });
  if (filter.branchId) query = query.eq("branch_id", filter.branchId);
  if (filter.status) query = query.eq("status", filter.status);

  const from = (page - 1) * limit;
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, from + limit - 1);

  if (error) throw ApiError.internal("Failed to list courses", error.message);

  return {
    items: (data ?? []).map(mapRow),
    pagination: buildPagination(page, limit, count ?? 0),
  };
}

export async function findById(id: string): Promise<Course | null> {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw ApiError.internal("Failed to fetch course", error.message);
  return data ? mapRow(data) : null;
}

export async function update(id: string, input: UpdateCourseInput): Promise<Course | null> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.code !== undefined) patch.code = input.code;
  if (input.totalYears !== undefined) patch.total_years = input.totalYears;
  if (input.semestersPerYear !== undefined) patch.semesters_per_year = input.semestersPerYear;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabaseAdmin.from(TABLE).update(patch).eq("id", id).select().maybeSingle();

  if (error) {
    if (error.code === "23505") throw ApiError.conflict("Course code already exists in this branch");
    throw ApiError.internal("Failed to update course", error.message);
  }
  return data ? mapRow(data) : null;
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", id);
  if (error) {
    if (error.code === "23503") throw ApiError.conflict("Cannot delete a course with existing notifications");
    throw ApiError.internal("Failed to delete course", error.message);
  }
}
