import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "@/components/ServicePage";
import { COMPANY, SITE_URL } from "@/lib/constants";
import { getProgrammaticCity } from "@/lib/cities";
import { fetchServicePricing } from "@/lib/pricing";
import { generateSEOContent, getProgrammaticSeoRobots, isWithinInitialProgrammaticBatch, MIN_PROGRAMMATIC_WORD_COUNT } from "@/lib/seoContentGenerator";
import { getProgrammaticService } from "@/lib/services";
import { getServiceCatalogItem } from "@/lib/serviceCatalog";
import { buildCanonicalUrl, buildServiceCityPage } from "@/lib/seoData";

export const revalidate = 3600;

type ServiceCityParams = Promise<{ service: string; city: string }>;

function resolveProgrammaticPage(serviceSlug: string, citySlug: string) {
  const seoPage = buildServiceCityPage({ service: serviceSlug, city: citySlug });

  if (!seoPage || !isWithinInitialProgrammaticBatch(seoPage.service.slug, seoPage.city.slug)) {
    return null;
  }

  const serviceConfig = getProgrammaticService(seoPage.service.slug);
  const cityConfig = getProgrammaticCity(seoPage.city.slug);

  if (!serviceConfig || !cityConfig) {
    return null;
  }

  const generatedContent = generateSEOContent(serviceConfig, cityConfig);

  if (generatedContent.bodyWordCount < MIN_PROGRAMMATIC_WORD_COUNT) {
    return null;
  }

  return { seoPage, serviceConfig, cityConfig, generatedContent };
}

export async function generateMetadata({ params }: { params: ServiceCityParams }): Promise<Metadata> {
  const { service, city } = await params;
  const resolved = resolveProgrammaticPage(service, city);

  if (!resolved) {
    return {
      title: "Page not found",
      robots: { index: false, follow: false },
    };
  }

  const { seoPage, generatedContent } = resolved;
  const canonicalUrl = buildCanonicalUrl(seoPage.canonicalPath);
  const title = generatedContent.metaTitle;
  const robots = getProgrammaticSeoRobots(seoPage.service.slug, seoPage.city.slug);

  return {
    title,
    description: generatedContent.metaDescription,
    keywords: [
      `${seoPage.service.title} in ${seoPage.city.name}`,
      `${seoPage.service.title} fees ${seoPage.city.name}`,
      `${seoPage.service.title} documents ${seoPage.city.name}`,
      `${seoPage.service.title} process ${seoPage.city.name}`,
      ...seoPage.keywords,
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description: generatedContent.metaDescription,
      url: canonicalUrl,
      siteName: COMPANY.name,
      type: "website",
      locale: "en_IN",
      images: [{ url: new URL("/og-image.svg", SITE_URL).toString(), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: generatedContent.metaDescription,
      images: [new URL("/og-image.svg", SITE_URL).toString()],
    },
    robots,
  };
}

export default async function ServiceCityPage({ params }: { params: ServiceCityParams }) {
  const { service, city } = await params;
  const resolved = resolveProgrammaticPage(service, city);

  if (!resolved) {
    notFound();
  }

  const { seoPage, generatedContent } = resolved;
  const catalogItem = getServiceCatalogItem(seoPage.service.slug);
  const pricing = catalogItem ? await fetchServicePricing(catalogItem.code).catch(() => null) : null;

  return <ServicePage page={seoPage} pricing={pricing} generatedContent={generatedContent} />;
}
