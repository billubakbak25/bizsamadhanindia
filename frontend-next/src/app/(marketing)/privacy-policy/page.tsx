import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Cookie,
  CreditCard,
  Database,
  FileArchive,
  LockKeyhole,
  Mail,
  Phone,
  Scale,
  ShieldCheck,
  ShieldEllipsis,
} from "lucide-react";
import { InsightList, PolicySectionCard, type PolicySection } from "@/components/sections/PolicyPagePrimitives";
import { COMPANY, SITE_URL } from "@/lib/constants";

const pageUrl = new URL("/privacy-policy", SITE_URL).toString();
const lastUpdated = "May 14, 2026";

const policySections: PolicySection[] = [
  {
    id: "information-collection",
    title: "1. Information collection",
    body: [
      "Wadhwani Associates collects personal, business, and service-related information that users choose to provide when submitting enquiry forms, booking consultations, creating an account, requesting GST, ITR, ROC or MCA, MSME, trademark, incorporation, accounting, or legal documentation services, uploading files, or communicating with our support and advisory teams.",
      "Collected information may include name, mobile number, email address, city, company or entity details, PAN, GSTIN, CIN, DIN, Aadhaar or other identity references where legally required, billing address, authorised signatory information, service preferences, uploaded compliance records, tax information, communication history, and limited platform usage data needed to operate the website and client workflow.",
    ],
  },
  {
    id: "personal-data-usage",
    title: "2. Personal data usage",
    body: [
      "We use personal data to respond to enquiries, assess service eligibility, create quotations and invoices, onboard clients, coordinate consultations, verify documents, execute purchased services, track filing stages, manage subscriptions, provide customer support, prevent fraud, maintain internal records, and comply with statutory, audit, tax, and legal obligations.",
      "Wadhwani Associates does not treat client data as a resale asset. Data use is limited to legitimate service delivery, operational improvement, security, risk management, payment administration, compliance workflows, and communication related to an active or requested engagement.",
    ],
  },
  {
    id: "document-storage",
    title: "3. Document storage and service records",
    body: [
      "Because Wadhwani Associates provides legal, tax, and compliance support, users may submit sensitive business and financial records, draft agreements, incorporation documents, return data, trademark records, notices, KYC materials, and statutory filings. These records may be stored in controlled digital systems used for document review, workflow execution, versioning, and client support.",
      "Uploaded documents and execution records may be retained in active storage while a service is in progress and in archived operational storage thereafter where required for repeat support, dispute management, regulatory review, internal audit, fraud prevention, or legal record-keeping.",
    ],
  },
  {
    id: "payment-information",
    title: "4. Financial and payment information handling",
    body: [
      "Wadhwani Associates may collect billing name, invoice details, transaction references, amount paid, subscription status, payment timestamps, settlement status, and related payment metadata needed to reconcile orders, issue invoices, respond to disputes, and support refunds or chargeback evidence.",
      "Wadhwani Associates does not ordinarily store full card numbers, CVV data, or sensitive authentication data. Such payment instrument information is handled by approved payment gateways, banks, card networks, UPI systems, or other regulated payment service providers according to their own compliance frameworks and security controls.",
    ],
  },
  {
    id: "cookies-tracking",
    title: "5. Cookies and tracking technologies",
    body: [
      "The website may use cookies, local storage, session tools, server logs, analytics tags, and similar technologies to maintain session continuity, support login flows, understand traffic patterns, improve page performance, protect against abuse, and analyse how users interact with key service pages.",
      "These tools may collect technical data such as IP address, browser type, device information, referral source, pages viewed, approximate location, timestamps, and interaction signals. Users may control cookies through browser settings, although disabling some technologies may affect form handling, login continuity, or website functionality.",
    ],
  },
  {
    id: "third-party-sharing",
    title: "6. Third-party sharing limitations",
    body: [
      "Wadhwani Associates shares personal data only on a need-to-know basis with employees, authorised consultants, compliance professionals, technology providers, hosting vendors, communication platforms, payment partners, and operational service providers involved in delivering the requested service or maintaining platform security and continuity.",
      "We do not sell personal information to data brokers or unrelated advertisers. Any third-party access is limited by commercial necessity, confidentiality expectations, legal obligations, or service functionality, and only to the extent reasonably required for the relevant purpose.",
    ],
  },
  {
    id: "razorpay-handling",
    title: "7. Razorpay and payment gateway data handling",
    body: [
      "When users make payments through Razorpay or another approved payment gateway, transaction processing is handled through the gateway interface and its connected banking and payment infrastructure. Wadhwani Associates may receive transaction IDs, order references, payment status, payer name, partial masked instrument details where available, and settlement or dispute metadata from the gateway.",
      "Razorpay or similar partners may independently process payment and device data according to their own privacy notices, anti-fraud systems, and regulatory obligations. Users should review the relevant gateway privacy practices where payment authentication, tokenisation, or device-based risk checks are performed outside Wadhwani Associates' direct systems.",
    ],
  },
  {
    id: "security-practices",
    title: "8. Security practices",
    body: [
      "Wadhwani Associates uses reasonable administrative, contractual, and technical safeguards to protect personal data and service records from unauthorised access, misuse, accidental loss, unlawful disclosure, and avoidable operational exposure. These safeguards may include access controls, environment-based configuration, credential restrictions, monitored systems, limited-role access, secure vendor services, and internal review processes.",
      "No internet-based system can guarantee absolute security. Users should protect their devices, email access, OTP channels, and shared credentials, and should avoid sending highly sensitive information through insecure or unapproved communication channels unless specifically requested with appropriate safeguards.",
    ],
  },
  {
    id: "data-retention",
    title: "9. Data retention",
    body: [
      "Personal data and service records are retained for as long as reasonably necessary to provide services, manage subscriptions, resolve disputes, honour refund and cancellation processes, maintain tax and accounting records, preserve statutory filing history, satisfy audit requirements, prevent fraud, and comply with applicable law or professional obligations.",
      "Retention periods vary based on the type of record, the service purchased, the sensitivity of the document, ongoing support relationships, and legal or regulatory requirements. When active retention is no longer necessary, records may be deleted, de-identified, archived with restricted access, or retained only for limited compliance purposes.",
    ],
  },
  {
    id: "user-rights",
    title: "10. User rights and data requests",
    body: [
      "Users may request access to certain personal data we hold about them, correction of inaccurate information, update of contact details, restriction of specific non-essential processing where feasible, or deletion of data that is no longer required and is not subject to a legal or operational retention obligation.",
      "Because Wadhwani Associates operates in regulated legal, tax, compliance, and payment contexts, some records may need to be retained despite a deletion request. We may ask for identity verification before acting on privacy requests, especially where statutory filings, payment disputes, or sensitive documents are involved.",
    ],
  },
  {
    id: "communication-consent",
    title: "11. Communication consent",
    body: [
      "By submitting a form, booking a consultation, making a payment, sharing documents, or engaging our services, users consent to receive transaction, support, service, billing, compliance, delivery, security, and account-related communications through phone, SMS, email, WhatsApp, and other lawful digital channels used by Wadhwani Associates.",
      "These communications may include appointment coordination, document requests, status updates, invoice notices, compliance reminders, renewal alerts, payment confirmations, dispute follow-up, and issue-resolution messages necessary to complete or support a service engagement.",
    ],
  },
  {
    id: "marketing-opt-out",
    title: "12. Marketing opt-out",
    body: [
      "Users may receive service updates, relevant product announcements, compliance reminders, or promotional information where permitted by law and consistent with the relationship established through the website or a prior enquiry.",
      "Users may opt out of non-essential marketing communications by following the unsubscribe instructions in email communications or by contacting Wadhwani Associates support. Opting out of marketing does not affect essential service, billing, security, legal, or support communications linked to an active account, transaction, or engagement.",
    ],
  },
  {
    id: "children-privacy",
    title: "13. Children's privacy",
    body: [
      "Wadhwani Associates services are intended for adults, business owners, authorised representatives, and individuals legally capable of entering into service engagements. The website is not designed for children to independently purchase or manage legal, tax, or compliance services.",
      "We do not knowingly solicit or intentionally collect personal information from children in a manner inconsistent with applicable law. If a parent or guardian believes a child has provided personal information without appropriate authority, they may contact us so that the matter can be reviewed and handled appropriately.",
    ],
  },
  {
    id: "government-disclosure",
    title: "14. Government, regulatory, and legal disclosure",
    body: [
      "Wadhwani Associates may disclose personal data, documents, transaction records, or service records where required by law, court order, regulatory request, tax authority process, law enforcement inquiry, payment dispute response, anti-fraud review, statutory filing requirement, or lawful government direction.",
      "We may also disclose information where reasonably necessary to establish, exercise, or defend legal claims, respond to chargebacks, protect clients, investigate fraud or misuse, or safeguard the rights, property, and operational security of Wadhwani Associates and its service partners.",
    ],
  },
  {
    id: "breach-handling",
    title: "15. Data breach handling",
    body: [
      "If Wadhwani Associates becomes aware of a confirmed or reasonably suspected data security incident affecting personal data, we will assess the nature and scope of the incident, secure affected systems where possible, investigate the operational cause, and take reasonable remedial action according to the seriousness of the event.",
      "Where notification is legally required or operationally appropriate, affected users, payment partners, regulators, or authorities may be informed with available details about the incident, the likely impact, and the steps being taken to manage the situation.",
    ],
  },
  {
    id: "privacy-contact",
    title: "16. Contact details for privacy concerns",
    body: [
      `Privacy questions, correction requests, retention concerns, marketing opt-out requests, document handling queries, or complaints about data use may be sent to ${COMPANY.email} or raised through the website contact page using the registered contact information associated with the enquiry or service.`,
      `For faster resolution, users should include their full name, service name, relevant email address or mobile number, and any payment or order reference where applicable. Wadhwani Associates may use ${COMPANY.phone} or email follow-up to verify the request and respond appropriately.`,
    ],
  },
  {
    id: "jurisdiction",
    title: "17. Governing law and jurisdiction",
    body: [
      "This Privacy Policy is governed by the laws of India.",
      "Subject to applicable data protection, consumer protection, and other mandatory legal rights, disputes relating to privacy, personal data handling, website use, online payments, or service records shall fall under the jurisdiction of competent courts and authorities in Kanpur, Uttar Pradesh, India.",
    ],
  },
];

