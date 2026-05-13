import type { Metadata } from "next";
import { COMPANY, SITE_URL } from "./constants";
import { SERVICE_CATALOG } from "./serviceCatalog";

export type SeoServiceCategory = "tax" | "business-formation" | "compliance" | "intellectual-property" | "finance" | "local-advisory";
export type SeoRegion = "North" | "South" | "East" | "West" | "Central" | "Northeast";
export type SeoFaq = { question: string; answer: string };
export type SeoProcessStep = { title: string; description: string };
export type SeoPricingBand = { label: string; amount: string; note: string };
export type SeoServiceRecord = { slug: string; title: string; category: SeoServiceCategory; summary: string; intro: string; benefits: string[]; processSteps: SeoProcessStep[]; pricing: SeoPricingBand[]; faqs: SeoFaq[]; relatedServiceSlugs: string[]; keywords: string[] };
export type SeoCityRecord = { slug: string; name: string; state: string; region: SeoRegion; rank: number };
export type ServiceCityRouteParams = { service: string; city: string };
export type ServiceCityLookupInput = ServiceCityRouteParams | { slug: string };
export type SeoMetadataInput = { service: SeoServiceRecord; city: SeoCityRecord; canonicalPath: string };
export type ServiceCitySeoPage = { service: SeoServiceRecord; city: SeoCityRecord; canonicalPath: string; title: string; description: string; keywords: string[]; relatedServices: SeoServiceRecord[]; nearbyCities: SeoCityRecord[]; benefits: string[]; processSteps: SeoProcessStep[]; pricing: SeoPricingBand[]; faqs: SeoFaq[] };

const SERVICE_CATEGORY_BY_SLUG: Record<string, SeoServiceCategory> = {
  "gst-registration": "tax",
  "itr-filing": "tax",
  "trademark-registration": "intellectual-property",
  "company-registration": "business-formation",
  "annual-compliance-filing": "compliance",
  "accounting-bookkeeping": "finance",
  "gst-return-filing": "compliance",
  "roc-filing": "compliance",
  "copyright-registration": "intellectual-property",
  "startup-india-registration": "business-formation",
};

