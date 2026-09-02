import type { TemplateCategory } from "../../../shared/constants";

export interface NotificationTemplate {
  id: string;
  name: string;
  whatsappTemplateName: string;
  category: TemplateCategory;
  // Locale the template was actually APPROVED under in WhatsApp Manager
  // (e.g. "en_US", "en") — must match exactly, or the Graph API rejects the
  // send even though the template name is correct. Defaults to "en_US" but
  // is not always right; check Manager per template.
  languageCode: string;
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
  // Only meaningful when buttonAllowed is true. false = the approved button
  // has one fixed URL baked in — WhatsApp rejects any button parameter sent
  // with it. true = the approved URL ends in {{1}}, a suffix filled per-send.
  buttonUrlIsDynamic: boolean;
  // Whether the approved template has a TEXT header component. The Send
  // page's "Title" field is always an internal label (never sent to
  // WhatsApp) — this only controls whether the live preview shows it as a
  // header, matching whether the real message will.
  hasTextHeader: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  name: string;
  whatsappTemplateName: string;
  category: TemplateCategory;
  languageCode: string;
  variables: string[];
  bodyText: string;
  autoFillRecipientName: boolean;
  attachmentAllowed: boolean;
  buttonAllowed: boolean;
  buttonUrlIsDynamic: boolean;
  hasTextHeader: boolean;
}

export interface UpdateTemplateInput {
  name?: string;
  whatsappTemplateName?: string;
  category?: TemplateCategory;
  languageCode?: string;
  variables?: string[];
  bodyText?: string;
  autoFillRecipientName?: boolean;
  attachmentAllowed?: boolean;
  buttonAllowed?: boolean;
  buttonUrlIsDynamic?: boolean;
  hasTextHeader?: boolean;
}
