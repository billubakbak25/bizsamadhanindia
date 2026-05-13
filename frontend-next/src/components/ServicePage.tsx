import Link from "next/link";
import { CTA } from "@/components/CTA";
import { LeadForm } from "@/components/LeadForm";
import { SEO } from "@/components/SEO";
import { StickyCTA } from "@/components/StickyCTA";
import { Card } from "@/components/ui/Card";
import { HERO_STATS, TESTIMONIALS } from "@/lib/constants";
import { formatServicePrice, type PricingRecord } from "@/lib/pricing";
import type { GeneratedSEOContent } from "@/lib/seoContentGenerator";
import { getServiceCatalogItem } from "@/lib/serviceCatalog";
import { getServiceCityCanonicalPath, type SeoFaq, type ServiceCitySeoPage } from "@/lib/seoData";

type ServicePageProps = {
  page: ServiceCitySeoPage;
  pricing?: PricingRecord | null;
  generatedContent?: GeneratedSEOContent | null;
};

type Inclusion = {
  title: string;
  body: string;
};

function serviceCityPath(service: string, city: string) {
  return getServiceCityCanonicalPath({ service, city });
}

function pricingBands(page: ServiceCitySeoPage, pricing?: PricingRecord | null) {
  if (!pricing?.finalPrice) {
    return page.pricing;
  }

  return [
    {
      label: "All inclusive starter",
      amount: formatServicePrice(pricing.finalPrice),
      note: `Current admin-controlled price for ${page.service.title}. Includes consultation, document checklist, filing guidance, and workflow handoff.`,
    },
    ...page.pricing.filter((band) => String(band.amount).toLowerCase() === "custom"),
  ];
}