const SERVICE_OVERRIDES: Record<string, Partial<SeoServiceRecord>> = {
  "gst-registration": { summary: "GST registration and post-registration guidance.", intro: "Launch GST readiness with a workflow built for speed, clarity, and compliance.", benefits: ["Fast registration support", "Next-step compliance guidance", "Less back-and-forth"], processSteps: [{ title: "Review", description: "Validate entity details and documents." }, { title: "File", description: "Submit through a clean checklist." }, { title: "Operate", description: "Map post-registration obligations." }], pricing: [{ label: "Starter", amount: "Live pricing", note: "Basic registration support." }, { label: "Business", amount: "Custom", note: "Urgent or multi-location filings." }], relatedServiceSlugs: ["itr-filing", "annual-compliance-filing", "company-registration"], keywords: ["gst registration", "gst filing", "tax setup", "business tax compliance"] },
  "itr-filing": { summary: "Income tax filing support with deductions review.", intro: "File income tax returns with a calm, structured workflow for professionals and founders.", benefits: ["Income source mapping", "Clean filing support", "Better records for future filings"], processSteps: [{ title: "Capture", description: "Gather income, deduction, and TDS inputs." }, { title: "Validate", description: "Cross-check filing position and missing docs." }, { title: "Submit", description: "Complete the return and share the summary." }], pricing: [{ label: "Starter", amount: "Live pricing", note: "Straightforward salaried filings." }, { label: "Plus", amount: "Custom", note: "Multiple incomes or advisory review." }], relatedServiceSlugs: ["gst-registration", "accounting-bookkeeping", "annual-compliance-filing"], keywords: ["itr filing", "income tax return", "tax filing", "deductions"] },
  "trademark-registration": { summary: "Trademark search and registration support.", intro: "Protect your brand with a filing flow designed to reduce surprises.", benefits: ["Brand review before filing", "Class selection support", "Objection-aware preparation"], processSteps: [{ title: "Search", description: "Scan for conflicts and align the class strategy." }, { title: "Prepare", description: "Compile the application package." }, { title: "Track", description: "Monitor the filing and respond if needed." }], pricing: [{ label: "Starter", amount: "Live pricing", note: "Single-mark filing support." }, { label: "Portfolio", amount: "Custom", note: "Multiple marks or broader coverage." }], relatedServiceSlugs: ["company-registration", "copyright-registration", "gst-registration"], keywords: ["trademark registration", "brand protection", "ip filing", "logo registration"] },
  "company-registration": { summary: "Company setup support for founders.", intro: "Turn the plan into an operating entity with a structured incorporation workflow.", benefits: ["Entity planning", "Founder paperwork support", "Launch checklist"], processSteps: [{ title: "Structure", description: "Choose the right entity path." }, { title: "Incorporate", description: "Prepare filings and paperwork." }, { title: "Launch", description: "Hand off GST, bank setup, and compliance." }], pricing: [{ label: "Starter", amount: "Live pricing", note: "Standard incorporation." }, { label: "Growth", amount: "Custom", note: "Complex structures." }], relatedServiceSlugs: ["gst-registration", "annual-compliance-filing", "startup-india-registration"], keywords: ["company registration", "private limited company", "incorporation", "business formation"] },
  "annual-compliance-filing": { summary: "Annual filing support with deadline planning.", intro: "Keep annual compliance predictable with an execution model that exposes deadlines early.", benefits: ["Deadline planning", "Clear ownership", "Reduced year-end chaos"], processSteps: [{ title: "Map", description: "Identify obligations and the filing calendar." }, { title: "Prepare", description: "Collect documents and close gaps." }, { title: "Submit", description: "Complete the filing and share status." }], pricing: [{ label: "Starter", amount: "Live pricing", note: "Basic annual filing support." }, { label: "Managed", amount: "Custom", note: "Recurring compliance ownership." }], relatedServiceSlugs: ["roc-filing", "gst-return-filing", "company-registration"], keywords: ["annual compliance", "roc filing", "company filing", "compliance"] },
  "accounting-bookkeeping": { summary: "Bookkeeping and accounting support.", intro: "Keep the books current, readable, and useful for decisions rather than just filing.", benefits: ["Monthly close support", "Cleaner finance visibility", "Compliance-ready records"], processSteps: [{ title: "Collect", description: "Gather source documents and ledgers." }, { title: "Reconcile", description: "Close the books and clean mismatches." }, { title: "Report", description: "Share practical finance outputs." }], pricing: [{ label: "Starter", amount: "Live pricing", note: "Lightweight monthly bookkeeping." }, { label: "Managed", amount: "Custom", note: "Recurring accounting ownership." }], relatedServiceSlugs: ["itr-filing", "annual-compliance-filing", "gst-return-filing"], keywords: ["bookkeeping", "accounting", "finance operations", "monthly close"] },
  "gst-return-filing": { summary: "Recurring GST return filing.", intro: "Run GST filing through a dependable cadence that reduces last-minute churn.", benefits: ["Monthly return management", "Input review", "Recurring cadence"], processSteps: [{ title: "Review", description: "Inspect transactions and dependencies." }, { title: "File", description: "Submit the return and track confirmation." }, { title: "Follow up", description: "Resolve issues and prep the next cycle." }], pricing: [{ label: "Starter", amount: "Live pricing", note: "Recurring return filing support." }, { label: "Managed", amount: "Custom", note: "Higher volume compliance." }], relatedServiceSlugs: ["gst-registration", "annual-compliance-filing", "accounting-bookkeeping"], keywords: ["gst return filing", "gst compliance", "tax returns", "monthly compliance"] },
  "roc-filing": { summary: "ROC filing support for companies.", intro: "Turn ROC obligations into a visible workflow with clear dependencies and owners.", benefits: ["Board and ROC alignment", "Document prep", "Fewer surprise deadlines"], processSteps: [{ title: "Assess", description: "Map the filing obligation and records." }, { title: "Prepare", description: "Build the filing package." }, { title: "Submit", description: "Handle the filing and confirm status." }], pricing: [{ label: "Starter", amount: "Live pricing", note: "Standard ROC filings." }, { label: "Managed", amount: "Custom", note: "Recurring secretarial support." }], relatedServiceSlugs: ["annual-compliance-filing", "company-registration", "gst-registration"], keywords: ["roc filing", "company compliance", "secretarial filing", "annual return"] },
  "copyright-registration": { summary: "Copyright registration support.", intro: "Protect original work with a filing flow that is practical for creators and product teams.", benefits: ["Ownership clarity", "Application support", "Better protection posture"], processSteps: [{ title: "Classify", description: "Identify the work type and ownership structure." }, { title: "Prepare", description: "Gather supporting materials." }, { title: "Submit", description: "File and track the application status." }], pricing: [{ label: "Starter", amount: "Live pricing", note: "Standard copyright support." }, { label: "Studio", amount: "Custom", note: "Portfolios and multi-asset ownership." }], relatedServiceSlugs: ["trademark-registration", "company-registration", "accounting-bookkeeping"], keywords: ["copyright registration", "creative assets", "ip protection", "ownership"] },
  "startup-india-registration": { summary: "Startup India recognition support.", intro: "Build a recognition-ready filing path that aligns with the company's launch posture.", benefits: ["Eligibility review", "Clear documentation expectations", "Recognition aligned with milestones"], processSteps: [{ title: "Check", description: "Review eligibility and readiness." }, { title: "Prepare", description: "Gather support documents." }, { title: "File", description: "Complete submission and track outcome." }], pricing: [{ label: "Starter", amount: "Live pricing", note: "Eligibility and filing support." }, { label: "Growth", amount: "Custom", note: "Broader startup advisory." }], relatedServiceSlugs: ["company-registration", "gst-registration", "annual-compliance-filing"], keywords: ["startup india registration", "startup recognition", "business setup", "founder support"] },
};

