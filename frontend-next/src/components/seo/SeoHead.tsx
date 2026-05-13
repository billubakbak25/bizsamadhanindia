import type { Metadata } from "next";

export type SeoLocation = {
  city: string;
  state?: string;
  country?: string;
};

export type SeoServiceCityInput = {
  brandName: string;
  serviceName: string;
  serviceSlug: string;
  cityName: string;
  citySlug?: string;
  baseUrl: string;
  description?: string;
  summary?: string;
  keywords?: string[];
  path?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  locale?: string;
  telephone?: string;
  location?: SeoLocation;
  priceRange?: string;
  relatedServices?: Array<{ label: string; href: string }>;
  nearbyCities?: Array<{ label: string; href: string }>;
};

export type SeoHeadData = {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  metadata: Metadata;
  openGraph: NonNullable<Metadata["openGraph"]>;
  twitter: NonNullable<Metadata["twitter"]>;
  robots: NonNullable<Metadata["robots"]>;
};

function toTitleCase(value: string) {
  return value
    .split(/[\s-]+/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function uniq(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

function resolveUrl(baseUrl: string, path?: string, fallbackPath = "/") {
  const safeBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const resolvedPath = path || fallbackPath;
  return new URL(resolvedPath.replace(/^\//, ""), safeBaseUrl).toString();
}

export function buildServiceCitySeo(input: SeoServiceCityInput): SeoHeadData {
  const serviceLabel = toTitleCase(input.serviceName);
  const cityLabel = toTitleCase(input.cityName);
  const title = `${serviceLabel} in ${cityLabel} | ${input.brandName}`;
  const description =
    input.description ||
    input.summary ||
    `${serviceLabel} in ${cityLabel} with fast online support, clear next steps, and a conversion-focused process for growing businesses.`;
  const canonicalUrl =
    input.canonicalUrl ||
    resolveUrl(
      input.baseUrl,
      input.path || `/${input.serviceSlug}/${input.citySlug || input.cityName.toLowerCase().replace(/\s+/g, "-")}`,
    );
  const keywords = uniq([
    `${serviceLabel} in ${cityLabel}`,
    `${serviceLabel} ${cityLabel}`,
    `${input.serviceName} ${input.cityName}`,
    `best ${input.serviceName} in ${input.cityName}`,
    `online ${input.serviceName} in ${input.cityName}`,
    input.serviceName,
    input.cityName,
    ...(input.keywords || []),
  ]);

  const openGraph: NonNullable<Metadata["openGraph"]> = {
    title,
    description,
    url: canonicalUrl,
    siteName: input.brandName,
    type: "website",
    locale: input.locale || "en_IN",
    images: input.imageUrl
      ? [
          {
            url: input.imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ]
      : undefined,
  };

  const twitter: NonNullable<Metadata["twitter"]> = {
    card: "summary_large_image",
    title,
    description,
    images: input.imageUrl ? [input.imageUrl] : undefined,
  };

  const robots: NonNullable<Metadata["robots"]> = {
    index: true,
    follow: true,
  };

  const metadata: Metadata = {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph,
    twitter,
    robots,
  };

  return {
    title,
    description,
    keywords,
    canonicalUrl,
    metadata,
    openGraph,
    twitter,
    robots,
  };
}

export type SeoHeadProps = SeoServiceCityInput & {
  render?: boolean;
};

export function SeoHead(props: SeoHeadProps) {
  const seo = buildServiceCitySeo(props);

  if (props.render === false) {
    return null;
  }

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(", ")} />
      <link rel="canonical" href={seo.canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.canonicalUrl} />
      <meta property="og:site_name" content={props.brandName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
    </>
  );
}

export function buildServiceCityPath(serviceSlug: string, citySlug: string) {
  return `/${serviceSlug}/${citySlug}`;
}
