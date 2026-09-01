import { apiGet, apiPatch } from "./apiClient";
import type { PricingSettings } from "./types";

export async function getPricing(): Promise<PricingSettings> {
  const { data } = await apiGet<PricingSettings>("/pricing");
  return data;
}

export interface UpdatePricingInput {
  utilityRate?: number;
  marketingRate?: number;
  gstPercent?: number;
}

export async function updatePricing(input: UpdatePricingInput): Promise<PricingSettings> {
  const { data } = await apiPatch<PricingSettings>("/pricing", input);
  return data;
}
