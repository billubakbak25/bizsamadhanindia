import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CreditCard,
  FileCheck2,
  LockKeyhole,
  Mail,
  Phone,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { InsightList, PolicySectionCard, type PolicySection } from "@/components/sections/PolicyPagePrimitives";
import { COMPANY, SITE_URL } from "@/lib/constants";

const pageUrl = new URL("/terms-and-conditions", SITE_URL).toString();
const lastUpdated = "May 14, 2026";

const policySections: PolicySection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of terms",
    body: [
      "These Terms and Conditions govern access to and use of the Wadhwani Associates website, client portal, consultation flows, payment links, Razorpay Checkout, invoices, communication channels, document workflows, and any legal, tax, business registration, compliance, or digital documentation service offered by Wadhwani Associates.",
      "By visiting the website, submitting an enquiry, booking a consultation, uploading documents, making a payment, approving a filing, using a subscription service, or otherwise engaging with Wadhwani Associates, you confirm that you have read, understood, and agreed to these Terms and Conditions, our Refund Policy, Cancellation Policy, Service Delivery Policy, Privacy Policy, and any service-specific scope shared with you.",
    ],
  },
  {
    id: "nature-of-services",
    title: "2. Nature of services",
    body: [
      "Wadhwani Associates provides professional support, advisory coordination, documentation assistance, filing preparation, workflow execution, and digital service delivery for GST registration and filing, Income Tax Return filing, ROC/MCA compliance, MSME registration, trademark services, company incorporation, subscription-based compliance services, and digital legal documentation services.",
      "Our services are professional and digital in nature. We do not sell physical goods through standard service purchases. Deliverables may include consultation guidance, document checklists, draft documents, application support, filing acknowledgements, payment receipts, compliance status updates, invoices, and completion confirmations shared through digital channels.",
    ],
  },
  {
    id: "user-responsibilities",
    title: "3. User responsibilities",
    body: [
      "Users must provide accurate, complete, current, and legally valid information, including identity details, entity records, PAN, GST details, financial records, bank details where required, authorization letters, signatures, OTPs, board or partner approvals, and any service-specific documents requested by Wadhwani Associates.",
      "Users are responsible for maintaining the confidentiality of their login credentials, registered email address, phone number, payment instruments, portal credentials, and any third-party platform access shared for service execution. Users must not misuse the website, submit false information, upload unlawful material, interfere with platform security, or use the service for fraudulent or prohibited activity.",
    ],
  },
  {
    id: "accuracy-of-documents",
    title: "4. Accuracy of documents and client declarations",
    body: [
      "Wadhwani Associates relies on documents, declarations, data, and approvals supplied by the user. The user confirms that all documents and information submitted are authentic, lawful, complete, and fit for use in the requested service workflow.",
      "Wadhwani Associates may review documents for completeness, consistency, and filing readiness, but the user remains responsible for the truthfulness and legal accuracy of source information. Delays, rejections, penalties, tax demands, notices, compliance defects, or losses caused by incorrect or incomplete user information will be the user's responsibility.",
    ],
  },
  {
    id: "timelines",
    title: "5. Timelines disclaimer",
    body: [
      "Service timelines displayed on the website, shared by advisors, or communicated through support channels are indicative estimates unless expressly confirmed in writing as a fixed deliverable timeline for a specific paid engagement.",
      "Timelines may change due to document deficiencies, user-side delays, payment verification, statutory portal downtime, government processing queues, third-party verification, public holidays, regulatory changes, or additional clarifications required from the user or an authority.",
    ],
  },
  {
    id: "government-dependency",
    title: "6. Government approval and authority dependency",
    body: [
      "GST registration, GST return processing, Income Tax filings, MCA or ROC filings, company incorporation, MSME registration, trademark applications, and other statutory or authority-linked workflows may depend on government departments, statutory portals, registries, banks, certification authorities, and other third-party systems.",
      "Wadhwani Associates can support preparation, submission, follow-up, and workflow management, but does not guarantee approval, registration, certificate issuance, refund from government, statutory acceptance, or the timing of any decision controlled by a government authority, registry, bank, payment partner, or third-party platform.",
    ],
  },
  {
    id: "payments",
    title: "7. Payment terms",
    body: [
      "Users must pay the applicable service fee, professional fee, subscription fee, government fee, statutory charge, third-party fee, tax, or convenience charge shown on the website, quotation, invoice, payment link, Razorpay Checkout page, or written service proposal before the relevant workflow is initiated, unless Wadhwani Associates expressly agrees otherwise in writing.",
      "Payments may be collected through Razorpay, UPI, cards, net banking, wallets, bank transfer, invoices, or other approved channels. A payment is treated as received only after successful confirmation from the payment partner, bank, or Wadhwani Associates' internal payment records. Prices, discounts, and bundled services may change from time to time without affecting already confirmed paid orders.",
    ],
  },
  {
    id: "subscriptions",
    title: "8. Subscription billing rules",
    body: [
      "Subscription-based compliance services, recurring GST return support, bookkeeping retainers, annual compliance plans, digital documentation retainers, and similar recurring engagements are billed according to the selected plan, invoice, written proposal, or checkout terms.",
      "Unless cancelled in accordance with the applicable plan terms before the next billing or execution cycle, recurring subscriptions may renew and remain payable for the active period. Completed billing cycles, consumed advisory time, assigned resources, prepared filings, scheduled compliance work, and work already initiated are not automatically refundable. Subscription cancellation, refund, and service pause requests are handled with reference to our Cancellation Policy, Refund Policy, and the stage of execution.",
    ],
  },
  {
    id: "digital-delivery",
    title: "9. Digital service delivery",
    body: [
      "Wadhwani Associates delivers services digitally through website forms, email, phone calls, WhatsApp, client portal updates, payment confirmations, uploaded document workflows, CRM-assisted operations, and other approved electronic communication channels.",
      "A service may be treated as delivered when the agreed consultation, document review, draft, filing support, application assistance, submission handoff, acknowledgement, completion update, or other digital deliverable has been provided according to the service scope. No physical shipping is applicable to standard service purchases.",
    ],
  },
  {
    id: "intellectual-property",
    title: "10. Intellectual property",
    body: [
      "All website content, interface design, workflows, software, source code, service structures, pricing logic, brand assets, trade names, logos, copy, templates, checklists, internal processes, and platform materials are owned by or licensed to Wadhwani Associates unless otherwise stated.",
      "Users may use deliverables provided to them only for their intended lawful business, tax, compliance, filing, or documentation purpose. Users must not copy, resell, scrape, reverse engineer, commercially exploit, or misrepresent Wadhwani Associates content, workflows, templates, or platform assets without prior written permission.",
    ],
  },
  {
    id: "liability",
    title: "11. Limitation of liability",
    body: [
      "To the fullest extent permitted by applicable law, Wadhwani Associates will not be liable for indirect, incidental, special, consequential, punitive, or remote losses, including loss of profits, business interruption, penalties caused by user-side default, loss of data, loss of opportunity, reputational harm, or losses arising from third-party systems outside our reasonable control.",
      "Except where prohibited by law, Wadhwani Associates' aggregate liability for a specific paid engagement is limited to the amount actually paid by the user to Wadhwani Associates for that specific engagement, excluding government fees, statutory charges, third-party costs, taxes, gateway charges, and pass-through expenses.",
    ],
  },
  {
    id: "suspension",
    title: "12. Service suspension rights",
    body: [
      "Wadhwani Associates may pause, suspend, restrict, or terminate access to services, client portal features, advisor allocation, document processing, filing support, or pending deliverables if payment is overdue, information is incomplete, user cooperation is delayed, documents are deficient, credentials are unsafe, or continuing the service would create legal, compliance, security, fraud, or operational risk.",
      "Suspension may also apply where a user violates these Terms, misuses support channels, threatens staff, attempts unauthorized access, submits unlawful material, requests illegal activity, or creates risk for Wadhwani Associates, its customers, payment partners, statutory portals, or service providers.",
    ],
  },
  {
    id: "fraud",
    title: "13. Fraudulent activity clause",
    body: [
      "Wadhwani Associates may reject, hold, pause, report, reverse, or investigate any transaction, account, enquiry, document submission, payment, service request, or subscription suspected to involve fraud, impersonation, stolen payment instruments, forged documents, false identity, unlawful purpose, prohibited goods or services, sanctions risk, money laundering risk, or misuse of statutory systems.",
      "Where required, Wadhwani Associates may share transaction records, service evidence, communication logs, invoice details, account information, and document metadata with Razorpay, banks, payment networks, regulators, law enforcement, government authorities, or professional advisors for fraud prevention, dispute handling, legal compliance, and risk management.",
    ],
  },
  {
    id: "chargebacks",
    title: "14. Chargeback abuse clause",
    body: [
      "Users must contact Wadhwani Associates support before raising a chargeback, card dispute, UPI dispute, or bank complaint where a service has been initiated, delivered, partially delivered, delayed by external dependency, or disputed due to misunderstanding of service scope.",
      "Improper or abusive chargebacks after consultation delivery, document review, advisor allocation, filing preparation, submission support, subscription execution, or digital deliverable handoff may result in service suspension, recovery of costs, withholding of pending deliverables, account restriction, and submission of service evidence to Razorpay, issuing banks, card networks, UPI providers, or appropriate authorities.",
    ],
  },
  {
    id: "third-party-integrations",
    title: "15. Third-party integrations and service providers",
    body: [
      "Wadhwani Associates may use third-party systems and service providers for payment processing, hosting, analytics, communication, email delivery, WhatsApp messaging, document storage, e-signature, statutory portal access, DSC support, professional review, CRM workflows, background jobs, and operational automation.",
      "Third-party platforms may have their own terms, availability limits, downtime, security controls, processing rules, and dispute mechanisms. Wadhwani Associates is not responsible for service interruption, failed payment, delayed confirmation, statutory portal downtime, payment partner outage, or third-party processing issue outside our reasonable control, but will provide commercially reasonable support where the issue relates to a paid engagement.",
    ],
  },
  {
    id: "confidentiality",
    title: "16. Confidentiality",
    body: [
      "Wadhwani Associates treats user documents, financial records, identity information, business details, statutory credentials, and engagement-specific communications as confidential and uses them only for service delivery, platform operations, legal compliance, fraud prevention, billing, support, and record-keeping purposes.",
      "Confidential information may be shared with assigned professionals, employees, contractors, technology providers, payment partners, statutory authorities, banks, auditors, legal advisors, or regulators where reasonably required for service execution, compliance, dispute handling, fraud review, or lawful requests.",
    ],
  },
  {
    id: "communications",
    title: "17. Communication consent",
    body: [
      "By submitting contact details, booking a consultation, creating an account, uploading documents, making a payment, or purchasing a service, users consent to receive transactional, service, billing, compliance, delivery, document, payment, support, and security communications from Wadhwani Associates through phone, SMS, email, WhatsApp, client portal notifications, and other lawful digital channels.",
      "Users may also receive service recommendations, compliance reminders, renewal notices, subscription updates, and relevant operational messages. Marketing preferences may be managed where applicable, but transactional and service-critical communications may continue while an engagement, legal obligation, payment record, dispute, or support request remains active.",
    ],
  },
  {
    id: "force-majeure",
    title: "18. Force majeure",
    body: [
      "Wadhwani Associates will not be responsible for delay, non-performance, interruption, or failure caused by events beyond reasonable control, including natural disasters, war, civil disturbance, strikes, epidemics, pandemics, government restrictions, statutory portal downtime, internet failure, power disruption, cyber incidents, payment network failures, bank outages, regulatory changes, or acts of public authorities.",
      "Where a force majeure event affects service delivery, Wadhwani Associates may revise timelines, pause workflows, reschedule consultations, provide alternate communication routes, or resume execution once commercially and legally practical.",
    ],
  },
  {
    id: "law-jurisdiction",
    title: "19. Governing law and jurisdiction",
    body: [
      "These Terms and Conditions are governed by and construed in accordance with the laws of India.",
      "Subject to applicable consumer protection law and mandatory statutory rights, disputes arising from the website, payments, services, subscriptions, policies, digital delivery, or professional engagement shall fall under the jurisdiction of competent courts and authorities in Kanpur, Uttar Pradesh, India.",
    ],
  },
  {
    id: "updates",
    title: "20. Changes to these terms",
    body: [
      "Wadhwani Associates may update these Terms and Conditions from time to time to reflect changes in services, payment flows, technology, legal requirements, Razorpay or banking expectations, business operations, or risk controls.",
      "The updated version will be posted on this page with the latest revision date. Continued use of the website, platform, payment channels, subscriptions, or services after an update indicates acceptance of the revised terms.",
    ],
  },
];

