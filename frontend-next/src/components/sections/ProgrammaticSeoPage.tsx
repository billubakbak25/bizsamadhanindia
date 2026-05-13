import { ServicePage } from "@/components/ServicePage";
import { fetchServicePricing } from "@/lib/pricing";
import { getServiceCatalogItem } from "@/lib/serviceCatalog";
import type { ServiceCitySeoPage } from "@/lib/seoData";

type ProgrammaticSeoPageProps = {
  page: ServiceCitySeoPage;
};

export async function ProgrammaticSeoPage({ page }: ProgrammaticSeoPageProps) {
  const catalogItem = getServiceCatalogItem(page.service.slug);
  const pricing = catalogItem ? await fetchServicePricing(catalogItem.code).catch(() => null) : null;

  return <ServicePage page={page} pricing={pricing} />;
}