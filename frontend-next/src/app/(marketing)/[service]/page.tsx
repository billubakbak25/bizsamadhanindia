import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EXPLICIT_LEGAL_POLICY_SLUGS, generateLegalPolicyMetadata, renderLegalPolicy } from "../legalPolicyRoute";
import { ProgrammaticSeoPage } from "@/components/sections/ProgrammaticSeoPage";
import { ServiceDetail } from "@/components/sections/ServiceDetail";
import { buildServiceCitySeo } from "@/components/seo/SeoHead";
import { COMPANY, DYNAMIC_MARKETING_SLUGS, LEGAL_POLICY_SLUGS, SITE_URL, getLegalPolicyPage, getMarketingPage } from "@/lib/constants";
import { buildServiceCityPage, getServiceCityCanonicalPath } from "@/lib/seoData";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const dynamicLegalSlugs = LEGAL_POLICY_SLUGS.filter((slug) => !EXPLICIT_LEGAL_POLICY_SLUGS.includes(slug as (typeof EXPLICIT_LEGAL_POLICY_SLUGS)[number]));

  return [...DYNAMIC_MARKETING_SLUGS, ...dynamicLegalSlugs].map((service) => ({ service }));
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service: slug } = await params;
  const marketingPage = getMarketingPage(slug);
  const legalPolicyPage = getLegalPolicyPage(slug);

  if (marketingPage) {
    return {
      title: marketingPage.title,
      description: marketingPage.description,
    };
  }

  if (legalPolicyPage) {
    return generateLegalPolicyMetadata(slug);
  }

  const seoPage = buildServiceCityPage({ slug });

  if (!seoPage) {
    return {
      title: "Page not found",
    };
  }

  const canonicalPath = getServiceCityCanonicalPath({
    service: seoPage.service.slug,
    city: seoPage.city.slug,
  });

  return buildServiceCitySeo({
    brandName: COMPANY.name,
    serviceName: seoPage.service.title,
    serviceSlug: seoPage.service.slug,
    cityName: seoPage.city.name,
    citySlug: seoPage.city.slug,
    baseUrl: SITE_URL,
    description: seoPage.description,
    keywords: seoPage.keywords,
    path: canonicalPath,
    canonicalUrl: new URL(canonicalPath, SITE_URL).toString(),
    imageUrl: new URL("/og-image.svg", SITE_URL).toString(),
    telephone: COMPANY.phone,
    priceRange: seoPage.pricing[0]?.amount,
    location: {
      city: seoPage.city.name,
      state: seoPage.city.state,
      country: "India",
    },
  }).metadata;
}

export default async function DynamicMarketingPage({ params }: { params: Promise<{ service: string }> }) {
  const { service: slug } = await params;
  const marketingPage = getMarketingPage(slug);
  const legalPolicyPage = getLegalPolicyPage(slug);

  if (marketingPage) {
    return <ServiceDetail page={marketingPage} />;
  }

  if (legalPolicyPage) {
    return renderLegalPolicy(slug);
  }

  const seoPage = buildServiceCityPage({ slug });

  if (!seoPage) {
    notFound();
  }

  return <ProgrammaticSeoPage page={seoPage} />;
}
