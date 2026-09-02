import { z } from "zod";
import { paginationQuerySchema } from "../../../shared/validators";
import { TEMPLATE_CATEGORY } from "../../../shared/constants";

// WhatsApp rejects a send at #132000 when the number of body parameters sent
// doesn't match the approved template's actual {{n}} count — catching a
// variables/bodyText mismatch here, at template save time, is much cheaper
// than discovering it live against the Graph API.
function countPlaceholders(bodyText: string): number {
  const matches = bodyText.match(/\{\{\d+\}\}/g);
  return matches ? new Set(matches).size : 0;
}

export const createTemplateSchema = z
  .object({
    name: z.string().min(1).max(200),
    whatsappTemplateName: z.string().min(1).max(200),
    category: z.enum([TEMPLATE_CATEGORY.UTILITY, TEMPLATE_CATEGORY.MARKETING]),
    // Must match the locale this template was actually APPROVED under in
    // WhatsApp Manager (e.g. "en_US", "en") — a mismatch here makes every
    // send to this template fail at the Graph API, name notwithstanding.
    languageCode: z.string().min(2).max(10).default("en_US"),
    // One label per {{n}} placeholder, in order — e.g. ["Recipient Name",
    // "Exam Name", "Start Date", "End Date"] for a 4-variable template.
    variables: z.array(z.string().min(1)).default([]),
    // Copy-pasted from the approved template in WhatsApp Manager, placeholders
    // ({{1}}, {{2}}, ...) included. Required so the send UI can preview real
    // content instead of a blank box.
    bodyText: z.string().min(1).max(1024),
    autoFillRecipientName: z.boolean().default(false),
    attachmentAllowed: z.boolean().default(false),
    buttonAllowed: z.boolean().default(false),
    buttonUrlIsDynamic: z.boolean().default(false),
    hasTextHeader: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const count = countPlaceholders(data.bodyText);
    if (count !== data.variables.length) {
      ctx.addIssue({
        code: "custom",
        path: ["variables"],
        message: `Body text has ${count} placeholder(s) but ${data.variables.length} variable label(s) were given — they must match.`,
      });
    }
    // A WhatsApp template has at most one header component — TEXT or media,
    // never both.
    if (data.hasTextHeader && data.attachmentAllowed) {
      ctx.addIssue({
        code: "custom",
        path: ["hasTextHeader"],
        message: "A template can have a text header or a media header, not both.",
      });
    }
  });

export const updateTemplateSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    whatsappTemplateName: z.string().min(1).max(200).optional(),
    category: z.enum([TEMPLATE_CATEGORY.UTILITY, TEMPLATE_CATEGORY.MARKETING]).optional(),
    languageCode: z.string().min(2).max(10).optional(),
    variables: z.array(z.string().min(1)).optional(),
    bodyText: z.string().min(1).max(1024).optional(),
    autoFillRecipientName: z.boolean().optional(),
    attachmentAllowed: z.boolean().optional(),
    buttonAllowed: z.boolean().optional(),
    buttonUrlIsDynamic: z.boolean().optional(),
    hasTextHeader: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Only checkable when both are present in the same patch — the client
    // always sends the full form on every edit, so this covers the real case.
    if (data.variables !== undefined && data.bodyText !== undefined) {
      const count = countPlaceholders(data.bodyText);
      if (count !== data.variables.length) {
        ctx.addIssue({
          code: "custom",
          path: ["variables"],
          message: `Body text has ${count} placeholder(s) but ${data.variables.length} variable label(s) were given — they must match.`,
        });
      }
    }
    if (data.hasTextHeader && data.attachmentAllowed) {
      ctx.addIssue({
        code: "custom",
        path: ["hasTextHeader"],
        message: "A template can have a text header or a media header, not both.",
      });
    }
  });

export const listTemplatesQuerySchema = paginationQuerySchema.extend({
  category: z.enum([TEMPLATE_CATEGORY.UTILITY, TEMPLATE_CATEGORY.MARKETING]).optional(),
});