const highlights = [
  "Built for legal, tax, and compliance workflows involving sensitive business and identity records",
  "Clarifies Razorpay and gateway processing boundaries for merchant-verification review",
  "Covers retention, security, communication, disclosure, and user-right handling in an operationally realistic way",
];

const relatedLinks = [
  { label: "Terms and Conditions", href: "/terms-and-conditions" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Cancellation Policy", href: "/cancellation-policy" },
  { label: "Service Delivery Policy", href: "/service-delivery-policy" },
  { label: "Payment Methods", href: "/payment-methods" },
  { label: "GST Registration", href: "/gst-registration" },
  { label: "ITR Filing", href: "/itr-filing" },
  { label: "Company Incorporation", href: "/company-registration" },
];

const complianceNotes = [
  "The page clearly separates gateway-handled payment instrument data from merchant-side transaction metadata.",
  "Sensitive legal and tax document storage is disclosed in practical service-delivery terms rather than generic SaaS language.",
  "Third-party sharing is limited to service execution, security, compliance, and lawful disclosure scenarios.",
  "User rights are framed with realistic retention exceptions for tax, legal, audit, fraud, and payment-dispute records.",
];

const seoAuditNotes = [
  "Includes canonical URL, OpenGraph tags, Twitter metadata, and JSON-LD markup for PrivacyPolicy and WebPage entities.",
  "Uses one clear H1, crawlable internal links to adjacent policies and core services, and descriptive section headings for long-tail relevance.",
  "Privacy-specific keywords are woven into the content naturally around payments, documents, compliance, and data handling.",
  "The explicit route improves crawl clarity over the older dynamic policy fallback.",
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "Privacy Policy | Wadhwani Associates",
      description:
        "Enterprise-grade privacy policy for Wadhwani Associates legal, tax, GST, ITR, ROC/MCA, MSME, trademark, incorporation, subscription, and digital documentation services.",
      datePublished: "2026-05-14",
      dateModified: "2026-05-14",
      inLanguage: "en-IN",
      mainEntity: {
        "@id": `${pageUrl}#privacy-policy`,
      },
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
      "@type": "PrivacyPolicy",
      "@id": `${pageUrl}#privacy-policy`,
      name: "Privacy Policy",
      url: pageUrl,
      dateModified: "2026-05-14",
      publisher: {
        "@id": `${SITE_URL}#organization`,
      },
      inLanguage: "en-IN",
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
          name: "Privacy Policy",
          item: pageUrl,
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "Privacy Policy | Wadhwani Associates",
  description:
    "Read Wadhwani Associates' privacy policy for document storage, Razorpay payments, cookies, personal data use, legal disclosure, retention, and security across GST, ITR, ROC/MCA, trademark, and incorporation services.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Privacy Policy | Wadhwani Associates",
    description:
      "Privacy disclosures for Indian legal, tax, compliance, payment, subscription, and digital documentation services.",
    url: pageUrl,
    siteName: COMPANY.name,
    type: "article",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Wadhwani Associates",
    description:
      "How Wadhwani Associates handles personal data, documents, payments, cookies, gateway metadata, security, retention, and legal disclosures.",
  },
};

