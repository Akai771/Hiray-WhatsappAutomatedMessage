import { supabaseAdmin } from "../../../config/supabase";
import { ApiError } from "../../../shared/errors";
import { ROLES } from "../../../shared/constants";
import { buildPagination, type Pagination } from "../../../shared/responses";
import type { Faculty, ListFacultyFilter, UpdateFacultyInput } from "../types/faculty.types";

const TABLE = "faculty";

function mapRow(row: any): Faculty {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    branchId: row.branch_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createFacultyRow(input: {
  id: string;
  name: string;
  email: string;
  branchId: string;
}): Promise<Faculty> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      id: input.id,
      name: input.name,
      email: input.email,
      role: ROLES.FACULTY,
      branch_id: input.branchId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw ApiError.conflict("A faculty account with this email already exists");
    throw ApiError.internal("Failed to create faculty record", error.message);
  }
  return mapRow(data);
}

export async function findAll(
  page: number,
  limit: number,
  filter: ListFacultyFilter,
): Promise<{ items: Faculty[]; pagination: Pagination }> {
  let query = supabaseAdmin.from(TABLE).select("*", { count: "exact" });
  if (filter.branchId) query = query.eq("branch_id", filter.branchId);
  if (filter.status) query = query.eq("status", filter.status);

  const from = (page - 1) * limit;
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, from + limit - 1);

  if (error) throw ApiError.internal("Failed to list faculty", error.message);

  return {
    items: (data ?? []).map(mapRow),
    pagination: buildPagination(page, limit, count ?? 0),
  };
}

export async function findById(id: string): Promise<Faculty | null> {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw ApiError.internal("Failed to fetch faculty", error.message);
  return data ? mapRow(data) : null;
}

export async function update(id: string, input: UpdateFacultyInput): Promise<Faculty | null> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.branchId !== undefined) patch.branch_id = input.branchId;
  if (input.role !== undefined) patch.role = input.role;

  const { data, error } = await supabaseAdmin.from(TABLE).update(patch).eq("id", id).select().maybeSingle();
  if (error) throw ApiError.internal("Failed to update faculty", error.message);
  return data ? mapRow(data) : null;
}

export async function updateStatus(id: string, status: string): Promise<Faculty | null> {
  const { data, error } = await supabaseAdmin.from(TABLE).update({ status }).eq("id", id).select().maybeSingle();
  if (error) throw ApiError.internal("Failed to update faculty status", error.message);
  return data ? mapRow(data) : null;
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", id);
  if (error) throw ApiError.internal("Failed to delete faculty record", error.message);
}
