import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_BUCKET: z.string().min(1),

  REDIS_URL: z.url(),

  // Optional while WhatsApp Business API access is pending — everything
  // except actually sending/receiving WhatsApp messages works without
  // these. sendTemplateMessage() and the webhook verifier throw a clear
  // error if called while unset, rather than silently sending malformed
  // requests.
  WHATSAPP_ACCESS_TOKEN: z.string().min(1).optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().min(1).optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1).optional(),
  WHATSAPP_APP_SECRET: z.string().min(1).optional(),

  // Meta's rolling-24h send cap for a business number that isn't verified
  // yet is 250 — default here is set a bit under that (not the full 250) so
  // there's always headroom left for ad-hoc testing/dev sends without
  // those eating into the batch actually going out to real recipients.
  // Raise this once the business is verified and Meta grants a higher tier.
  WHATSAPP_DAILY_LIMIT: z.coerce.number().int().positive().default(230),

  FRONTEND_URL: z.url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