export const SEO_SERVICES: SeoServiceRecord[] = SERVICE_CATALOG.map((service) => {
  const slug = slugify(service.slug);
  const title = service.name;
  const category = SERVICE_CATEGORY_BY_SLUG[slug] || inferCategoryFromSlug(slug);
  const base: SeoServiceRecord = { slug, title, category, summary: `${title} support delivered through a clean, SEO-ready service page system.`, intro: `Find ${title.toLowerCase()} support that is easy to scan, fast to act on, and built for high-intent traffic.`, benefits: ["Structured discovery and execution flow", "Clear next steps for founders and operators", "SEO-friendly content and schema"], processSteps: [{ title: "Inspect", description: "Understand the service request and context." }, { title: "Match", description: "Align the right service, city, and next action." }, { title: "Convert", description: "Guide the user toward callback or consultation." }], pricing: [{ label: "Indicative", amount: "Custom", note: "Final pricing depends on scope and urgency." }], faqs: defaultFaqs(title), relatedServiceSlugs: [], keywords: [title.toLowerCase(), `${title.toLowerCase()} service`, `${title.toLowerCase()} near me`, ...categoryKeywords(category)] };
  const override = SERVICE_OVERRIDES[slug] || {};
  return { ...base, ...override, slug, title, category, summary: override.summary || base.summary, intro: override.intro || base.intro, benefits: override.benefits || base.benefits, processSteps: override.processSteps || base.processSteps, pricing: override.pricing || base.pricing, faqs: override.faqs || base.faqs, relatedServiceSlugs: override.relatedServiceSlugs || base.relatedServiceSlugs, keywords: override.keywords || base.keywords };
});

const SERVICE_INDEX = new Map<string, SeoServiceRecord>(SEO_SERVICES.map((service) => [service.slug, service]));

