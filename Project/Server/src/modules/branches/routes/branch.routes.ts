import { Router } from "express";
import * as branchController from "../controllers/branch.controller";
import { createBranchSchema, updateBranchSchema, listBranchesQuerySchema } from "../validators/branch.validators";
import { idParamSchema } from "../../../shared/validators";
import { authenticate, authorize, validate } from "../../../middleware";
import { ROLES } from "../../../shared/constants";

export const branchRouter = Router();

branchRouter.use(authenticate);

branchRouter.get("/", validate({ query: listBranchesQuerySchema }), branchController.list);
branchRouter.get("/:id", validate({ params: idParamSchema }), branchController.getById);
branchRouter.post("/", authorize(ROLES.SUPER_ADMIN), validate({ body: createBranchSchema }), branchController.create);
branchRouter.patch(
  "/:id",
  authorize(ROLES.SUPER_ADMIN),
  validate({ params: idParamSchema, body: updateBranchSchema }),
  branchController.update,
);
branchRouter.delete("/:id", authorize(ROLES.SUPER_ADMIN), validate({ params: idParamSchema }), branchController.remove);