function buildConversionFaqs(page: ServiceCitySeoPage, priceLabel: string): SeoFaq[] {
  const additionalFaqs: SeoFaq[] = [
    {
      question: `How fast can ${page.service.title} be started in ${page.city.name}?`,
      answer: "Most requests can be started within 24-48 hours after basic details and documents are shared.",
    },
    {
      question: `What documents are needed for ${page.service.title}?`,
      answer: "The exact checklist depends on the service, but our team confirms the required ID, entity, tax, and supporting documents after the enquiry.",
    },
    {
      question: `What is included in the ${priceLabel} price?`,
      answer: "The starter price includes expert review, document checklist, filing or workflow guidance, CRM tracking, and service handoff support unless your case needs a custom scope.",
    },
    {
      question: "Are there hidden charges?",
      answer: "No hidden platform charges are added on this page. If government fees or custom scope apply, the team confirms them before execution.",
    },
    {
      question: "What support do I get after payment?",
      answer: "After payment, your request is connected to the service workflow so the team can track next steps, follow-ups, and delivery status.",
    },
  ];
  const seen = new Set<string>();

  return [...page.faqs, ...additionalFaqs].filter((faq) => {
    const key = faq.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

function buildInclusions(serviceName: string): Inclusion[] {
  return [
    { title: "Expert consultation", body: `Clear next steps for ${serviceName} before your file moves forward.` },
    { title: "Document checklist", body: "A practical checklist so you do not waste time guessing requirements." },
    { title: "CRM tracking", body: "Your enquiry is captured into the operating pipeline for follow-up." },
    { title: "Workflow handoff", body: "Paid requests move into the service execution path after verification." },
  ];
}

export function ServicePage({ page, pricing = null, generatedContent = null }: ServicePageProps) {
  const catalogItem = getServiceCatalogItem(page.service.slug);
  const serviceCode = catalogItem?.code || page.service.slug;
  const exactPrice = pricing?.finalPrice ? formatServicePrice(pricing.finalPrice) : page.pricing[0]?.amount || "live pricing";
  const heroPrice = pricing?.finalPrice ? exactPrice : exactPrice.toLowerCase() === "live pricing" ? "live pricing" : exactPrice;
  const serviceLabel = `${page.service.title} in ${page.city.name}`;
  const bands = pricingBands(page, pricing);
  const conversionFaqs = generatedContent?.faqs || buildConversionFaqs(page, exactPrice);
  const inclusions = buildInclusions(page.service.title);
  const displayedBenefits = generatedContent?.benefits || page.benefits;
  const displayedProcessSteps = generatedContent?.process.map((description, index) => ({ title: `Step ${index + 1}`, description })) || page.processSteps;
  const heroIntro = generatedContent?.intro || "Start in 24-48 hours with expert support, CRM-tracked follow-up, and a secure Razorpay checkout when you are ready to pay.";
  const trustStat = HERO_STATS[0] || { label: "Clients supported", value: "500+" };

  return (
    <section className="px-4 py-10 pb-32 sm:px-6 lg:px-8 lg:py-16">
      <SEO page={page} price={pricing?.finalPrice ?? null} faqs={conversionFaqs} />

      <div className="mx-auto max-w-7xl space-y-10">
        {generatedContent?.breadcrumbs ? (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {generatedContent.breadcrumbs.map((crumb, index) => {
              const isLast = index === generatedContent.breadcrumbs.length - 1;

              return (
                <span key={`${crumb.label}-${crumb.href}`} className="inline-flex items-center gap-2">
                  {isLast ? (
                    <span className="text-slate-800">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="transition hover:text-[var(--brand)]">{crumb.label}</Link>
                  )}
                  {!isLast ? <span aria-hidden="true">/</span> : null}
                </span>
              );
            })}
          </nav>
        ) : null}
        <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-start">
          <div className="space-y-6">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
              <span>Limited time offer</span>
              <span className="h-1 w-1 rounded-full bg-emerald-700" />
              <span>Free consultation</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                {serviceLabel} at {heroPrice}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600">
                {heroIntro}
              </p>
            </div>
            <CTA serviceName={page.service.title} cityName={page.city.name} serviceCode={serviceCode} price={pricing?.finalPrice ?? null} />
            <div className="grid gap-3 sm:grid-cols-3">
              {["24-48 hrs start", "100% expert support", `${trustStat.value} ${trustStat.label}`].map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-800 shadow-sm shadow-slate-950/5">
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-[2rem] border border-amber-100 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
              <strong>Risk reducer:</strong> free consultation, clear document checklist, no hidden platform cost, and support until the next step is clear.
            </div>
          </div>
          <LeadForm
            id="lead-form"
            placement="seo_top_form"
            serviceName={page.service.title}
            serviceCode={serviceCode}
            cityName={page.city.name}
            servicePrice={pricing?.finalPrice ?? null}
            title={`Start now: ${page.service.title}`}
            description="3 fields only. Submit the enquiry or buy now with the correct service code already selected."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-5 md:col-span-2">
            <p className="text-sm font-medium text-slate-500">Exact price</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">Starting at {exactPrice}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">All inclusive starter scope. Custom government fees or complex cases are confirmed before execution.</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">Time</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">24-48 hrs</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">Fast intake after details are shared.</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">Support</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">100%</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">Expert-assisted workflow.</p>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {displayedBenefits.map((benefit) => (
            <Card key={benefit} className="p-6 text-sm leading-7 text-slate-700">
              <p className="font-semibold text-slate-950">Why this works</p>
              <p className="mt-3">{benefit}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            <Card className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Trust block</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Trusted by 500+ clients</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {["4.8/5 Google rating placeholder", "CA and tax expert support", "Razorpay secured checkout", "CRM + workflow tracking"].map((badge) => (
                  <div key={badge} className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
                    {badge}
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-slate-950">Client proof</h2>
              <div className="mt-5 space-y-4">
                {TESTIMONIALS.slice(0, 3).map((testimonial) => (
                  <blockquote key={testimonial.author} className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">
                    <p>"{testimonial.quote}"</p>
                    <footer className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{testimonial.author}</footer>
                  </blockquote>
                ))}
              </div>
            </Card>
          </div>
          <LeadForm
            id="lead-form-middle"
            placement="seo_middle_form"
            serviceName={page.service.title}
            serviceCode={serviceCode}
            cityName={page.city.name}
            servicePrice={pricing?.finalPrice ?? null}
            title="Get free expert review"
            description="Same short form, auto-filled for this service and city. Use it if you want a callback before paying."
          />
        </div>

        {generatedContent ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-slate-950">{generatedContent.serviceOverview.heading}</h2>
              <div className="mt-5 space-y-4 text-sm leading-8 text-slate-600">
                {generatedContent.serviceOverview.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </Card>
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-slate-950">{generatedContent.localSignals.heading}</h2>
              <div className="mt-5 space-y-4 text-sm leading-8 text-slate-600">
                {generatedContent.localSignals.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Variation {generatedContent.variationId} - {generatedContent.bodyWordCount} words</p>
            </Card>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-slate-950">What is included</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {inclusions.map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-slate-950">{generatedContent?.pricing.heading || "Pricing clarity"}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Starting at {exactPrice} (all inclusive starter scope). No hidden platform cost.</p>
            {generatedContent ? <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">{generatedContent.pricing.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div> : null}
            <div className="mt-6 space-y-4">
              {bands.map((band) => (
                <div key={`${band.label}-${band.amount}`} className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-base font-semibold text-slate-950">{band.label}</p>
                    <p className="text-base font-semibold text-[var(--brand)]">{band.amount}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{band.note}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            {displayedProcessSteps.map((step, index) => (
              <Card key={step.title} className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Step {index + 1}</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">{step.title}</h2>
                <p className="mt-4 text-sm leading-8 text-slate-600">{step.description}</p>
              </Card>
            ))}
          </div>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-slate-950">Documents required</h2>
            <p className="mt-4 text-sm leading-8 text-slate-600">{page.service.intro}</p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
              {(generatedContent?.documents || ["Identity proof", "Service details", "Contact information", "Supporting documents"]).map((document) => (
                <li key={document} className="rounded-2xl bg-slate-50 px-4 py-3">{document}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-8 text-slate-600">The page keeps one conversion path: submit details, talk to an expert, or pay through Razorpay with the same service code.</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-slate-950">FAQs</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {conversionFaqs.map((faq) => (
              <details key={faq.question} className="rounded-3xl border border-slate-200 bg-white p-5">
                <summary className="cursor-pointer list-none text-base font-semibold text-slate-950">{faq.question}</summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Card className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--brand)]">Final CTA</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Start {page.service.title} in {page.city.name} today</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Free consultation, secure checkout, and no repeated service selection.</p>
            <div className="mt-6">
              <CTA serviceName={page.service.title} cityName={page.city.name} serviceCode={serviceCode} price={pricing?.finalPrice ?? null} targetId="lead-form-bottom" variant="compact" />
            </div>
          </Card>
          <LeadForm
            id="lead-form-bottom"
            placement="seo_bottom_form"
            serviceName={page.service.title}
            serviceCode={serviceCode}
            cityName={page.city.name}
            servicePrice={pricing?.finalPrice ?? null}
            title="Last step: start or buy now"
            description="One fast form. We keep the service and city locked so there is no mismatch in CRM or payment validation."
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-slate-950">Related services</h2>
            <div className="mt-5 grid gap-4">
              {page.relatedServices.slice(0, 2).map((service) => (
                <Link key={service.slug} href={serviceCityPath(service.slug, page.city.slug)} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-[var(--brand)]">
                  <p className="text-base font-semibold text-slate-950">{service.title} in {page.city.name}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{service.summary}</p>
                </Link>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-slate-950">Nearby cities</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {page.nearbyCities.slice(0, 4).map((city) => (
                <Link key={city.slug} href={serviceCityPath(page.service.slug, city.slug)} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-[var(--brand)]">
                  <p className="text-base font-semibold text-slate-950">{page.service.title} in {city.name}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Nearby support in {city.state}.</p>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <StickyCTA serviceName={page.service.title} cityName={page.city.name} serviceCode={serviceCode} price={pricing?.finalPrice ?? null} />
    </section>
  );
}