export function slugify(value: string) {
  return value.trim().toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function getSeoServiceBySlug(slug: string) {
  return SERVICE_INDEX.get(slugify(slug)) || null;
}

export function getServiceCityCanonicalPath(input: ServiceCityRouteParams) {
  return `/${slugify(input.service)}/${slugify(input.city)}`;
}

export function getServiceCityLegacyPath(input: ServiceCityRouteParams) {
  return `/${slugify(input.service)}-${slugify(input.city)}`;
}

export function buildCanonicalUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

export function buildServiceCityKeywords(service: SeoServiceRecord, city: SeoCityRecord) {
  return [service.title, `${service.title} in ${city.name}`, `${service.title} ${city.name}`, `${service.title} ${city.state}`, `${city.name} ${service.category}`, ...service.keywords];
}

export function buildServiceCityMetadataInput(input: ServiceCityLookupInput): SeoMetadataInput | null {
  const resolved = "slug" in input ? resolveServiceCityRouteSlug(input.slug) : resolveServiceCityRouteInput(input);
  return resolved ? { service: resolved.service, city: resolved.city, canonicalPath: getServiceCityCanonicalPath({ service: resolved.service.slug, city: resolved.city.slug }) } : null;
}

export function buildServiceCityMetadata(input: ServiceCityLookupInput): Metadata | null {
  const resolved = "slug" in input ? resolveServiceCityRouteSlug(input.slug) : resolveServiceCityRouteInput(input);
  if (!resolved) return null;
  const canonicalPath = getServiceCityCanonicalPath({ service: resolved.service.slug, city: resolved.city.slug });
  const title = `${resolved.service.title} in ${resolved.city.name} | ${COMPANY.name}`;
  const description = `${resolved.service.title} in ${resolved.city.name}, ${resolved.city.state} with SSR delivery, structured workflows, and conversion-focused support from ${COMPANY.name}.`;
  return { title, description, keywords: buildServiceCityKeywords(resolved.service, resolved.city), alternates: { canonical: buildCanonicalUrl(canonicalPath) }, openGraph: { title, description, url: buildCanonicalUrl(canonicalPath), siteName: COMPANY.name, type: "article", locale: "en_IN", images: [{ url: buildCanonicalUrl("/og-image.svg"), width: 1200, height: 630, alt: title }] }, twitter: { card: "summary_large_image", title, description, images: [buildCanonicalUrl("/og-image.svg")] } };
}

export function resolveServiceCityRouteSlug(slug: string) {
  const cleanSlug = slugify(slug);
  const serviceMatch = SEO_SERVICES.slice().sort((left, right) => right.slug.length - left.slug.length).find((service) => cleanSlug.startsWith(`${service.slug}-`));
  if (!serviceMatch) return null;
  const city = getSeoCityBySlug(cleanSlug.slice(serviceMatch.slug.length + 1));
  return city ? { service: serviceMatch, city } : null;
}

export function resolveServiceCityRouteInput(input: ServiceCityRouteParams) {
  const service = getSeoServiceBySlug(input.service);
  const city = getSeoCityBySlug(input.city);
  return service && city ? { service, city } : null;
}

export function buildServiceCityPage(input: ServiceCityLookupInput): ServiceCitySeoPage | null {
  const resolved = "slug" in input ? resolveServiceCityRouteSlug(input.slug) : resolveServiceCityRouteInput(input);
  if (!resolved) return null;
  const canonicalPath = getServiceCityCanonicalPath({ service: resolved.service.slug, city: resolved.city.slug });
  return { service: resolved.service, city: resolved.city, canonicalPath, title: `${resolved.service.title} in ${resolved.city.name} | ${COMPANY.name}`, description: `${resolved.service.title} in ${resolved.city.name}, ${resolved.city.state} with fast SSR content and a high-conversion enquiry flow.`, keywords: buildServiceCityKeywords(resolved.service, resolved.city), relatedServices: getRelatedServices(resolved.service.slug, 3), nearbyCities: getNearbyCities(resolved.city.slug, 6), benefits: resolved.service.benefits, processSteps: resolved.service.processSteps, pricing: resolved.service.pricing, faqs: resolved.service.faqs };
}

export function buildServiceCityStructuredData(input: SeoMetadataInput) {
  const pageUrl = buildCanonicalUrl(input.canonicalPath);
  const description = `${input.service.title} in ${input.city.name}, ${input.city.state} with a structured, conversion-focused page experience from ${COMPANY.name}.`;
  const primaryPricing = input.service.pricing[0];
  const hasNumericPricing = primaryPricing ? /^\d+(\.\d+)?$/.test(String(primaryPricing.amount || "").trim()) : false;

  return {
    localBusiness: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: `${COMPANY.name} ${input.service.title} ${input.city.name}`,
      description,
      url: pageUrl,
      areaServed: { "@type": "City", name: input.city.name },
      address: {
        "@type": "PostalAddress",
        addressLocality: input.city.name,
        addressRegion: input.city.state,
        addressCountry: "IN",
      },
      provider: { "@type": "Organization", name: COMPANY.name, url: SITE_URL },
    },
    service: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: input.service.title,
      serviceType: input.service.category,
      description,
      url: pageUrl,
      areaServed: { "@type": "City", name: input.city.name },
      provider: { "@type": "Organization", name: COMPANY.name, url: SITE_URL },
      offers: hasNumericPricing && primaryPricing
        ? {
            "@type": "Offer",
            price: primaryPricing.amount,
            priceCurrency: "INR",
            description: primaryPricing.note,
          }
        : undefined,
    },
    faqPage: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: input.service.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  };
}

