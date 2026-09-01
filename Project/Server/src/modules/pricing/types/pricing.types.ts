export interface PricingSettings {
  utilityRate: number;
  marketingRate: number;
  gstPercent: number;
  updatedAt: string;
}

export interface UpdatePricingInput {
  utilityRate?: number;
  marketingRate?: number;
  gstPercent?: number;
}
