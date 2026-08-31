import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate } from "../../../middleware";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", authenticate, dashboardController.getStats);
dashboardRouter.get("/analytics", authenticate, dashboardController.getAnalytics);
