import { SERVICE_LIBRARY } from "@/lib/constants";

export type ServiceCatalogItem = {
  code: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
  outcomes: string[];
};

export const SERVICE_CATALOG: ServiceCatalogItem[] = SERVICE_LIBRARY.map((service) => ({
  code: service.code,
  slug: service.slug,
  name: service.title,
  category: service.category,
  description: service.description,
  price: null,
  outcomes: [...service.outcomes],
}));

function normalize(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getServiceCatalogItem(value: string) {
  const normalized = normalize(value);
  return SERVICE_CATALOG.find((service) => [service.code, service.slug, service.name].some((candidate) => normalize(candidate) === normalized)) || null;
}