export function getRelatedServices(serviceSlug: string, limit = 3) {
  const service = getSeoServiceBySlug(serviceSlug);
  if (!service) return [];
  const related = [...service.relatedServiceSlugs.map((slug) => getSeoServiceBySlug(slug)).filter(Boolean), ...SEO_SERVICES.filter((candidate) => candidate.slug !== service.slug && candidate.category === service.category), ...SEO_SERVICES.filter((candidate) => candidate.slug !== service.slug && candidate.keywords.some((keyword) => service.keywords.includes(keyword)))] as SeoServiceRecord[];
  return dedupeServices(related).slice(0, limit);
}
const CITY_DATA = `
delhi|Delhi|Delhi|North|1
mumbai|Mumbai|Maharashtra|West|2
bengaluru|Bengaluru|Karnataka|South|3
hyderabad|Hyderabad|Telangana|South|4
chennai|Chennai|Tamil Nadu|South|5
kolkata|Kolkata|West Bengal|East|6
pune|Pune|Maharashtra|West|7
ahmedabad|Ahmedabad|Gujarat|West|8
jaipur|Jaipur|Rajasthan|North|9
surat|Surat|Gujarat|West|10
lucknow|Lucknow|Uttar Pradesh|North|11
kanpur|Kanpur|Uttar Pradesh|North|12
nagpur|Nagpur|Maharashtra|Central|13
indore|Indore|Madhya Pradesh|Central|14
thane|Thane|Maharashtra|West|15
bhopal|Bhopal|Madhya Pradesh|Central|16
visakhapatnam|Visakhapatnam|Andhra Pradesh|South|17
patna|Patna|Bihar|East|18
vadodara|Vadodara|Gujarat|West|19
ghaziabad|Ghaziabad|Uttar Pradesh|North|20
ludhiana|Ludhiana|Punjab|North|21
agra|Agra|Uttar Pradesh|North|22
nashik|Nashik|Maharashtra|West|23
faridabad|Faridabad|Haryana|North|24
meerut|Meerut|Uttar Pradesh|North|25
rajkot|Rajkot|Gujarat|West|26
kalyan-dombivli|Kalyan-Dombivli|Maharashtra|West|27
vasai-virar|Vasai-Virar|Maharashtra|West|28
varanasi|Varanasi|Uttar Pradesh|North|29
srinagar|Srinagar|Jammu and Kashmir|North|30
aurangabad|Aurangabad|Maharashtra|West|31
dhanbad|Dhanbad|Jharkhand|East|32
amritsar|Amritsar|Punjab|North|33
navi-mumbai|Navi Mumbai|Maharashtra|West|34
allahabad|Allahabad|Uttar Pradesh|North|35
howrah|Howrah|West Bengal|East|36
gwalior|Gwalior|Madhya Pradesh|Central|37
jabalpur|Jabalpur|Madhya Pradesh|Central|38
coimbatore|Coimbatore|Tamil Nadu|South|39
vijayawada|Vijayawada|Andhra Pradesh|South|40
jodhpur|Jodhpur|Rajasthan|North|41
madurai|Madurai|Tamil Nadu|South|42
raipur|Raipur|Chhattisgarh|Central|43
kota|Kota|Rajasthan|North|44
guwahati|Guwahati|Assam|Northeast|45
chandigarh|Chandigarh|Chandigarh|North|46
solapur|Solapur|Maharashtra|West|47
hubli-dharwad|Hubli-Dharwad|Karnataka|South|48
mysuru|Mysuru|Karnataka|South|49
tiruchirappalli|Tiruchirappalli|Tamil Nadu|South|50
bareilly|Bareilly|Uttar Pradesh|North|51
aligarh|Aligarh|Uttar Pradesh|North|52
tiruppur|Tiruppur|Tamil Nadu|South|53
moradabad|Moradabad|Uttar Pradesh|North|54
gurugram|Gurugram|Haryana|North|55
jalandhar|Jalandhar|Punjab|North|56
bhubaneswar|Bhubaneswar|Odisha|East|57
salem|Salem|Tamil Nadu|South|58
warangal|Warangal|Telangana|South|59
mira-bhayandar|Mira-Bhayandar|Maharashtra|West|60
jamshedpur|Jamshedpur|Jharkhand|East|61
bhiwandi|Bhiwandi|Maharashtra|West|62
cuttack|Cuttack|Odisha|East|63
firozabad|Firozabad|Uttar Pradesh|North|64
kochi|Kochi|Kerala|South|65
bhavnagar|Bhavnagar|Gujarat|West|66
dehradun|Dehradun|Uttarakhand|North|67
asansol|Asansol|West Bengal|East|68
nanded|Nanded|Maharashtra|Central|69
ajmer|Ajmer|Rajasthan|North|70
saharanpur|Saharanpur|Uttar Pradesh|North|71
kolhapur|Kolhapur|Maharashtra|West|72
akola|Akola|Maharashtra|Central|73
gulbarga|Gulbarga|Karnataka|South|74
gaya|Gaya|Bihar|East|75
ujjain|Ujjain|Madhya Pradesh|Central|76
loni|Loni|Uttar Pradesh|North|77
jhansi|Jhansi|Uttar Pradesh|North|78
ulhasnagar|Ulhasnagar|Maharashtra|West|79
davanagere|Davanagere|Karnataka|South|80
mangalore|Mangalore|Karnataka|South|81
erode|Erode|Tamil Nadu|South|82
muzaffarnagar|Muzaffarnagar|Uttar Pradesh|North|83
rajahmundry|Rajahmundry|Andhra Pradesh|South|84
bokaro|Bokaro|Jharkhand|East|85
kurnool|Kurnool|Andhra Pradesh|South|86
jharsuguda|Jharsuguda|Odisha|East|87
bharatpur|Bharatpur|Rajasthan|North|88
panipat|Panipat|Haryana|North|89
begusarai|Begusarai|Bihar|East|90
tirunelveli|Tirunelveli|Tamil Nadu|South|91
rourkela|Rourkela|Odisha|East|92
shivamogga|Shivamogga|Karnataka|South|93
puducherry|Puducherry|Puducherry|South|94
bikaner|Bikaner|Rajasthan|North|95
alwar|Alwar|Rajasthan|North|96
katihar|Katihar|Bihar|East|97
sonipat|Sonipat|Haryana|North|98
satara|Satara|Maharashtra|West|99
dhule|Dhule|Maharashtra|West|100
`;

