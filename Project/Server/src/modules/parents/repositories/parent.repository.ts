import { supabaseAdmin } from "../../../config/supabase";
import { ApiError } from "../../../shared/errors";
import { buildPagination, type Pagination } from "../../../shared/responses";
import type { CreateParentInput, ListParentsFilter, Parent, UpdateParentInput } from "../types/parent.types";

const TABLE = "parents";

function mapRow(row: any): Parent {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    relation: row.relation,
    linkedStudentId: row.linked_student_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function create(input: CreateParentInput): Promise<Parent> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      relation: input.relation ?? null,
      linked_student_id: input.linkedStudentId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23503") throw ApiError.badRequest("Linked student does not exist");
    throw ApiError.internal("Failed to create parent", error.message);
  }
  return mapRow(data);
}

export async function findAll(
  page: number,
  limit: number,
  filter: ListParentsFilter,
): Promise<{ items: Parent[]; pagination: Pagination }> {
  // Faculty branch-scoping goes through the linked student's branch —
  // parents have no branch_id of their own.
  let query = filter.branchId
    ? supabaseAdmin
        .from(TABLE)
        .select("*, students!parents_linked_student_id_fkey!inner(branch_id)", { count: "exact" })
        .eq("students.branch_id", filter.branchId)
    : supabaseAdmin.from(TABLE).select("*", { count: "exact" });

  if (filter.linkedStudentId) query = query.eq("linked_student_id", filter.linkedStudentId);
  if (filter.status) query = query.eq("status", filter.status);
  if (filter.relation) query = query.eq("relation", filter.relation);
  if (filter.search) query = query.or(`name.ilike.%${filter.search}%,phone.ilike.%${filter.search}%`);

  const from = (page - 1) * limit;
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, from + limit - 1);

  if (error) throw ApiError.internal("Failed to list parents", error.message);

  return {
    items: (data ?? []).map(mapRow),
    pagination: buildPagination(page, limit, count ?? 0),
  };
}

export async function findById(id: string): Promise<Parent | null> {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw ApiError.internal("Failed to fetch parent", error.message);
  return data ? mapRow(data) : null;
}

export async function update(id: string, input: UpdateParentInput): Promise<Parent | null> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.email !== undefined) patch.email = input.email;
  if (input.relation !== undefined) patch.relation = input.relation;
  if (input.linkedStudentId !== undefined) patch.linked_student_id = input.linkedStudentId;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabaseAdmin.from(TABLE).update(patch).eq("id", id).select().maybeSingle();

  if (error) {
    if (error.code === "23503") throw ApiError.badRequest("Linked student does not exist");
    throw ApiError.internal("Failed to update parent", error.message);
  }
  return data ? mapRow(data) : null;
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", id);
  if (error) throw ApiError.internal("Failed to delete parent", error.message);
}

export async function removeMany(ids: string[]): Promise<number> {
  const { data, error } = await supabaseAdmin.from(TABLE).delete().in("id", ids).select("id");
  if (error) throw ApiError.internal("Failed to delete parents", error.message);
  return data?.length ?? 0;
}
