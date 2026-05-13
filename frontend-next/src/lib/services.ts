import { SERVICE_CATALOG } from "@/lib/serviceCatalog";

export type ProgrammaticService = {
  code: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  description: string;
};

const DEFAULT_PRICE_BY_CODE: Record<string, number> = {
  gst_registration: 999,
  itr_filing: 499,
  trademark_copyright: 1499,
  company_registration: 1999,
  annual_compliance_filing: 1499,
  accounting_bookkeeping: 999,
};

function normalizeCategory(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "service";

  if (normalized.includes("tax") || normalized.includes("gst") || normalized.includes("itr")) return "tax";
  if (normalized.includes("formation") || normalized.includes("company") || normalized.includes("startup")) return "business-formation";
  if (normalized.includes("compliance") || normalized.includes("roc") || normalized.includes("filing")) return "compliance";
  if (normalized.includes("brand") || normalized.includes("trademark") || normalized.includes("copyright") || normalized.includes("ip")) return "intellectual-property";
  if (normalized.includes("finance") || normalized.includes("account") || normalized.includes("bookkeeping")) return "finance";

  return normalized;
}

export const SERVICES: ProgrammaticService[] = SERVICE_CATALOG.map((service) => ({
  code: service.code,
  slug: service.slug,
  name: service.name,
  price: service.price || DEFAULT_PRICE_BY_CODE[service.code] || 999,
  category: normalizeCategory(service.category),
  description: service.description,
}));

export function getProgrammaticService(slugOrCode: string) {
  const normalized = slugOrCode.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const normalizedCode = slugOrCode.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

  return SERVICES.find((service) => service.slug === normalized || service.code === normalizedCode) || null;
}
