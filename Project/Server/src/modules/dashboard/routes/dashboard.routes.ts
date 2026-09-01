import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { analyticsQuerySchema } from "../validators/dashboard.validators";
import { authenticate, authorize, validate } from "../../../middleware";
import { ROLES } from "../../../shared/constants";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", authenticate, dashboardController.getStats);
dashboardRouter.get(
  "/analytics",
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  validate({ query: analyticsQuerySchema }),
  dashboardController.getAnalytics,
);
