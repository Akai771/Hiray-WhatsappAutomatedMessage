import { Router } from "express";
import * as templateController from "../controllers/template.controller";
import { createTemplateSchema, updateTemplateSchema, listTemplatesQuerySchema } from "../validators/template.validators";
import { idParamSchema } from "../../../shared/validators";
import { authenticate, authorize, validate } from "../../../middleware";
import { ROLES } from "../../../shared/constants";

export const templateRouter = Router();

templateRouter.use(authenticate);

// Faculty can read templates to pick one when creating a notification;
// only Super Admin can manage the catalog.
templateRouter.get("/", validate({ query: listTemplatesQuerySchema }), templateController.list);
templateRouter.get("/:id", validate({ params: idParamSchema }), templateController.getById);

templateRouter.post(
  "/",
  authorize(ROLES.SUPER_ADMIN),
  validate({ body: createTemplateSchema }),
  templateController.create,
);
templateRouter.patch(
  "/:id",
  authorize(ROLES.SUPER_ADMIN),
  validate({ params: idParamSchema, body: updateTemplateSchema }),
  templateController.update,
);
templateRouter.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN),
  validate({ params: idParamSchema }),
  templateController.remove,
);
