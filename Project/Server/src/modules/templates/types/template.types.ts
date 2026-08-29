import type { TemplateCategory } from "../../../shared/constants";

export interface NotificationTemplate {
  id: string;
  name: string;
  whatsappTemplateName: string;
  category: TemplateCategory;
  variables: string[];
  // Approved template's body copy, placeholders included (e.g. "Hello {{1}},
  // ..."). Display-only — mirrors what's in WhatsApp Manager so the send UI
  // can preview it; not sent to the Graph API.
  bodyText: string;
  // When true, {{1}} is filled per-recipient with their own name
  // (student.name / parent.name) instead of one shared admin-typed value.
  // Only meaningful when `variables` is non-empty.
  autoFillRecipientName: boolean;
  attachmentAllowed: boolean;
  buttonAllowed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  name: string;
  whatsappTemplateName: string;
  category: TemplateCategory;
  variables: string[];
  bodyText: string;
  autoFillRecipientName: boolean;
  attachmentAllowed: boolean;
  buttonAllowed: boolean;
}

export interface UpdateTemplateInput {
  name?: string;
  whatsappTemplateName?: string;
  category?: TemplateCategory;
  variables?: string[];
  bodyText?: string;
  autoFillRecipientName?: boolean;
  attachmentAllowed?: boolean;
  buttonAllowed?: boolean;
}
