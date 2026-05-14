import type { Metadata } from "next";
import Link from "next/link";
import { Ban, CalendarClock, FileCheck2, Mail, Phone, Scale, ShieldCheck } from "lucide-react";
import { COMPANY, SITE_URL } from "@/lib/constants";

const pageUrl = new URL("/cancellation-policy", SITE_URL).toString();
const lastUpdated = "May 14, 2026";

type PolicySection = {
  id: string;
  title: string;
  body: string[];
};

const policySections: PolicySection[] = [
  {
    id: "scope",
    title: "1. Scope and service nature",
    body: [
      "This Cancellation Policy applies to paid service orders, consultation bookings, payment links, invoices, recurring compliance plans, and digital workflow engagements placed with BizSamadhan India for Indian legal, tax, business registration, compliance, documentation, and advisory services. Covered services include GST registration and return filing, Income Tax Return filing, ROC/MCA compliance, company incorporation, MSME registration, trademark services, digital documentation, consultation services, and subscription-based compliance support.",
      "BizSamadhan India delivers service outcomes through expert review, document collection, statutory portal preparation, compliance workflows, filing assistance, advisory communication, and digital handoff. Because these services involve professional time, authority-facing preparation, and operational allocation, cancellation eligibility depends on when the request is made and what work has already been initiated.",
    ],
  },
  {
    id: "procedure",
    title: "2. Cancellation request procedure",
    body: [
      `A cancellation request must be submitted in writing from the registered email address, registered mobile number, client portal, or contact form associated with the payment. Customers may write to ${COMPANY.email} and mention the payment reference, Razorpay payment ID or order ID, invoice number if available, selected service, customer name, registered phone number, and reason for cancellation.`,
      "Phone calls and WhatsApp messages may be used for status assistance, but a written cancellation request is required for audit, payment partner, and internal workflow records. BizSamadhan India may ask for additional verification before accepting a cancellation request, especially where the order value is high, identity details differ, or the request is raised by someone other than the payer or authorised customer representative.",
    ],
  },
  {
    id: "eligibility",
    title: "3. Service cancellation eligibility",
    body: [
      "Cancellation may be considered when the request is received before work initiation, before advisor allocation, before document review, before statutory form preparation, before portal activity, and before any government, filing, payment gateway, or third-party cost is committed. Eligibility is assessed from the internal CRM workflow, communication logs, uploaded document status, payment status, and service operations record.",
      "Submitting a cancellation request does not automatically cancel the service. BizSamadhan India must confirm whether the order is cancellable, partially cancellable, or no longer cancellable because service execution has moved beyond the permitted stage.",
    ],
  },
  {
    id: "before-initiation",
    title: "4. Cancellation before work initiation",
    body: [
      "If a valid cancellation request is received before substantive work starts, BizSamadhan India may cancel the order and close the workflow. Substantive work includes service diagnosis, document review, data validation, advisor assignment, filing preparation, portal login work, trademark or company name search, return computation, drafting, customer-specific checklist preparation, or statutory submission readiness activity.",
      "Where cancellation is accepted before work initiation, any eligible refund or payment adjustment will be handled under the Refund Policy. Processing fees, payment gateway charges, bank charges, administrative handling, or other costs already incurred may still be deducted where applicable.",
    ],
  },
  {
    id: "after-filing",
    title: "5. No cancellation after filing, submission, or authority-facing action",
    body: [
      "A service cannot be cancelled after filing, submission, challan generation, form upload, DSC use, authority-facing communication, government fee payment, statutory portal submission, trademark registry activity, MCA name reservation step, GST portal application activity, ITR preparation submission stage, or any comparable irreversible action has been initiated.",
      "Once such activity begins, BizSamadhan India may continue the service, pause for customer inputs, or close the engagement as per the service record, but cancellation will not undo statutory, filing, or government-facing activity already performed. Any financial consequence will be assessed under the Refund Policy and applicable service terms.",
    ],
  },
  {
    id: "fees",
    title: "6. Government fees, processing fees, and committed costs",
    body: [
      "Government fees, MCA fees, GST portal fees, income tax filing charges, trademark registry fees, challans, stamp duty, DSC or token charges, PAN/TAN-related charges, payment gateway fees, bank fees, and other statutory or third-party costs cannot be cancelled once paid, generated, booked, reserved, initiated, or committed on behalf of the customer.",
      "Processing fees and administrative charges are non-refundable where they relate to payment handling, order setup, advisor allocation, document intake, CRM workflow creation, compliance planning, customer communication, or other operational activity already performed before the cancellation request is reviewed.",
    ],
  },
  {
    id: "subscriptions",
    title: "7. Subscription, retainer, and auto-renewal cancellation",
    body: [
      "Subscription-based compliance services, monthly retainers, annual compliance plans, recurring GST return filing, bookkeeping retainers, and similar ongoing engagements may be cancelled prospectively according to the applicable plan terms. Cancellation affects future cycles and does not erase obligations, fees, or work already scheduled or performed for the current billing cycle.",
      "Auto-renewal cancellation requests should be submitted at least 7 Business Working Days before the next renewal date to allow operational and payment processing updates. If the request is received after work planning, billing initiation, payment instruction, or execution scheduling for the next cycle, the cancellation may apply from the following cycle instead.",
    ],
  },
  {
    id: "timelines",
    title: "8. Timeline for cancellation review",
    body: [
      "BizSamadhan India normally reviews cancellation requests within 3 to 5 Business Working Days after receiving complete details. Complex matters involving filing status, government fee verification, third-party vendor confirmation, subscription cycle review, fraud checks, or disputed customer instructions may require additional time.",
      "A cancellation decision may result in acceptance, rejection, request for more information, partial cancellation, conversion to service credit, rescheduling, workflow pause, or escalation to operations management. Any refund implication will be communicated separately under the Refund Policy.",
    ],
  },
  {
    id: "documents",
    title: "9. Customer responsibility and incomplete documentation",
    body: [
      "Customers are responsible for providing complete and accurate documents, identification details, business information, statutory records, OTP cooperation, signatures, approvals, and portal credentials where required. A customer cannot claim cancellation solely because service execution is delayed by missing, deficient, inconsistent, expired, illegible, or unverifiable documents.",
      "If documentation remains incomplete after repeated follow-up, BizSamadhan India may pause the workflow, mark the service as awaiting customer input, close the order as dormant, or require reactivation charges depending on the service stage. Such situations do not automatically create cancellation or refund entitlement.",
    ],
  },
  {
    id: "dependencies",
    title: "10. Operational, third-party, and government authority dependencies",
    body: [
      "Many services depend on MCA, GST, Income Tax, trademark registry, MSME, bank, DSC, payment gateway, or other third-party systems. Portal downtime, authority queues, public holidays, regulatory changes, bank settlement delays, OTP issues, name approval delays, objections, notices, rejections, or additional departmental requirements may affect timelines.",
      "Delays caused by such dependencies are not treated as automatic cancellation grounds. BizSamadhan India may revise timelines, request additional inputs, recommend alternate filing strategy, escalate internally, or pause the workflow until the relevant authority or third-party dependency becomes workable.",
    ],
  },
  {
    id: "misuse",
    title: "11. Fraudulent bookings, abuse, and misuse protection",
    body: [
      "BizSamadhan India may refuse or suspend cancellation requests where the order appears fraudulent, impersonated, made with false documents, made using an unauthorised payment instrument, connected to suspicious payment behaviour, or submitted with inconsistent identity or business details. Additional verification may be required before any cancellation decision is issued.",
      "Abuse of cancellation rights, repeated booking and cancellation, refusal to provide required documents after service allocation, chargeback threats after work initiation, or attempts to obtain unpaid professional work may lead to service suspension, cancellation refusal, recovery of costs, account restrictions, and submission of evidence to Razorpay, banks, or lawful authorities.",
    ],
  },
  {
    id: "refusal",
    title: "12. Right to refuse cancellation",
    body: [
      "BizSamadhan India reserves the right to refuse cancellation where work has started, filing or submission has occurred, government or third-party charges are committed, the customer has consumed consultation or advisory time, the request conflicts with applicable law, or cancellation would prejudice statutory compliance already undertaken for the customer.",
      "We may also refuse cancellation where the request is vague, unverifiable, made by an unauthorised person, raised after avoidable customer delay, or inconsistent with the service scope accepted at payment. Refusal will be communicated with the available reason and any next steps that remain open to the customer.",
    ],
  },
  {
    id: "force-majeure",
    title: "13. Force majeure and service disruption",
    body: [
      "BizSamadhan India is not responsible for cancellation claims arising solely from events beyond reasonable control, including natural events, internet outages, cyber incidents, payment network failures, government portal outages, statutory system downtime, regulatory changes, strikes, public emergencies, court or authority restrictions, or other force majeure events.",
      "During such disruption, BizSamadhan India may defer execution, reschedule filings, provide revised timelines, maintain the workflow in paused status, or offer a practical alternative. Cancellation and refund treatment will depend on the actual service stage and costs already incurred.",
    ],
  },
  {
    id: "communication",
    title: "14. Communication channels and escalation process",
    body: [
      `Cancellation communication should be sent to ${COMPANY.email}, raised from the contact page, or made through the registered customer channel. Customers may call ${COMPANY.phone} for assistance, but written confirmation is required before cancellation can be recorded against an order.`,
      "Escalation Level 1 covers request registration and payment/order verification. Escalation Level 2 covers operations review, service-stage validation, documentation status, and subscription-cycle checks. Escalation Level 3 covers exceptional disputes, fraud-risk review, high-value orders, authority-dependent delays, and management-level decisioning.",
    ],
  },
  {
    id: "law",
    title: "15. Business Working Days, governing law, and jurisdiction",
    body: [
      "Business Working Days means Monday to Friday, excluding Indian public holidays, bank holidays, major statutory portal blackout periods, and days when relevant government, payment, or third-party systems are unavailable for ordinary processing. Review timelines begin only after complete cancellation request details are received.",
      "This Cancellation Policy is governed by the laws of India. Subject to applicable consumer protection law and mandatory statutory remedies, disputes relating to cancellations, paid service orders, recurring compliance plans, online payments, or service workflows shall be subject to the jurisdiction of competent courts and authorities in Kanpur, Uttar Pradesh, India.",
    ],
  },
];

