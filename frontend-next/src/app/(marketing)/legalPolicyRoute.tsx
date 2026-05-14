import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPolicyPage } from "@/components/sections/LegalPolicyPage";
import { COMPANY, SITE_URL, getLegalPolicyPage } from "@/lib/constants";

export const EXPLICIT_LEGAL_POLICY_SLUGS = ["refund-policy", "cancellation-policy", "service-delivery-policy", "terms-and-conditions"] as const;

export function generateLegalPolicyMetadata(slug: string): Metadata {
  const page = getLegalPolicyPage(slug);

  if (!page) {
    return {
      title: "Page not found",
    };
  }

  const url = new URL(`/${page.slug}`, SITE_URL).toString();

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: COMPANY.name,
      type: "article",
    },
  };
}

export function renderLegalPolicy(slug: string) {
  const page = getLegalPolicyPage(slug);

  if (!page) {
    notFound();
  }

  return <LegalPolicyPage page={page} />;
}
