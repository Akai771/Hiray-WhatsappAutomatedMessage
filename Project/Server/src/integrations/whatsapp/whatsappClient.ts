import { env } from "../../config/env";
import { ApiError } from "../../shared/errors";
import { logger } from "../../shared/logger";

const GRAPH_API_VERSION = "v21.0";

export interface WhatsAppTemplateComponent {
  type: "header" | "body" | "button";
  sub_type?: "url" | "quick_reply";
  index?: string;
  parameters: Array<
    | { type: "text"; text: string }
    | { type: "image"; image: { link: string } }
    | { type: "document"; document: { link: string; filename?: string } }
    | { type: "video"; video: { link: string } }
  >;
}

export interface SendTemplateMessageInput {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: WhatsAppTemplateComponent[];
}

export interface SendTemplateMessageResult {
  whatsappMessageId: string;
}

export async function sendTemplateMessage({
  to,
  templateName,
  languageCode = "en_US",
  components,
}: SendTemplateMessageInput): Promise<SendTemplateMessageResult> {
  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    throw ApiError.internal("WhatsApp integration is not configured (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID unset)");
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(components && components.length > 0 ? { components } : {}),
      },
    }),
  });

  const payload: any = await response.json();

  if (!response.ok) {
    logger.error("WhatsApp send failed", payload);
    throw ApiError.badRequest(
      payload?.error?.message ?? "WhatsApp message send failed",
      payload?.error,
    );
  }

  const whatsappMessageId = payload?.messages?.[0]?.id;
  if (!whatsappMessageId) {
    throw ApiError.internal("WhatsApp API returned no message id", payload);
  }

  return { whatsappMessageId };
}