const highlights = [
  "Cancellation is reviewed by service stage and workflow activity",
  "Government, filing, gateway, and third-party costs cannot be cancelled once committed",
  "Subscription cancellations apply prospectively based on billing and execution cycle status",
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "Cancellation Policy | BizSamadhan India",
      description:
        "Razorpay-compliant cancellation policy for BizSamadhan India legal, tax, compliance, GST, ITR, ROC/MCA, incorporation, trademark, documentation, and subscription services.",
      dateModified: "2026-05-14",
      inLanguage: "en-IN",
      isPartOf: {
        "@type": "WebSite",
        name: COMPANY.name,
        url: SITE_URL,
      },
      publisher: {
        "@id": `${SITE_URL}#organization`,
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: COMPANY.name,
      url: SITE_URL,
      email: COMPANY.email,
      telephone: COMPANY.phone,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kanpur",
        addressRegion: "Uttar Pradesh",
        addressCountry: "IN",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Cancellation Policy",
          item: pageUrl,
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "Cancellation Policy | BizSamadhan India",
  description:
    "Read BizSamadhan India's cancellation policy for GST, ITR, ROC/MCA compliance, company incorporation, MSME, trademark, documentation, and subscription services paid online.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Cancellation Policy | BizSamadhan India",
    description:
      "Razorpay-compliant cancellation terms for Indian legal, tax, compliance, documentation, filing, and subscription-based services.",
    url: pageUrl,
    siteName: COMPANY.name,
    type: "article",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Cancellation Policy | BizSamadhan India",
    description: "Cancellation procedure, service-stage rules, subscriptions, authority dependencies, escalation, and governing law.",
  },
};

