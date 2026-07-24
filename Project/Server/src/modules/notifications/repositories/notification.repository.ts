import { supabaseAdmin } from "../../../config/supabase";
import { ApiError } from "../../../shared/errors";
import { buildPagination, type Pagination } from "../../../shared/responses";
import type { CreateNotificationInput, Notification } from "../types/notification.types";

const TABLE = "notifications";

function mapRow(row: any): Notification {
  return {
    id: row.id,
    templateId: row.template_id,
    title: row.title,
    message: row.message,
    attachmentUrl: row.attachment_url,
    attachmentType: row.attachment_type,
    buttonLabel: row.button_label,
    buttonUrl: row.button_url,
    branchId: row.branch_id,
    courseId: row.course_id,
    targetYear: row.target_year,
    targetSemester: row.target_semester,
    audience: row.audience ?? [],
    createdBy: row.created_by,
    scheduledAt: row.scheduled_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function create(input: CreateNotificationInput, status: string): Promise<Notification> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      template_id: input.templateId,
      title: input.title,
      message: input.message,
      attachment_url: input.attachmentUrl ?? null,
      attachment_type: input.attachmentType ?? null,
      button_label: input.buttonLabel ?? null,
      button_url: input.buttonUrl ?? null,
      branch_id: input.branchId ?? null,
      course_id: input.courseId ?? null,
      target_year: input.targetYear ?? null,
      target_semester: input.targetSemester ?? null,
      audience: input.audience,
      created_by: input.createdBy,
      scheduled_at: input.scheduledAt ?? null,
      status,
    })
    .select()
    .single();

  if (error) throw ApiError.internal("Failed to create notification", error.message);
  return mapRow(data);
}

export async function findById(id: string): Promise<Notification | null> {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw ApiError.internal("Failed to fetch notification", error.message);
  return data ? mapRow(data) : null;
}

export async function findAll(
  page: number,
  limit: number,
  filter: { branchId?: string; status?: string },
): Promise<{ items: Notification[]; pagination: Pagination }> {
  let query = supabaseAdmin.from(TABLE).select("*", { count: "exact" });
  if (filter.branchId) query = query.eq("branch_id", filter.branchId);
  if (filter.status) query = query.eq("status", filter.status);

  const from = (page - 1) * limit;
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, from + limit - 1);

  if (error) throw ApiError.internal("Failed to list notifications", error.message);

  return {
    items: (data ?? []).map(mapRow),
    pagination: buildPagination(page, limit, count ?? 0),
  };
}

export async function updateStatus(id: string, status: string): Promise<Notification | null> {
  const { data, error } = await supabaseAdmin.from(TABLE).update({ status }).eq("id", id).select().maybeSingle();
  if (error) throw ApiError.internal("Failed to update notification status", error.message);
  return data ? mapRow(data) : null;
}
