import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Mail, Phone, ShieldCheck } from "lucide-react";
import { COMPANY, SITE_URL } from "@/lib/constants";

const pageUrl = new URL("/refund-policy", SITE_URL).toString();
const lastUpdated = "May 14, 2026";

type PolicySection = {
  id: string;
  title: string;
  body: string[];
};

const policySections: PolicySection[] = [
  {
    id: "scope",
    title: "1. Scope of this refund policy",
    body: [
      "This Refund Policy applies to payments made to Wadhwani Associates through our website, Razorpay Checkout, payment links, invoices, client portal, or any other approved digital payment channel for legal, tax, business registration, compliance, documentation, and subscription-based services. Covered services include GST registration and return filing, Income Tax Return filing, ROC/MCA compliance, company incorporation, MSME registration, trademark services, digital documentation, consultation services, and recurring compliance retainers.",
      "Wadhwani Associates provides professional service execution and digital compliance support. Our services are not physical goods, and refund eligibility depends on the service stage, document status, advisor allocation, statutory portal activity, payment status, and third-party or government costs already incurred.",
    ],
  },
  {
    id: "eligibility",
    title: "2. Refund eligibility",
    body: [
      "A refund request may be considered only when the request is raised before substantive work has started, or where a duplicate payment, excess payment, failed transaction debit, or verified billing error has occurred. A request may also be considered if Wadhwani Associates is unable to initiate the paid service due solely to an internal operational issue after payment confirmation.",
      "For eligibility review, the customer must share the registered mobile number or email address, Razorpay payment ID or order ID, invoice number if issued, selected service name, amount paid, date of payment, and a clear reason for the refund request. Requests without verifiable payment or customer details may be treated as incomplete until the required information is received.",
    ],
  },
  {
    id: "non-refundable",
    title: "3. Non-refundable fees and filing charges",
    body: [
      "Government fees, statutory charges, challans, stamp duty, MCA portal fees, GST portal fees, trademark registry fees, DSC/token charges, PAN/TAN-related statutory charges, payment gateway charges, bank charges, and any other third-party filing or authority fee are non-refundable once paid, generated, reserved, initiated, or committed on behalf of the customer.",
      "Professional filing charges are also non-refundable once drafting, document review, data validation, advisor assignment, portal login work, form preparation, name search, class search, trademark search, compliance checklist preparation, return computation, or submission-related activity has begun. These charges represent service effort and operational allocation, not only the final filing outcome.",
    ],
  },
  {
    id: "work-initiation",
    title: "4. No refund after work initiation",
    body: [
      "No full refund is available after work initiation. Work initiation includes any action taken by Wadhwani Associates or its assigned professional team to review documents, validate business details, prepare forms, calculate tax positions, draft applications, create compliance workflows, assign an advisor, communicate with the customer for execution, open statutory portal tasks, or prepare filings for submission.",
      "If the customer chooses not to proceed after work has started, Wadhwani Associates may, at its discretion, offer a partial refund only for the unused portion of the service fee after deducting completed work, advisor time, administrative handling, third-party charges, payment gateway costs, and statutory or filing expenses already incurred.",
    ],
  },
  {
    id: "partial-refunds",
    title: "5. Partial refund scenarios",
    body: [
      "Partial refunds may be considered where a service package contains multiple separable deliverables and only some deliverables have been initiated. For example, if a compliance package includes document review, filing preparation, and recurring advisory, the refund review may separate completed advisory and preparation work from future unperformed deliverables.",
      "Partial refund calculations are made by Wadhwani Associates based on internal service records, CRM workflow status, communication logs, invoice details, government fee status, and professional effort already applied. The customer will be informed of the approved refund amount before processing, wherever commercially practical.",
    ],
  },
  {
    id: "subscriptions",
    title: "6. Subscription and recurring compliance services",
    body: [
      "For subscription-based compliance services, monthly retainers, annual compliance plans, recurring GST return support, bookkeeping retainers, or similar ongoing services, refunds are not provided for completed billing cycles, already consumed advisory time, prepared filings, uploaded documents, or compliance work scheduled for the active cycle.",
      "If a customer requests termination of a subscription before the next billing or execution cycle, future billing may be stopped according to the applicable plan terms. Any prepaid unused component may be reviewed on a pro-rata basis only if no work has started for the remaining period and no discounted annual-plan condition has been breached.",
    ],
  },
  {
    id: "duplicate-failed",
    title: "7. Duplicate payments and failed transactions",
    body: [
      "Duplicate payments for the same service, customer, and invoice reference will be reviewed on priority. If verified, the duplicate amount will be refunded to the original payment instrument after reconciliation with Razorpay, bank settlement records, and internal order records.",
      "For failed transactions where the customer account is debited but Wadhwani Associates does not receive a successful payment confirmation, the amount is usually reversed by the issuing bank, card network, UPI system, or payment partner. Customers should first check the payment status with their bank or UPI app. If Razorpay or our settlement report later confirms successful receipt, Wadhwani Associates will either map the payment to the intended order or process an eligible refund.",
    ],
  },
  {
    id: "processing",
    title: "8. Refund processing timelines and source-account rule",
    body: [
      "Approved refunds are normally initiated within 7 to 10 Business Working Days from the date Wadhwani Associates confirms refund approval in writing. After initiation, the actual credit timeline depends on Razorpay, the issuing bank, card network, UPI provider, wallet provider, or other payment instrument involved.",
      "Refunds are processed only to the original payment source used for the transaction, unless applicable law, payment partner rules, or technical constraints require a different compliant route. Wadhwani Associates does not process refunds to unrelated bank accounts, third-party accounts, cash channels, or accounts that cannot be reasonably linked to the original payer.",
    ],
  },
  {
    id: "customer-responsibility",
    title: "9. Customer responsibility and document deficiency",
    body: [
      "The customer is responsible for providing accurate business details, identity information, tax records, financial documents, signatures, authorization letters, OTPs where applicable, and timely approvals. Refunds will not be granted where service delay, rejection, non-completion, or additional work arises from incomplete documents, incorrect information, delayed responses, non-cooperation, changed instructions, inaccessible portals due to customer-side credentials, or failure to provide legally required records.",
      "If documents are deficient, illegible, inconsistent, expired, unverifiable, or legally insufficient, Wadhwani Associates may pause execution and request corrected documents. Such deficiency does not automatically create refund eligibility if professional review, advisory, workflow setup, or filing preparation has already been performed.",
    ],
  },
  {
    id: "delay-exceptions",
    title: "10. Service delay exception handling",
    body: [
      "Estimated service timelines are indicative and may be affected by government portal downtime, MCA/GST/Income Tax portal changes, trademark registry queues, bank or DSC provider delays, public holidays, statutory deadline congestion, customer-side delays, third-party verification, or regulatory changes. Delays caused by such external factors do not automatically qualify for refunds.",
      "If a delay is materially attributable to Wadhwani Associates after all required documents and approvals have been provided, the customer may request an escalation review. Depending on the case, Wadhwani Associates may provide revised timelines, priority handling, service credit, reassignment, partial refund, or another commercially reasonable resolution.",
    ],
  },
  {
    id: "misuse",
    title: "11. Chargeback misuse and fraudulent transactions",
    body: [
      "Customers should contact Wadhwani Associates before raising a bank chargeback or payment dispute. Improper chargebacks after service delivery, after work initiation, or without first allowing reasonable support resolution may be treated as misuse and may result in suspension of services, recovery of costs, withholding of pending deliverables, and submission of service evidence to Razorpay, the bank, or the payment network.",
      "Any transaction suspected to be fraudulent, unauthorized, made using stolen payment instruments, made with false identity details, or connected to unlawful activity may be held, reported, reversed, or escalated according to applicable law, Razorpay policies, banking rules, and internal risk controls. Wadhwani Associates may request additional verification before continuing service execution or approving a refund.",
    ],
  },
  {
    id: "communication",
    title: "12. Communication channels and escalation matrix",
    body: [
      `Refund requests must be sent to ${COMPANY.email} or raised through the contact page using the same phone number or email address used during payment. Customers may also call ${COMPANY.phone} for status assistance, but refund approval requires written communication for audit and payment partner records.`,
      "Escalation Level 1 is handled by customer support for payment reference verification and basic status updates. Escalation Level 2 is handled by the service operations team for workflow-stage review, document deficiency checks, and partial refund assessment. Escalation Level 3 is handled by management for exceptional disputes, chargeback response, fraud review, or cases involving statutory delay and high-value service packages.",
    ],
  },
  {
    id: "working-days-law",
    title: "13. Business Working Days, governing law, and jurisdiction",
    body: [
      "Business Working Days means Monday to Friday, excluding Indian public holidays, bank holidays, major statutory portal blackout periods, and days on which relevant government or payment systems are unavailable for ordinary processing. Internal review timelines begin only after Wadhwani Associates receives complete refund request details.",
      "This Refund Policy is governed by the laws of India. Subject to applicable consumer protection law and mandatory statutory rights, disputes relating to this policy, online payments, service refunds, or professional service engagement shall fall under the jurisdiction of competent courts and authorities in Kanpur, Uttar Pradesh, India.",
    ],
  },
];

