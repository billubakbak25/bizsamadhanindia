import { CITIES, type ProgrammaticCity } from "@/lib/cities";
import { SERVICES, type ProgrammaticService } from "@/lib/services";

export const MAX_PROGRAMMATIC_SEO_PAGES = 100;
export const PROGRAMMATIC_SEO_NOINDEX = true;
export const MIN_PROGRAMMATIC_WORD_COUNT = 600;

type GeneratedFaq = {
  question: string;
  answer: string;
};

type GeneratedContentBlock = {
  heading: string;
  body: string[];
};

export type GeneratedSEOContent = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  serviceOverview: GeneratedContentBlock;
  localSignals: GeneratedContentBlock;
  benefits: string[];
  pricing: GeneratedContentBlock;
  documents: string[];
  process: string[];
  faqs: GeneratedFaq[];
  breadcrumbs: Array<{ label: string; href: string }>;
  bodyWordCount: number;
  variationId: number;
  isSafeToIndex: boolean;
  noindexReason?: string;
};

const introTemplates = [
  "Get {service} in {city} quickly with expert support, a clear document checklist, and workflow-backed execution.",
  "Looking for {service} in {city}? We simplify the process with local context, pricing clarity, and expert-led follow-up.",
  "Apply for {service} in {city} with trusted professionals who keep the process structured, fast, and easy to track.",
  "Start {service} in {city} with a practical plan for fees, documents, timelines, and next-step support.",
  "For businesses and professionals in {city}, {service} becomes easier when pricing, documents, and process are explained upfront.",
];

const overviewTemplates = [
  "This page is built for people who want a clear service path instead of vague legal or tax advice. It explains the fee range, documents, process, local relevance, and next action in one place so the enquiry can move into CRM without repeated discovery.",
  "The goal is to reduce confusion before a callback. You can understand what the service usually includes, how the city context affects urgency, which documents are commonly needed, and when paying immediately makes sense.",
  "Instead of sending every visitor through a generic contact page, this page narrows the conversation to a specific service and city. That gives the advisory team cleaner context and helps users move faster from search intent to execution.",
];

const localTierLines: Record<ProgrammaticCity["tier"], string[]> = {
  1: [
    "High demand in metro cities like {city} means founders, finance teams, and operators usually need faster turnaround with fewer follow-up loops.",
    "In a tier 1 market such as {city}, users often compare providers closely, so clarity on fees, process, and documents matters before they submit details.",
  ],
  2: [
    "Growing businesses in {city} require practical support that balances speed, affordability, and dependable follow-up.",
    "In {city}, many small businesses and professionals need a simple service path that explains what happens before and after submission.",
  ],
  3: [
    "Emerging business demand in {city} makes guided support useful for users who want fewer assumptions and a clearer document path.",
    "For tier 3 locations like {city}, a structured online process helps users access expert support without waiting for repeated offline coordination.",
  ],
};

const benefitTemplates = [
  "Clear fee visibility before the first call",
  "Document checklist aligned to the selected service",
  "CRM-tracked follow-up after lead submission",
  "Razorpay checkout available when the user is ready to pay",
  "Workflow handoff after successful payment verification",
  "Local city context included in the service request",
];

const professionalMix = ["CA-led", "CS-reviewed", "advocate-assisted", "tax expert guided", "compliance specialist supported"];

const documentsByCategory: Record<string, string[]> = {
  tax: ["PAN", "Aadhaar or identity proof", "business or income details", "bank details", "supporting invoices or statements"],
  "business-formation": ["PAN of promoters", "address proof", "business name options", "registered office proof", "director or founder details"],
  compliance: ["entity master data", "previous filings", "financial records", "board or owner approvals", "supporting statutory documents"],
  "intellectual-property": ["brand name or work details", "applicant ID proof", "logo or creative sample", "business proof if applicable", "authorization details"],
  finance: ["bank statements", "sales and purchase records", "expense documents", "GST or tax records if applicable", "existing ledgers"],
  service: ["identity proof", "service-specific records", "business details", "contact details", "supporting documents"],
};

const processTemplates = [
  "Submit name, phone, optional email, and the auto-filled service-city context.",
  "Receive a quick expert review with documents and fee scope confirmed before execution.",
  "Share required documents through the advised channel so the team can validate readiness.",
  "Proceed with Razorpay payment if you want to move from enquiry to execution immediately.",
  "Track follow-up through the CRM and service workflow after the request is accepted.",
];

