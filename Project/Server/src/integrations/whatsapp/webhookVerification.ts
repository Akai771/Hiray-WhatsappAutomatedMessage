import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env";

export function verifyWebhookChallenge(mode: string | undefined, token: string | undefined): boolean {
  return mode === "subscribe" && token === env.WHATSAPP_VERIFY_TOKEN;
}

export function verifyWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", env.WHATSAPP_APP_SECRET).update(rawBody).digest("hex");
  const provided = signatureHeader.slice("sha256=".length);

  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");

  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}
