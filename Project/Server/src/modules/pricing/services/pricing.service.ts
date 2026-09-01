import * as pricingRepository from "../repositories/pricing.repository";
import type { PricingSettings, UpdatePricingInput } from "../types/pricing.types";

export async function getPricingSettings(): Promise<PricingSettings> {
  return pricingRepository.getPricing();
}

export async function updatePricingSettings(input: UpdatePricingInput): Promise<PricingSettings> {
  return pricingRepository.updatePricing(input);
}
