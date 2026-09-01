import { supabaseAdmin } from "../../../config/supabase";
import { ApiError } from "../../../shared/errors";
import type { PricingSettings, UpdatePricingInput } from "../types/pricing.types";

const TABLE = "pricing_settings";

function mapRow(row: any): PricingSettings {
  return {
    utilityRate: Number(row.utility_rate),
    marketingRate: Number(row.marketing_rate),
    gstPercent: Number(row.gst_percent),
    updatedAt: row.updated_at,
  };
}

// Singleton row (id = true) — the migration seeds it, so this should always
// find one; falls back to zeroed defaults only if it's somehow missing.
export async function getPricing(): Promise<PricingSettings> {
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", true).maybeSingle();
  if (error) throw ApiError.internal("Failed to fetch pricing settings", error.message);
  if (!data) return { utilityRate: 0, marketingRate: 0, gstPercent: 18, updatedAt: new Date().toISOString() };
  return mapRow(data);
}

export async function updatePricing(input: UpdatePricingInput): Promise<PricingSettings> {
  const patch: Record<string, unknown> = {};
  if (input.utilityRate !== undefined) patch.utility_rate = input.utilityRate;
  if (input.marketingRate !== undefined) patch.marketing_rate = input.marketingRate;
  if (input.gstPercent !== undefined) patch.gst_percent = input.gstPercent;

  const { data, error } = await supabaseAdmin.from(TABLE).update(patch).eq("id", true).select().single();
  if (error) throw ApiError.internal("Failed to update pricing settings", error.message);
  return mapRow(data);
}
