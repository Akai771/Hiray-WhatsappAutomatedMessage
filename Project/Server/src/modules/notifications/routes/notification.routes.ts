import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { createNotificationSchema, listNotificationsQuerySchema } from "../validators/notification.validators";
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
