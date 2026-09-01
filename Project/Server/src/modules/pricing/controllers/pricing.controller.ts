import type { Request, Response } from "express";
import * as pricingService from "../services/pricing.service";
import { sendSuccess } from "../../../shared/responses";

export async function get(req: Request, res: Response) {
  const pricing = await pricingService.getPricingSettings();
  return sendSuccess(res, pricing);
}

export async function update(req: Request, res: Response) {
  const pricing = await pricingService.updatePricingSettings(req.body);
  return sendSuccess(res, pricing, "Pricing updated");
}
