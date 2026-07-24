import type { TemplateCategory } from "../../../shared/constants";

export interface NotificationTemplate {
  id: string;
  name: string;
  whatsappTemplateName: string;
  category: TemplateCategory;
  variables: string[];
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
  attachmentAllowed: boolean;
  buttonAllowed: boolean;
}

export interface UpdateTemplateInput {
  name?: string;
  whatsappTemplateName?: string;
  category?: TemplateCategory;
  variables?: string[];
  attachmentAllowed?: boolean;
  buttonAllowed?: boolean;
}
