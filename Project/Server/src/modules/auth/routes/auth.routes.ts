import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { loginSchema, refreshSchema, resetPasswordParamsSchema, resetPasswordBodySchema } from "../validators/auth.validators";
import { authenticate, authorize, validate, loginRateLimiter } from "../../../middleware";
import { ROLES } from "../../../shared/constants";

export const authRouter = Router();

authRouter.post("/login", loginRateLimiter, validate({ body: loginSchema }), authController.login);
authRouter.post("/refresh", validate({ body: refreshSchema }), authController.refresh);
authRouter.post("/logout", authenticate, authController.logout);
authRouter.get("/me", authenticate, authController.me);

authRouter.post(
  "/faculty/:id/reset-password",
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  validate({ params: resetPasswordParamsSchema, body: resetPasswordBodySchema }),
  authController.resetFacultyPassword,
);
