import { Schema } from "@/components/seo/Schema";
import { COMPANY, SITE_URL } from "@/lib/constants";
import type { SeoFaq, ServiceCitySeoPage } from "@/lib/seoData";

type SEOProps = {
  page: ServiceCitySeoPage;
  price?: number | null;
  faqs?: SeoFaq[];
};

export function SEO({ page, price = null, faqs = page.faqs }: SEOProps) {
  const pageUrl = `${SITE_URL}${page.canonicalPath}`;
  const serviceLabel = `${page.service.title} in ${page.city.name}`;

  return (
    <Schema
      business={{
        name: COMPANY.name,
        url: SITE_URL,
        telephone: COMPANY.phone,
        priceRange: price ? `Rs ${price}+` : page.pricing[0]?.amount,
        image: `${SITE_URL}/og-image.svg`,
        address: {
          addressLocality: page.city.name,
          addressRegion: page.city.state,
          addressCountry: "IN",
        },
      }}
      service={{
        name: serviceLabel,
        description: page.description,
        url: pageUrl,
        serviceType: page.service.category,
        areaServed: [page.city.name, `${page.city.name}, ${page.city.state}`],
        price,
        priceCurrency: "INR",
      }}
      faqItems={faqs}
      pageUrl={pageUrl}
      areaServed={[page.city.name, `${page.city.name}, ${page.city.state}`]}
    />
  );
}