export default function PrivacyPolicyPage() {
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
            <span className="text-slate-900 dark:text-slate-100">Privacy Policy</span>
          </nav>

          <header className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                Razorpay-ready privacy disclosure
              </span>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                  Privacy Policy
                </h1>
                <p className="max-w-4xl text-base leading-8 text-slate-700 dark:text-slate-300 sm:text-lg">
                  This policy explains how Wadhwani Associates collects, uses, stores, secures, shares, and retains personal data and service records across legal, tax, compliance, documentation, consultation, payment, and subscription workflows.
                </p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</p>
              </div>
            </div>

            <aside aria-label="Privacy quick facts" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Privacy operations summary</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex gap-3">
                  <Database className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <dt className="font-semibold text-slate-950 dark:text-white">Primary data classes</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-300">Identity, business, document, communication, and transaction records.</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <dt className="font-semibold text-slate-950 dark:text-white">Payment handling</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-300">Sensitive payment instrument data is processed by gateways such as Razorpay.</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <FileArchive className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <dt className="font-semibold text-slate-950 dark:text-white">Retention basis</dt>
                    <dd className="mt-1 text-slate-600 dark:text-slate-300">Records may be retained for service continuity, audits, disputes, and legal compliance.</dd>
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

              <InsightList title="Compliance improvement notes" items={complianceNotes} tone="emerald" />
              <InsightList title="SEO recommendations" items={seoAuditNotes} />

              <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Privacy contact and support</h2>
                    <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
                      For privacy concerns, correction requests, retention questions, document-handling clarifications, gateway dispute support, or marketing opt-out requests, contact Wadhwani Associates using the channels below so the request can be logged and reviewed against the relevant service records.
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
                    <Scale className="h-4 w-4 text-[var(--brand)]" />
                    {COMPANY.city}
                  </span>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]">
                    Contact privacy support
                  </Link>
                  <Link href="/terms-and-conditions" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[var(--brand)] hover:text-[var(--brand)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    View terms and conditions
                  </Link>
                </div>
              </section>

              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/60 dark:bg-amber-950/20 sm:p-8">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
                  <div className="space-y-3 text-sm leading-7 text-amber-950 dark:text-amber-100 sm:text-base">
                    <p>
                      This policy is written for a real legal-tech and compliance service environment where identity records, statutory documents, payment metadata, and communication logs are often required to execute services and respond to regulatory or payment-partner queries.
                    </p>
                    <p>
                      The footer already links to <Link href="/privacy-policy" className="font-semibold underline underline-offset-4">Privacy Policy</Link>. For stronger merchant-trust signalling, keep that link grouped with Terms, Refund, Cancellation, Service Delivery, and Payment Methods on every marketing page and within checkout-adjacent flows.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex items-start gap-3">
                  <Cookie className="mt-1 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Operational privacy posture</h2>
                    <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
                      For best merchant-review outcomes, Wadhwani Associates should ensure cookie controls, privacy request handling, document-retention practices, and gateway dispute records are operationally consistent with this page. Published policy language works best when it mirrors how the team actually collects documents, stores them, and responds to payment or data requests.
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                          <ShieldEllipsis className="h-4 w-4 text-[var(--brand)]" />
                          Suggested next control
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          Publish a short privacy-request handling SOP for support so email, WhatsApp, and contact-form requests are triaged consistently.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                          <Database className="h-4 w-4 text-[var(--brand)]" />
                          Suggested next control
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          Maintain a documented retention matrix for tax files, incorporation records, payment evidence, and marketing leads.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
