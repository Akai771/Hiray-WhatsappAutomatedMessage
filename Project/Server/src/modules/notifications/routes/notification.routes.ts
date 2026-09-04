import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import {
  createNotificationSchema,
  listNotificationsQuerySchema,
  recipientCountQuerySchema,
} from "../validators/notification.validators";
import { paginationQuerySchema, idParamSchema } from "../../../shared/validators";
import { authenticate, validate, notificationSendRateLimiter } from "../../../middleware";

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.post(
  "/",
  notificationSendRateLimiter,
  validate({ body: createNotificationSchema }),
  notificationController.create,
);
notificationRouter.get("/", validate({ query: listNotificationsQuerySchema }), notificationController.list);
// Must come before "/:id" — otherwise these would be swallowed as an :id.
notificationRouter.get("/quota", notificationController.getQuota);
notificationRouter.get(
  "/recipient-count",
  validate({ query: recipientCountQuerySchema }),
  notificationController.getRecipientCount,
);
notificationRouter.get("/:id", validate({ params: idParamSchema }), notificationController.getById);
notificationRouter.get(
  "/:id/logs",
  validate({ params: idParamSchema, query: paginationQuerySchema }),
  notificationController.getLogs,
);
notificationRouter.get(
  "/:id/delivery-report",
  validate({ params: idParamSchema }),
  notificationController.getDeliveryReport,
);
notificationRouter.post("/:id/cancel", validate({ params: idParamSchema }), notificationController.cancel);