const highlights = [
  "Refunds reviewed by service stage, not by payment date alone",
  "Government, statutory, filing, and gateway charges remain non-refundable once incurred",
  "Approved refunds are initiated to the original payment source within 7 to 10 Business Working Days",
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "Refund Policy | Wadhwani Associates",
      description:
        "Razorpay-compliant refund policy for Wadhwani Associates legal, tax, compliance, company incorporation, GST, ITR, trademark, documentation, and subscription services.",
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
          name: "Refund Policy",
          item: pageUrl,
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "Refund Policy | Wadhwani Associates",
  description:
    "Read Wadhwani Associates' refund policy for GST, ITR, ROC/MCA, incorporation, MSME, trademark, digital documentation, and subscription compliance services paid through Razorpay.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Refund Policy | Wadhwani Associates",
    description:
      "Razorpay-compliant refund terms for Indian legal, tax, compliance, documentation, and subscription services.",
    url: pageUrl,
    siteName: COMPANY.name,
    type: "article",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Refund Policy | Wadhwani Associates",
    description: "Refund eligibility, non-refundable fees, timelines, source-account refunds, subscriptions, disputes, and escalation.",
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

export default function RefundPolicyPage() {
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
            <span className="text-slate-900 dark:text-slate-100">Refund Policy</span>
          </nav>

          <header className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                Razorpay-ready service policy
              </span>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                  Refund Policy
                </h1>
                <p className="max-w-4xl text-base leading-8 text-slate-700 dark:text-slate-300 sm:text-lg">
                  This policy sets out how Wadhwani Associates reviews, approves, declines, and processes refunds for Indian legal, tax, company registration, compliance, trademark, documentation, consultation, and subscription services paid online through Razorpay or other approved digital payment channels.
                </p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</p>
              </div>
            </div>

            <aside aria-label="Refund policy quick facts" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Quick compliance summary</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <dt className="font-semibold text-slate-950 dark:text-white">Processing window</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-300">Approved refunds are initiated within 7 to 10 Business Working Days.</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <dt className="font-semibold text-slate-950 dark:text-white">Refund destination</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-300">Refunds are returned to the original payment source wherever permitted.</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <dt className="font-semibold text-slate-950 dark:text-white">Non-refundable items</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-300">Government, statutory, filing, gateway, and third-party charges are excluded once incurred.</dd>
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
                <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Refund support contact</h2>
                <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
                  For refund requests, payment status, duplicate debit checks, failed transaction clarification, invoice references, or escalation updates, contact Wadhwani Associates through the channels below. Written communication is required for refund approval and audit records.
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
                  <span>{COMPANY.city}</span>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]">
                    Raise a refund query
                  </Link>
                  <Link href="/payment-methods" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[var(--brand)] hover:text-[var(--brand)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    View payment methods
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
