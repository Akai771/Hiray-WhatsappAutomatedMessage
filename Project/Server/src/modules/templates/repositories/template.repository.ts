import { supabaseAdmin } from "../../../config/supabase";
import { ApiError } from "../../../shared/errors";
import { buildPagination, type Pagination } from "../../../shared/responses";
import type { CreateTemplateInput, NotificationTemplate, UpdateTemplateInput } from "../types/template.types";

const TABLE = "notification_templates";

function mapRow(row: any): NotificationTemplate {
  return {
    id: row.id,
    name: row.name,
    whatsappTemplateName: row.whatsapp_template_name,
    category: row.category,
    variables: row.variables ?? [],
    bodyText: row.body_text ?? "",
    autoFillRecipientName: row.auto_fill_recipient_name ?? false,
    attachmentAllowed: row.attachment_allowed,
    buttonAllowed: row.button_allowed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function create(input: CreateTemplateInput): Promise<NotificationTemplate> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({
      name: input.name,
      whatsapp_template_name: input.whatsappTemplateName,
      category: input.category,
      variables: input.variables,
      body_text: input.bodyText,
      auto_fill_recipient_name: input.autoFillRecipientName,
      attachment_allowed: input.attachmentAllowed,
      button_allowed: input.buttonAllowed,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw ApiError.conflict("A template with this WhatsApp template name already exists");
    throw ApiError.internal("Failed to create template", error.message);
  }
  return mapRow(data);
}

export async function findAll(
  page: number,
  limit: number,
  category?: string,
): Promise<{ items: NotificationTemplate[]; pagination: Pagination }> {
  let query = supabaseAdmin.from(TABLE).select("*", { count: "exact" });
  if (category) query = query.eq("category", category);

  const from = (page - 1) * limit;
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, from + limit - 1);

  if (error) throw ApiError.internal("Failed to list templates", error.message);

  return {
    items: (data ?? []).map(mapRow),
    pagination: buildPagination(page, limit, count ?? 0),
  };
}

export async function findById(id: string): Promise<NotificationTemplate | null> {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw ApiError.internal("Failed to fetch template", error.message);
  return data ? mapRow(data) : null;
}

export async function update(id: string, input: UpdateTemplateInput): Promise<NotificationTemplate | null> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.whatsappTemplateName !== undefined) patch.whatsapp_template_name = input.whatsappTemplateName;
  if (input.category !== undefined) patch.category = input.category;
  if (input.variables !== undefined) patch.variables = input.variables;
  if (input.bodyText !== undefined) patch.body_text = input.bodyText;
  if (input.autoFillRecipientName !== undefined) patch.auto_fill_recipient_name = input.autoFillRecipientName;
  if (input.attachmentAllowed !== undefined) patch.attachment_allowed = input.attachmentAllowed;
  if (input.buttonAllowed !== undefined) patch.button_allowed = input.buttonAllowed;

  const { data, error } = await supabaseAdmin.from(TABLE).update(patch).eq("id", id).select().maybeSingle();

  if (error) {
    if (error.code === "23505") throw ApiError.conflict("A template with this WhatsApp template name already exists");
    throw ApiError.internal("Failed to update template", error.message);
  }
  return data ? mapRow(data) : null;
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", id);
  if (error) {
    if (error.code === "23503") throw ApiError.conflict("Cannot delete a template used by existing notifications");
    throw ApiError.internal("Failed to delete template", error.message);
  }
}
