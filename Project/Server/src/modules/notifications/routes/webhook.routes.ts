import { Router } from "express";
import express from "express";
import { verifyWebhookChallenge, verifyWebhookSignature, extractStatusUpdates } from "../../../integrations/whatsapp";
import * as notificationLogRepository from "../repositories/notificationLog.repository";
import { logger } from "../../../shared/logger";

export const whatsappWebhookRouter = Router();

whatsappWebhookRouter.get("/", (req, res) => {
  const mode = req.query["hub.mode"] as string | undefined;
  const token = req.query["hub.verify_token"] as string | undefined;
  const challenge = req.query["hub.challenge"] as string | undefined;

  if (verifyWebhookChallenge(mode, token)) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

whatsappWebhookRouter.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const rawBody = req.body as Buffer;
  const signature = req.headers["x-hub-signature-256"] as string | undefined;

  if (!verifyWebhookSignature(rawBody, signature)) {
    return res.sendStatus(401);
  }

  // Ack fast, per WhatsApp's webhook requirements — process after responding.
  res.sendStatus(200);

  try {
    const payload = JSON.parse(rawBody.toString("utf-8"));
    const updates = extractStatusUpdates(payload);

    await Promise.all(
      updates.map((update) =>
        notificationLogRepository.updateStatusByWhatsAppMessageId(
          update.whatsappMessageId,
          update.status,
          update.errorMessage,
        ),
      ),
    );
  } catch (err) {
    logger.error("Failed to process WhatsApp webhook payload", err);
  }
});