export const SEO_CITIES: SeoCityRecord[] = CITY_DATA.trim().split("\n").map((line) => {
  const [slug, name, state, region, rank] = line.split("|");
  return { slug, name, state, region: region as SeoRegion, rank: Number(rank) };
});

const CITY_INDEX = new Map<string, SeoCityRecord>(SEO_CITIES.map((city) => [city.slug, city]));

export function getSeoCityBySlug(slug: string) {
  return CITY_INDEX.get(slugify(slug)) || null;
}

export function getNearbyCities(citySlug: string, limit = 6) {
  const city = getSeoCityBySlug(citySlug);
  if (!city) return [];

  const sameState = SEO_CITIES.filter((candidate) => candidate.slug !== city.slug && candidate.state === city.state);
  const sameRegion = SEO_CITIES.filter((candidate) => candidate.slug !== city.slug && candidate.region === city.region && candidate.state !== city.state);
  const rankedFallback = SEO_CITIES.filter((candidate) => candidate.slug !== city.slug).sort((left, right) => Math.abs(left.rank - city.rank) - Math.abs(right.rank - city.rank));

  return dedupeCities([...sameState, ...sameRegion, ...rankedFallback]).slice(0, limit);
}

export function getServiceCityStaticParams() {
  return SEO_SERVICES.flatMap((service) => SEO_CITIES.map((city) => ({ service: service.slug, city: city.slug })));
}

