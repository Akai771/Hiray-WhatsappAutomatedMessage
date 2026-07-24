import { supabaseAdmin } from "../../../config/supabase";
import { ApiError } from "../../../shared/errors";
import { buildPagination, type Pagination } from "../../../shared/responses";
import type { Branch, CreateBranchInput, UpdateBranchInput } from "../types/branch.types";

const TABLE = "branches";

function mapRow(row: any): Branch {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    address: row.address,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function create(input: CreateBranchInput): Promise<Branch> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({ name: input.name, code: input.code, address: input.address ?? null })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw ApiError.conflict("Branch code already exists");
    throw ApiError.internal("Failed to create branch", error.message);
  }
  return mapRow(data);
}

export async function findAll(
  page: number,
  limit: number,
  status?: string,
): Promise<{ items: Branch[]; pagination: Pagination }> {
  let query = supabaseAdmin.from(TABLE).select("*", { count: "exact" });
  if (status) query = query.eq("status", status);

  const from = (page - 1) * limit;
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, from + limit - 1);

  if (error) throw ApiError.internal("Failed to list branches", error.message);

  return {
    items: (data ?? []).map(mapRow),
    pagination: buildPagination(page, limit, count ?? 0),
  };
}

export async function findById(id: string): Promise<Branch | null> {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw ApiError.internal("Failed to fetch branch", error.message);
  return data ? mapRow(data) : null;
}

export async function update(id: string, input: UpdateBranchInput): Promise<Branch | null> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.code !== undefined) patch.code = input.code;
  if (input.address !== undefined) patch.address = input.address;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabaseAdmin.from(TABLE).update(patch).eq("id", id).select().maybeSingle();

  if (error) {
    if (error.code === "23505") throw ApiError.conflict("Branch code already exists");
    throw ApiError.internal("Failed to update branch", error.message);
  }
  return data ? mapRow(data) : null;
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw ApiError.conflict("Cannot delete a branch with existing courses or faculty");
    }
    throw ApiError.internal("Failed to delete branch", error.message);
  }
}
