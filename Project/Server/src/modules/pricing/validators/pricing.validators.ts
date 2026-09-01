import { z } from "zod";

export const updatePricingSchema = z.object({
  utilityRate: z.number().min(0).max(1000).optional(),
  marketingRate: z.number().min(0).max(1000).optional(),
  gstPercent: z.number().min(0).max(100).optional(),
});
