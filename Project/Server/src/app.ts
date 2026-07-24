import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import { globalRateLimiter, errorHandler, notFoundHandler } from "./middleware";
import { v1Router } from "./routes/v1";
import { whatsappWebhookRouter } from "./modules/notifications/routes/webhook.routes";
import { sendSuccess } from "./shared/responses";
import { supabaseAdmin } from "./config/supabase";
import { redisConnection } from "./config/redis";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(globalRateLimiter);

// Mounted before the JSON body parser: WhatsApp webhook signature
// verification needs the raw request bytes, not the parsed object.
app.use("/api/v1/webhooks/whatsapp", whatsappWebhookRouter);

app.use(express.json({ limit: "2mb" }));

async function checkSupabase(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("faculty").select("id", { head: true, count: "exact" });
    return !error;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    await redisConnection.ping();
    return true;
  } catch {
    return false;
  }
}

app.get("/health", async (_req, res) => {
  const [supabaseOk, redisOk] = await Promise.all([checkSupabase(), checkRedis()]);

  const healthy = supabaseOk && redisOk;
  return sendSuccess(
    res,
    { supabase: supabaseOk, redis: redisOk },
    healthy ? "ok" : "degraded",
    healthy ? 200 : 503,
  );
});

app.use("/api/v1", v1Router);

app.use(notFoundHandler);
app.use(errorHandler);