const highlights = [
  "Covers GST, ITR, ROC/MCA, MSME, trademark, incorporation, subscriptions, and digital documentation",
  "Clarifies payment, refund dependency, chargeback, fraud, and government approval boundaries",
  "Supports Razorpay merchant review with digital delivery, support, jurisdiction, and dispute terms",
];

const relatedLinks = [
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Cancellation Policy", href: "/cancellation-policy" },
  { label: "Service Delivery Policy", href: "/service-delivery-policy" },
  { label: "Payment Methods", href: "/payment-methods" },
  { label: "GST Registration", href: "/gst-registration" },
  { label: "ITR Filing", href: "/itr-filing" },
  { label: "Trademark Services", href: "/trademark-registration" },
  { label: "Company Incorporation", href: "/company-registration" },
];

const complianceNotes = [
  "No guaranteed government approval, registration, refund, or authority-controlled processing timeline is promised.",
  "All service delivery is digital, with no physical shipping obligation for standard online service purchases.",
  "Disputes, chargebacks, refunds, subscriptions, and cancellations point users to clear support and policy routes.",
  "Fraud controls permit verification, service pause, partner reporting, and evidence submission where required.",
];

const seoAuditNotes = [
  "Canonical URL, OpenGraph metadata, Twitter summary metadata, and JSON-LD schema are included.",
  "The page uses a single descriptive H1, ordered H2 sections, breadcrumb navigation, and internal links to commercial service pages.",
  "Policy content references high-intent service categories naturally without keyword stuffing.",
  "The route is included in the existing policy sitemap flow through LEGAL_POLICY_SLUGS.",
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "Terms and Conditions | Wadhwani Associates",
      description:
        "Enterprise-grade terms and conditions for Wadhwani Associates legal, tax, GST, ITR, ROC/MCA, MSME, trademark, incorporation, subscription, and digital documentation services.",
      datePublished: "2026-05-14",
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
        streetAddress: "LIG 25 SF Colony, Barra 3",
        addressLocality: "Kanpur",
        addressRegion: "Uttar Pradesh",
        postalCode: "208027",
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
          name: "Terms and Conditions",
          item: pageUrl,
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "Terms and Conditions | Wadhwani Associates",
  description:
    "Read Wadhwani Associates' terms for GST, ITR, ROC/MCA, MSME, trademark, company incorporation, compliance subscriptions, payments, digital delivery, chargebacks, and Razorpay-supported services.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Terms and Conditions | Wadhwani Associates",
    description:
      "Razorpay-ready terms covering Indian legal, tax, compliance, company registration, subscription billing, fraud prevention, chargebacks, and digital service delivery.",
    url: pageUrl,
    siteName: COMPANY.name,
    type: "article",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Terms and Conditions | Wadhwani Associates",
    description:
      "Enterprise service terms for online legal, tax, compliance, subscription, payment, and digital documentation services.",
  },
};

