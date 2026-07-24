import { Router } from "express";
import * as courseController from "../controllers/course.controller";
import { createCourseSchema, updateCourseSchema, listCoursesQuerySchema } from "../validators/course.validators";
import { idParamSchema } from "../../../shared/validators";
import { authenticate, authorize, validate } from "../../../middleware";
import { ROLES } from "../../../shared/constants";

export const courseRouter = Router();

courseRouter.use(authenticate);

courseRouter.get("/", validate({ query: listCoursesQuerySchema }), courseController.list);
courseRouter.get("/:id", validate({ params: idParamSchema }), courseController.getById);

courseRouter.post(
  "/",
  authorize(ROLES.SUPER_ADMIN),
  validate({ body: createCourseSchema }),
  courseController.create,
);
courseRouter.patch(
  "/:id",
  authorize(ROLES.SUPER_ADMIN),
  validate({ params: idParamSchema, body: updateCourseSchema }),
  courseController.update,
);
courseRouter.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN),
  validate({ params: idParamSchema }),
  courseController.remove,
);
