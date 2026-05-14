import { Schema } from "@/components/seo/Schema";
import { BUSINESS_CONTACT, COMPANY, SITE_URL } from "@/lib/constants";
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
        alternateName: COMPANY.brandName,
        url: SITE_URL,
        email: BUSINESS_CONTACT.supportEmail,
        telephone: `+91${BUSINESS_CONTACT.primaryPhones[0]}`,
        secondaryTelephone: `+91${BUSINESS_CONTACT.primaryPhones[1]}`,
        supportPerson: BUSINESS_CONTACT.supportPerson,
        priceRange: price ? `Rs ${price}+` : page.pricing[0]?.amount,
        image: `${SITE_URL}/og-image.svg`,
        address: {
          streetAddress: "LIG 25 SF Colony, Barra 3",
          addressLocality: page.city.name,
          addressRegion: page.city.state,
          postalCode: page.city.name.toLowerCase() === BUSINESS_CONTACT.officeCity.toLowerCase() ? BUSINESS_CONTACT.postalCode : undefined,
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
