import { Router } from "express";
import * as parentController from "../controllers/parent.controller";
import {
  createParentSchema,
  updateParentSchema,
  listParentsQuerySchema,
  bulkDeleteParentsSchema,
} from "../validators/parent.validators";
import { idParamSchema } from "../../../shared/validators";
import { authenticate, validate } from "../../../middleware";

export const parentRouter = Router();

parentRouter.use(authenticate);

parentRouter.post("/", validate({ body: createParentSchema }), parentController.create);
parentRouter.get("/", validate({ query: listParentsQuerySchema }), parentController.list);
parentRouter.get("/:id", validate({ params: idParamSchema }), parentController.getById);
parentRouter.patch("/:id", validate({ params: idParamSchema, body: updateParentSchema }), parentController.update);
parentRouter.delete("/:id", validate({ params: idParamSchema }), parentController.remove);
parentRouter.post("/bulk-delete", validate({ body: bulkDeleteParentsSchema }), parentController.bulkRemove);