function interpolate(template: string, service: ProgrammaticService, city: ProgrammaticCity) {
  return template
    .replace(/\{service\}/g, service.name)
    .replace(/\{city\}/g, city.name)
    .replace(/\{state\}/g, city.state)
    .replace(/\{price\}/g, String(service.price));
}

function hashSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pick<T>(items: T[], seed: number, offset = 0) {
  return items[(seed + offset) % items.length];
}

function dedupeFaqs(faqs: GeneratedFaq[]) {
  const seen = new Set<string>();
  return faqs.filter((faq) => {
    const key = faq.question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function countWords(parts: Array<string | string[] | GeneratedContentBlock | GeneratedFaq[]>) {
  const text = parts
    .flatMap((part) => {
      if (Array.isArray(part)) {
        return part.map((item) => (typeof item === "string" ? item : `${item.question} ${item.answer}`));
      }

      if (typeof part === "string") return part;
      return [part.heading, ...part.body];
    })
    .join(" ");

  return text.split(/\s+/g).filter(Boolean).length;
}

function buildFaqs(service: ProgrammaticService, city: ProgrammaticCity, professional: string) {
  return dedupeFaqs([
    {
      question: `What is the cost of ${service.name} in ${city.name}?`,
      answer: `${service.name} in ${city.name} starts at Rs ${service.price}. The final scope can change if government fees, additional filings, or unusual documentation are required, but the base service pricing is shown upfront to reduce confusion.`,
    },
    {
      question: `How long does ${service.name} take in ${city.name}?`,
      answer: `Most ${service.name} requests in ${city.name} can be started within 24-48 hours after the user submits details and shares the required documents. Timelines depend on document readiness and department processing where applicable.`,
    },
    {
      question: `Which documents are required for ${service.name}?`,
      answer: `Common documents include ${((documentsByCategory[service.category] || documentsByCategory.service) ?? []).slice(0, 4).join(", ")}. The team confirms the exact checklist after reviewing the service-city context.`,
    },
    {
      question: `Is ${service.name} handled by an expert?`,
      answer: `Yes. The request is routed through ${professional} support so users in ${city.name} get clearer next steps instead of generic form responses.`,
    },
    {
      question: `Can I pay online for ${service.name} in ${city.name}?`,
      answer: "Yes. If the service is ready for checkout, the page can start the existing Razorpay order flow using the same service code that the CRM receives.",
    },
    {
      question: "What happens after I submit the lead form?",
      answer: "The enquiry is sent to the CRM lead pipeline with service and city context. Follow-up and workflow handling then continue through the existing backend system.",
    },
  ]);
}

export function getProgrammaticRouteIndex(serviceSlug: string, citySlug: string) {
  const serviceIndex = SERVICES.findIndex((service) => service.slug === serviceSlug);
  const cityIndex = CITIES.findIndex((city) => city.slug === citySlug);

  if (serviceIndex < 0 || cityIndex < 0) {
    return -1;
  }

  return cityIndex * SERVICES.length + serviceIndex;
}

export function isWithinInitialProgrammaticBatch(serviceSlug: string, citySlug: string) {
  const routeIndex = getProgrammaticRouteIndex(serviceSlug, citySlug);
  return routeIndex >= 0 && routeIndex < MAX_PROGRAMMATIC_SEO_PAGES;
}

export function getProgrammaticSeoRobots(serviceSlug: string, citySlug: string) {
  const inBatch = isWithinInitialProgrammaticBatch(serviceSlug, citySlug);

  return {
    index: !PROGRAMMATIC_SEO_NOINDEX && inBatch,
    follow: true,
  };
}

export function getSafeProgrammaticSitemapPaths() {
  if (PROGRAMMATIC_SEO_NOINDEX) {
    return [];
  }

  return CITIES.flatMap((city) => SERVICES.map((service) => ({ service, city })))
    .filter(({ service, city }) => isWithinInitialProgrammaticBatch(service.slug, city.slug))
    .slice(0, MAX_PROGRAMMATIC_SEO_PAGES)
    .map(({ service, city }) => `/${service.slug}/${city.slug}`);
}

export function generateSEOContent(service: ProgrammaticService, city: ProgrammaticCity): GeneratedSEOContent {
  const seed = hashSeed(`${service.code}:${city.slug}:${city.tier}:${city.rank}`);
  const variationId = seed % 997;
  const intro = interpolate(pick(introTemplates, seed), service, city);
  const localLinePrimary = interpolate(pick(localTierLines[city.tier], seed, 1), service, city);
  const localLineSecondary = `${city.name} sits in ${city.state}, and users here often need service partners who can explain fees, documents, and payment steps without switching between separate pages.`;
  const professional = pick(professionalMix, seed, 2);
  const documents = documentsByCategory[service.category] || documentsByCategory.service;
  const benefits = benefitTemplates.map((benefit, index) => (index % 2 === seed % 2 ? `${benefit} for ${city.name}` : benefit)).slice(0, 5);
  const process = processTemplates.map((step, index) => `${index + 1}. ${step}`);

  const serviceOverview: GeneratedContentBlock = {
    heading: `${service.name} overview for ${city.name}`,
    body: [
      `${service.description} ${pick(overviewTemplates, seed, 3)} This keeps the page useful for both searchers and the internal team because the service code, city, price, documents, and process are connected before a lead is submitted.`,
      `For ${city.name}, the practical value is clarity. Users can compare the starting price, see what is normally included, understand common documents, and decide whether to request a callback or pay online. The page avoids generic claims by using the selected city, state, service category, and tier-specific local context.`,
      `${service.name} is handled as a ${professional} workflow. That means the enquiry is not just a contact message; it is sent with service-city intent so the CRM and follow-up path can respond with better context.`,
      `For ranking safety, this content engine adds service category, city rank, state, pricing, document expectations, and process details into the page instead of only swapping city names. That gives each URL a stronger reason to exist before it is opened for indexing.`,
      `The conversion path is also intentional. Visitors can scan the fee, documents, FAQs, and local support notes before choosing a callback or payment, which lowers friction without creating duplicate lead capture logic.`,
    ],
  };

  const localSignals: GeneratedContentBlock = {
    heading: `Local signals for ${city.name}`,
    body: [
      localLinePrimary,
      localLineSecondary,
      `Because ${city.name} is treated as a tier ${city.tier} market in this rollout, the page language changes around demand, speed, and service readiness instead of repeating the same city paragraph across every URL.`,
      `The local section is not meant to pretend there is an offline branch in every city. It explains why the service is relevant for searchers in ${city.name} and keeps the promise tied to remote expert execution, CRM follow-up, and verified payment flow.`,
    ],
  };

  const pricing: GeneratedContentBlock = {
    heading: `${service.name} fees in ${city.name}`,
    body: [
      `${service.name} in ${city.name} starts at Rs ${service.price}. The pricing block is intentionally clear because fee ambiguity can reduce conversion and create low-quality enquiries.`,
      `The starter scope includes expert review, a document checklist, service guidance, CRM follow-up, and workflow handoff. If a case needs a government fee, additional professional certification, or a custom advisory review, the team confirms that before execution.`,
      `The page also supports Razorpay checkout using the same service code, ${service.code}, so the payment flow does not depend on user-facing labels or duplicate frontend pricing logic.`,
      `For safer scaling, pricing is described as a starting point and not as a universal promise for every edge case. This protects conversion quality while still giving search users a useful cost anchor before they submit details.`,
    ],
  };

  const faqs = buildFaqs(service, city, professional);
  const title = `${service.name} in ${city.name} - Fees, Process, Documents`;
  const metaTitle = `${service.name} in ${city.name} | Price Rs ${service.price}`;
  const metaDescription = `${service.name} in ${city.name}, ${city.stateCode} from Rs ${service.price}. Check fees, documents, process, local support, FAQs, and start with expert help.`;
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: service.name, href: `/${service.slug}` },
    { label: city.name, href: `/${service.slug}/${city.slug}` },
  ];
  const bodyWordCount = countWords([intro, serviceOverview, localSignals, benefits, pricing, documents, process, faqs]);
  const inBatch = isWithinInitialProgrammaticBatch(service.slug, city.slug);
  const uniqueElementCount = [intro, localLinePrimary, faqs[0]?.question || ""].filter(Boolean).length;
  const isSafeToIndex = inBatch && bodyWordCount >= MIN_PROGRAMMATIC_WORD_COUNT && uniqueElementCount >= 3 && !PROGRAMMATIC_SEO_NOINDEX;
  const noindexReason = !inBatch
    ? "outside_initial_safe_batch"
    : bodyWordCount < MIN_PROGRAMMATIC_WORD_COUNT
      ? "content_below_word_count_gate"
      : PROGRAMMATIC_SEO_NOINDEX
        ? "initial_validation_noindex_enabled"
        : undefined;

  return {
    title,
    metaTitle,
    metaDescription,
    h1: title,
    intro,
    serviceOverview,
    localSignals,
    benefits,
    pricing,
    documents,
    process,
    faqs,
    breadcrumbs,
    bodyWordCount,
    variationId,
    isSafeToIndex,
    noindexReason,
  };
}