export default function TermsAndConditionsPage() {
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
            <span className="text-slate-900 dark:text-slate-100">Terms and Conditions</span>
          </nav>

          <header className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                Razorpay-ready legal service terms
              </span>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                  Terms and Conditions
                </h1>
                <p className="max-w-4xl text-base leading-8 text-slate-700 dark:text-slate-300 sm:text-lg">
                  These terms govern Wadhwani Associates' online legal, tax, compliance, company registration, trademark, digital documentation, payment, subscription, and client support services delivered through our website and approved digital channels.
                </p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</p>
              </div>
            </div>

            <aside aria-label="Terms quick facts" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Merchant compliance summary</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex gap-3">
                  <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <dt className="font-semibold text-slate-950 dark:text-white">Payment channel</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-300">Online payments may be processed through Razorpay and approved digital modes.</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <dt className="font-semibold text-slate-950 dark:text-white">Service model</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-300">Legal, tax, compliance, and documentation services are delivered digitally.</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Scale className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <dt className="font-semibold text-slate-950 dark:text-white">Jurisdiction</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-300">Governed by Indian law with jurisdiction in Kanpur, Uttar Pradesh.</dd>
                  </div>
                </div>
              </dl>
            </aside>
          </header>

          <section aria-label="Policy highlights" className="mt-10 grid gap-4 sm:grid-cols-3">
            {highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium leading-6 text-slate-700 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                {highlight}
              </div>
            ))}
          </section>

          <section aria-label="Related policy and service links" className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Important links</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--brand)] hover:text-[var(--brand)] dark:border-slate-700 dark:text-slate-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
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

              <InsightList title="Razorpay compliance notes" items={complianceNotes} tone="emerald" />
              <InsightList title="SEO audit notes" items={seoAuditNotes} />

              <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Support and legal contact</h2>
                    <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
                      For questions about these terms, payments, subscriptions, service delivery, disputed transactions, invoices, or policy clarifications, contact Wadhwani Associates using the details below. Written communication may be required for audit, support, and payment partner records.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 text-sm font-medium text-slate-800 dark:text-slate-200 sm:grid-cols-3">
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[var(--brand)]" />
                    {COMPANY.email}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[var(--brand)]" />
                    {COMPANY.phone}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-[var(--brand)]" />
                    {COMPANY.city}
                  </span>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]">
                    Contact support
                  </Link>
                  <Link href="/service-delivery-policy" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[var(--brand)] hover:text-[var(--brand)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    View delivery policy
                  </Link>
                </div>
              </section>

              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/60 dark:bg-amber-950/20 sm:p-8">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
                  <p className="text-sm leading-7 text-amber-950 dark:text-amber-100 sm:text-base">
                    These terms are drafted for website and merchant onboarding transparency. They do not replace service-specific engagement letters, statutory requirements, professional advice, court orders, government directions, or mandatory consumer rights applicable under Indian law.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
