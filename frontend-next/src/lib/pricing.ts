import { apiJson } from "@/lib/api";

export type PricingRuleRecord = {
  id: string;
  service_code: string;
  type: string;
  value: number;
  condition?: string | null;
  is_active: boolean;
};

export type PricingRecord = {
  code: string;
  name: string;
  basePrice: number;
  finalPrice: number | null;
  currency: string;
  isActive: boolean;
  activeRuleCount: number;
  rules: PricingRuleRecord[];
};

export async function fetchPricingCatalog() {
  const payload = await apiJson<{ success?: boolean; data?: { items?: PricingRecord[] } }>(
    "/api/pricing",
    { cache: "no-store" },
    { label: "pricing.catalog" },
  );

  return payload?.data?.items || [];
}

export async function fetchServicePricing(serviceCode: string) {
  const payload = await apiJson<{ success?: boolean; data?: PricingRecord }>(
    `/api/pricing/${encodeURIComponent(serviceCode)}`,
    { cache: "no-store" },
    { label: `pricing.service:${serviceCode}` },
  );

  return payload?.data || null;
}

export function formatServicePrice(price: number | null | undefined) {
  if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
    return "Consultation-led pricing";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export function formatStartingPrice(price: number | null | undefined) {
  if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
    return "Consultation-led pricing";
  }

  return `Starting at ${formatServicePrice(price)}`;
}