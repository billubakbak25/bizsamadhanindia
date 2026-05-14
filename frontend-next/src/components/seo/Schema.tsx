type SchemaBaseBusiness = {
  name: string;
  alternateName?: string;
  url: string;
  email?: string;
  telephone?: string;
  secondaryTelephone?: string;
  priceRange?: string;
  logo?: string;
  image?: string;
  supportPerson?: string;
  sameAs?: string[];
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
};

type SchemaService = {
  name: string;
  description: string;
  url: string;
  areaServed?: Array<string | { name: string }>;
  serviceType?: string;
  price?: number | string | null;
  priceCurrency?: string;
};

type SchemaFaqItem = {
  question: string;
  answer: string;
};

export type SeoSchemaProps = {
  business: SchemaBaseBusiness;
  service: SchemaService;
  faqItems?: SchemaFaqItem[];
  pageUrl: string;
  path?: string;
  localBusinessType?: string;
  areaServed?: Array<string | { name: string }>;
};

type JsonLdNode = Record<string, unknown>;

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function toAreaServed(areaServed?: Array<string | { name: string }>) {
  return areaServed?.map((item) =>
    typeof item === "string" ? { "@type": "Place", name: item } : { "@type": "Place", name: item.name },
  );
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function buildLocalBusinessSchema(props: SeoSchemaProps): JsonLdNode {
  const { business, localBusinessType = "LocalBusiness", areaServed } = props;

  const schema: JsonLdNode = {
    "@type": localBusinessType,
    name: business.name,
    url: business.url,
  };

  if (business.alternateName) schema.alternateName = business.alternateName;
  if (business.email) schema.email = business.email;
  if (business.telephone) schema.telephone = business.telephone;
  if (business.priceRange) schema.priceRange = business.priceRange;
  if (business.logo) schema.logo = business.logo;
  if (business.image) schema.image = business.image;
  if (business.sameAs?.length) schema.sameAs = business.sameAs;
  if (business.address) {
    schema.address = {
      "@type": "PostalAddress",
      ...business.address,
    };
  }
  if (areaServed?.length) schema.areaServed = toAreaServed(areaServed);
  if (business.supportPerson || business.email || business.telephone) {
    const contactPoint: JsonLdNode[] = [];

    if (business.telephone || business.email) {
      contactPoint.push({
        "@type": "ContactPoint",
        name: business.supportPerson,
        contactType: "customer support",
        telephone: business.telephone,
        email: business.email,
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      });
    }

    if (business.secondaryTelephone) {
      contactPoint.push({
        "@type": "ContactPoint",
        name: business.supportPerson,
        contactType: "billing and grievance support",
        telephone: business.secondaryTelephone,
        email: business.email,
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      });
    }

    schema.contactPoint = contactPoint;
  }

  return schema;
}

function buildServiceSchema(props: SeoSchemaProps): JsonLdNode {
  const { service, areaServed } = props;

  const schema: JsonLdNode = {
    "@type": "Service",
    name: cleanText(service.name),
    description: cleanText(service.description),
    url: service.url,
    provider: {
      "@type": "Organization",
      name: props.business.name,
      url: props.business.url,
    },
  };

  if (service.serviceType) schema.serviceType = service.serviceType;
  if (service.price) {
    schema.offers = {
      "@type": "Offer",
      price: service.price,
      priceCurrency: service.priceCurrency || "INR",
      availability: "https://schema.org/InStock",
    };
  }

  const resolvedAreaServed = areaServed || service.areaServed;
  if (resolvedAreaServed?.length) schema.areaServed = toAreaServed(resolvedAreaServed);

  return schema;
}

function buildFaqSchema(faqItems?: SchemaFaqItem[]): JsonLdNode | null {
  if (!faqItems?.length) return null;

  return {
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: cleanText(item.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: cleanText(item.answer),
      },
    })),
  };
}

export function buildSeoSchemaGraph(props: SeoSchemaProps) {
  const graph: JsonLdNode[] = [
    {
      "@type": "WebPage",
      name: props.service.name,
      url: props.pageUrl,
      description: props.service.description,
      mainEntity: {
        "@type": "Service",
        name: props.service.name,
      },
    },
    buildLocalBusinessSchema(props),
    buildServiceSchema(props),
  ];

  if (props.business.supportPerson) {
    graph.push({
      "@type": "Person",
      name: props.business.supportPerson,
      jobTitle: "Official Support Representative",
      email: props.business.email,
      telephone: props.business.telephone,
      worksFor: {
        "@type": "Organization",
        name: props.business.name,
        url: props.business.url,
      },
    });
  }

  const faq = buildFaqSchema(props.faqItems);
  if (faq) graph.push(faq);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function Schema(props: SeoSchemaProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(buildSeoSchemaGraph(props)) }} />;
}
