import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate, authorize } from "../../../middleware";
import { ROLES } from "../../../shared/constants";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", authenticate, dashboardController.getStats);
dashboardRouter.get("/analytics", authenticate, authorize(ROLES.SUPER_ADMIN), dashboardController.getAnalytics);