export function getServiceCitySitemapPaths() {
  return getServiceCityStaticParams().map((params) => getServiceCityCanonicalPath(params));
}

function defaultFaqs(serviceTitle: string): SeoFaq[] {
  return [
    { question: `How long does ${serviceTitle} usually take?`, answer: "Timelines depend on the document set, follow-up speed, and the exact filing posture, but the workflow is designed to stay fast and predictable." },
    { question: `Can you support ${serviceTitle} for multiple cities?`, answer: "Yes. The SEO layer is built to pair one service with many cities and keep the page content dynamically relevant." },
    { question: `Will I get a clear next step after the page enquiry?`, answer: "Yes. The page structure is designed around a conversion flow that routes users to a callback or consultation step." },
  ];
}

function categoryKeywords(category: SeoServiceCategory) {
  const map: Record<SeoServiceCategory, string[]> = {
    tax: ["tax services", "tax filing", "compliance support"],
    "business-formation": ["business setup", "company formation", "entity registration"],
    compliance: ["compliance services", "filing support", "secretarial support"],
    "intellectual-property": ["ip services", "brand protection", "rights registration"],
    finance: ["bookkeeping services", "accounting services", "finance operations"],
    "local-advisory": ["local advisory", "consultation support", "service advisory"],
  };

  return map[category];
}

function inferCategoryFromSlug(slug: string): SeoServiceCategory {
  if (slug.includes("trademark") || slug.includes("copyright")) return "intellectual-property";
  if (slug.includes("bookkeeping") || slug.includes("accounting")) return "finance";
  if (slug.includes("registration") || slug.includes("formation") || slug.includes("startup")) return "business-formation";
  if (slug.includes("filing") || slug.includes("compliance") || slug.includes("roc")) return "compliance";
  if (slug.includes("gst") || slug.includes("itr") || slug.includes("tax")) return "tax";
  return "local-advisory";
}

function dedupeCities(cities: SeoCityRecord[]) {
  const seen = new Set<string>();
  return cities.filter((city) => (seen.has(city.slug) ? false : (seen.add(city.slug), true)));
}

function dedupeServices(services: SeoServiceRecord[]) {
  const seen = new Set<string>();
  return services.filter((service) => (seen.has(service.slug) ? false : (seen.add(service.slug), true)));
}

