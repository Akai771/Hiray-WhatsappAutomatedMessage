import { z } from "zod";
import { paginationQuerySchema } from "../../../shared/validators";
import { TEMPLATE_CATEGORY } from "../../../shared/constants";

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  whatsappTemplateName: z.string().min(1).max(200),
  category: z.enum([TEMPLATE_CATEGORY.UTILITY, TEMPLATE_CATEGORY.MARKETING]),
  variables: z.array(z.string().min(1)).default([]),
  attachmentAllowed: z.boolean().default(false),
  buttonAllowed: z.boolean().default(false),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  whatsappTemplateName: z.string().min(1).max(200).optional(),
  category: z.enum([TEMPLATE_CATEGORY.UTILITY, TEMPLATE_CATEGORY.MARKETING]).optional(),
  variables: z.array(z.string().min(1)).optional(),
  attachmentAllowed: z.boolean().optional(),
  buttonAllowed: z.boolean().optional(),
});

export const listTemplatesQuerySchema = paginationQuerySchema.extend({
  category: z.enum([TEMPLATE_CATEGORY.UTILITY, TEMPLATE_CATEGORY.MARKETING]).optional(),
});