function PolicySectionCard({ section }: { section: PolicySection }) {
  return (
    <section id={section.id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{section.title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base sm:leading-8">
        {section.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export default function CancellationPolicyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8 lg:py-16">
        <article className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="transition hover:text-[var(--brand)]">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 dark:text-slate-100">Cancellation Policy</span>
          </nav>

          <header className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                Razorpay-ready cancellation terms
              </span>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                  Cancellation Policy
                </h1>
                <p className="max-w-4xl text-base leading-8 text-slate-700 dark:text-slate-300 sm:text-lg">
                  This policy explains how BizSamadhan India receives, verifies, reviews, accepts, refuses, or escalates cancellation requests for Indian legal, tax, compliance, registration, trademark, documentation, consultation, and subscription services.
                </p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</p>
              </div>
            </div>

            <aside aria-label="Cancellation policy quick facts" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Cancellation summary</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex gap-3">
                  <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <dt className="font-semibold text-slate-950 dark:text-white">Review timeline</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-300">Requests are normally reviewed within 3 to 5 Business Working Days.</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <dt className="font-semibold text-slate-950 dark:text-white">Before work starts</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-300">Orders may be cancellable before advisor allocation, document review, or filing preparation.</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Ban className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <div>
                    <dt className="font-semibold text-slate-950 dark:text-white">After submission</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-300">Cancellation is not available after filing, submission, challan, or authority-facing action.</dd>
                  </div>
                </div>
              </dl>
            </aside>
          </header>

          <section aria-label="Policy highlights" className="mt-10 grid gap-4 sm:grid-cols-3">
            {highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium leading-6 text-slate-700 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {highlight}
              </div>
            ))}
          </section>

          <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
            <aside className="hidden rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24 lg:block">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">On this page</h2>
              <ol className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {policySections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="block rounded-xl px-3 py-2 transition hover:bg-slate-50 hover:text-[var(--brand)] dark:hover:bg-slate-800">
                      {section.title.replace(/^\d+\.\s*/, "")}
                    </a>
                  </li>
                ))}
              </ol>
            </aside>

            <div className="space-y-5">
              {policySections.map((section) => (
                <PolicySectionCard key={section.id} section={section} />
              ))}

              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/30 sm:p-8">
                <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Cancellation support contact</h2>
                <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
                  For cancellation requests, subscription cancellation, auto-renewal updates, authority-delay review, or escalation, contact BizSamadhan India through the channels below. Written confirmation is required before an order can be marked cancelled.
                </p>
                <div className="mt-5 flex flex-col gap-3 text-sm font-medium text-slate-800 dark:text-slate-200 sm:flex-row sm:flex-wrap">
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[var(--brand)]" />
                    {COMPANY.email}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[var(--brand)]" />
                    {COMPANY.phone}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Scale className="h-4 w-4 text-[var(--brand)]" />
                    {COMPANY.city}
                  </span>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]">
                    Raise a cancellation request
                  </Link>
                  <Link href="/refund-policy" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[var(--brand)] hover:text-[var(--brand)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    View refund rules
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
