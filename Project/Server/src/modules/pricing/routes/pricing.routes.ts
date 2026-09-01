import { Router } from "express";
import * as pricingController from "../controllers/pricing.controller";
import { updatePricingSchema } from "../validators/pricing.validators";
import { authenticate, authorize, validate } from "../../../middleware";
import { ROLES } from "../../../shared/constants";

export const pricingRouter = Router();

pricingRouter.use(authenticate);

pricingRouter.get("/", pricingController.get);
pricingRouter.patch("/", authorize(ROLES.SUPER_ADMIN), validate({ body: updatePricingSchema }), pricingController.update);
