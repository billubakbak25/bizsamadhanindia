import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPolicyPage } from "@/components/sections/LegalPolicyPage";
import { ProgrammaticSeoPage } from "@/components/sections/ProgrammaticSeoPage";
import { ServiceDetail } from "@/components/sections/ServiceDetail";
import { buildServiceCitySeo } from "@/components/seo/SeoHead";
import { COMPANY, DYNAMIC_MARKETING_SLUGS, LEGAL_POLICY_SLUGS, SITE_URL, getLegalPolicyPage, getMarketingPage } from "@/lib/constants";
import { buildServiceCityPage, getServiceCityCanonicalPath } from "@/lib/seoData";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [...DYNAMIC_MARKETING_SLUGS, ...LEGAL_POLICY_SLUGS].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const marketingPage = getMarketingPage(slug);
  const legalPolicyPage = getLegalPolicyPage(slug);

  if (marketingPage) {
    return {
      title: marketingPage.title,
      description: marketingPage.description,
    };
  }

  if (legalPolicyPage) {
    return {
      title: legalPolicyPage.title,
      description: legalPolicyPage.description,
    };
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

export default async function DynamicMarketingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const marketingPage = getMarketingPage(slug);
  const legalPolicyPage = getLegalPolicyPage(slug);

  if (marketingPage) {
    return <ServiceDetail page={marketingPage} />;
  }

  if (legalPolicyPage) {
    return <LegalPolicyPage page={legalPolicyPage} />;
  }

  const seoPage = buildServiceCityPage({ slug });

  if (!seoPage) {
    notFound();
  }

  return <ProgrammaticSeoPage page={seoPage} />;
}
