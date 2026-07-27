import { Router } from "express";
import * as facultyController from "../controllers/faculty.controller";
import {
  createFacultySchema,
  updateFacultySchema,
  updateFacultyStatusSchema,
  resetFacultyPasswordSchema,
  listFacultyQuerySchema,
} from "../validators/faculty.validators";
import { idParamSchema } from "../../../shared/validators";
import { authenticate, authorize, validate } from "../../../middleware";
import { ROLES } from "../../../shared/constants";

export const facultyRouter = Router();

facultyRouter.use(authenticate, authorize(ROLES.SUPER_ADMIN));

facultyRouter.post("/", validate({ body: createFacultySchema }), facultyController.create);
facultyRouter.get("/", validate({ query: listFacultyQuerySchema }), facultyController.list);
facultyRouter.get("/:id", validate({ params: idParamSchema }), facultyController.getById);
facultyRouter.patch("/:id", validate({ params: idParamSchema, body: updateFacultySchema }), facultyController.update);
facultyRouter.patch(
  "/:id/status",
  validate({ params: idParamSchema, body: updateFacultyStatusSchema }),
  facultyController.updateStatus,
);
facultyRouter.patch(
  "/:id/reset-password",
  validate({ params: idParamSchema, body: resetFacultyPasswordSchema }),
  facultyController.resetPassword,
);
facultyRouter.delete("/:id", validate({ params: idParamSchema }), facultyController.remove);
