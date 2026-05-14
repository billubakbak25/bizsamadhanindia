export const COMPANY = {
  name: "Wadhwani Associates",
  brandName: "Biz Samadhan India",
  domainName: "bizsamadhanindia.com",
  description:
    "Wadhwani Associates operates Biz Samadhan India as a modern legal, tax, and compliance growth platform for Indian founders, operators, and finance teams.",
  phone: "+91 96968 93625",
  email: "support@bizsamadhanindia.com",
  city: "Kanpur, Uttar Pradesh",
};

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.bizsamadhanindia.com";

export type NavItem = {
  label: string;
  href: string;
};

export type ServiceCard = {
  code: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  outcomes: string[];
};

export type ContentSection = {
  title: string;
  body: string[];
};

export type MarketingPageContent = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  hero: string;
  leadService: string;
  highlights: string[];
  deliverables: string[];
  sections: ContentSection[];
  primaryCta?: {
    label: string;
    href: string;
  };
};

export type LegalPolicyContent = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  hero: string;
  lastUpdated: string;
  highlights: string[];
  sections: ContentSection[];
};

export type BusinessContactDetails = {
  businessName: string;
  brandName: string;
  supportPerson: string;
  supportRepresentativeLabel: string;
  supportEmail: string;
  primaryPhones: string[];
  primaryPhoneDisplay: string[];
  whatsappNumber: string;
  officeAddressLines: string[];
  officeAddressOneLine: string;
  officeCity: string;
  officeRegion: string;
  postalCode: string;
  country: string;
  mapQuery: string;
  mapEmbedUrl: string;
  directionsUrl: string;
  geo: {
    latitude: number;
    longitude: number;
  };
  workingHours: Array<{
    label: string;
    value: string;
  }>;
  supportTimelines: Array<{
    label: string;
    value: string;
  }>;
};

const CONTACT_MAP_QUERY = "LIG 25 SF Colony Barra 3 Kanpur 208027";

export const BUSINESS_CONTACT: BusinessContactDetails = {
  businessName: "Wadhwani Associates",
  brandName: "Biz Samadhan India",
  supportPerson: "Vikram Wadhwani",
  supportRepresentativeLabel: "Official Support Representative: Vikram Wadhwani",
  supportEmail: "support@bizsamadhanindia.com",
  primaryPhones: ["9696893625", "8303340092"],
  primaryPhoneDisplay: ["+91 96968 93625", "+91 83033 40092"],
  whatsappNumber: "919696893625",
  officeAddressLines: ["LIG 25 SF Colony,", "Barra 3,", "Kanpur,", "Uttar Pradesh - 208027,", "India"],
  officeAddressOneLine: "LIG 25 SF Colony Barra 3 Kanpur 208027",
  officeCity: "Kanpur",
  officeRegion: "Uttar Pradesh",
  postalCode: "208027",
  country: "India",
  mapQuery: CONTACT_MAP_QUERY,
  mapEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(CONTACT_MAP_QUERY)}&z=16&output=embed`,
  directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_MAP_QUERY)}`,
  geo: {
    // Area-level coordinates for Barra 3, Kanpur. Replace with the exact office pin once verified in GBP.
    latitude: 26.4309,
    longitude: 80.2895,
  },
  workingHours: [
    { label: "Monday to Saturday", value: "9:30 AM to 7:00 PM" },
    { label: "Sunday", value: "Email and WhatsApp intake for urgent queries" },
    { label: "Consultation desk", value: "Priority callbacks during business hours" },
  ],
  supportTimelines: [
    { label: "New enquiries", value: "Within 30 to 60 minutes during working hours" },
    { label: "Document or billing support", value: "Same business day for active clients" },
    { label: "Grievance escalation review", value: "Within 1 business day" },
  ],
};

export const MARKETING_NAV: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Consultation", href: "/consultation" },
  { label: "Partner", href: "/partner" },
  { label: "Tools", href: "/tools" },
  { label: "Contact", href: "/contact" },
];

export const DASHBOARD_NAV: NavItem[] = [
  { label: "Client Portal", href: "/client-portal" },
  { label: "Admin", href: "/admin" },
];


export const ADMIN_MODULE_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "CRM", href: "/admin/crm" },
  { label: "Clients", href: "/admin/clients" },
  { label: "Services", href: "/admin/services" },
  { label: "Pricing", href: "/admin/pricing" },
  { label: "Tasks", href: "/admin/tasks" },
  { label: "Documents", href: "/admin/documents" },
];

export const HERO_STATS = [
  { label: "Founder launches supported", value: "1,200+" },
  { label: "Average onboarding response", value: "30 min" },
  { label: "Compliance workflows active", value: "24/7" },
];

export const SERVICE_LIBRARY: ServiceCard[] = [
  {
    code: "gst_registration",
    slug: "gst-registration",
    title: "GST Registration",
    category: "Tax Setup",
    description: "GST readiness, registration filing, and post-registration guidance for founders and growing teams.",
    outcomes: ["PAN and entity check", "Registration filing", "Next-step compliance plan"],
  },
  {
    code: "itr_filing",
    slug: "itr-filing",
    title: "ITR Filing",
    category: "Personal Tax",
    description: "Fast, guided income-tax filing with clean documentation, deductions review, and submission support.",
    outcomes: ["Income review", "Deduction mapping", "Accurate filing workflow"],
  },
  {
    code: "trademark_copyright",
    slug: "trademark-registration",
    title: "Trademark Registration",
    category: "Brand Protection",
    description: "Search, filing, and objection-ready support for founders who want durable brand ownership.",
    outcomes: ["Brand availability scan", "Application filing", "Protection roadmap"],
  },
  {
    code: "company_registration",
    slug: "company-registration",
    title: "Company Registration",
    category: "Business Formation",
    description: "Private limited company setup with practical guidance around structure, GST, and founder paperwork.",
    outcomes: ["Entity structuring", "DIN and DSC support", "Launch checklist"],
  },
  {
    code: "annual_compliance_filing",
    slug: "annual-compliance-filing",
    title: "Annual Compliance Filing",
    category: "Recurring Compliance",
    description: "Board, ROC, and annual filing support for teams that want fewer missed deadlines and less chaos.",
    outcomes: ["Deadline planning", "Filing preparation", "Status visibility"],
  },
  {
    code: "accounting_bookkeeping",
    slug: "accounting-bookkeeping",
    title: "Accounting and Bookkeeping",
    category: "Finance Ops",
    description: "Month-end bookkeeping, reconciliations, and finance hygiene for operators who need reliable numbers.",
    outcomes: ["Clean books", "Monthly reviews", "Founder-ready reporting"],
  },
];

export const PROCESS_STEPS = [
  {
    title: "Diagnose",
    description: "We map entity type, tax posture, urgency, and document readiness before prescribing any package.",
  },
  {
    title: "Launch",
    description: "Every engagement moves through a clear operating plan with owners, deadlines, and submission checkpoints.",
  },
  {
    title: "Operate",
    description: "The platform stays useful after onboarding with client visibility, consultation booking, and admin ops tooling.",
  },
];

export const TRUST_PILLARS = [
  "Production-grade client portal and admin controls",
  "Railway-backed API integrations wired through environment variables",
  "Fast-moving founder support across legal, tax, and compliance",
  "Designed for Vercel deployment and future SaaS expansion",
];

export const TESTIMONIALS = [
  {
    quote: "We moved from scattered WhatsApp follow-ups to a real operating workflow that clients can actually trust.",
    author: "Growth Advisor, Delhi NCR",
  },
  {
    quote: "The consultation and compliance funnel feels like a product now, not just a brochure site with forms.",
    author: "Startup Founder, Bengaluru",
  },
  {
    quote: "The admin side is finally readable for operators and the frontend feels enterprise-ready on mobile.",
    author: "Finance Lead, Kanpur",
  },
];

export const FAQS = [
  {
    question: "Can I launch the site on Vercel while keeping the backend on Railway?",
    answer: "Yes. The frontend is designed to call the Railway API using NEXT_PUBLIC_API_URL, so the deployment split remains clean and scalable.",
  },
  {
    question: "Will client portal and admin login still work cross-domain?",
    answer: "Yes, as long as Railway keeps the current CORS and cookie settings and Vercel points to the correct API base URL.",
  },
  {
    question: "Can more services be added later without another rewrite?",
    answer: "Yes. The app uses reusable service content and dynamic routes so you can extend the catalog without returning to static HTML.",
  },
];

export const MARKETING_PAGE_CONTENT: Record<string, MarketingPageContent> = {
  "gst-registration": {
    slug: "gst-registration",
    title: "GST Registration",
    description: "Launch GST registration with the right documentation, entity mapping, and next-step compliance guidance.",
    eyebrow: "Tax Setup",
    hero: "Get GST-ready with a filing flow that feels structured, fast, and founder-friendly.",
    leadService: "GST Registration",
    highlights: ["PAN and entity validation", "Application support", "Post-registration compliance guidance"],
    deliverables: ["Document checklist", "Expert review", "Application filing", "Next compliance roadmap"],
    sections: [
      {
        title: "Who this is for",
        body: [
          "Founders launching a new business, service firms crossing the threshold, and sellers who need GST before onboarding clients or marketplaces.",
          "We keep the flow practical by focusing on readiness, documentation, and what happens immediately after approval.",
        ],
      },
      {
        title: "How we execute",
        body: [
          "We gather core registration inputs, review entity details, and prepare the filing package before submission so nothing feels improvised.",
          "After filing, we outline the immediate return and invoicing expectations so the business can operate with confidence.",
        ],
      },
    ],
    primaryCta: { label: "Book GST consultation", href: "/consultation" },
  },
  "itr-filing": {
    slug: "itr-filing",
    title: "ITR Filing",
    description: "Handle personal income-tax filing with clarity around deductions, records, and fast turnaround.",
    eyebrow: "Personal Tax",
    hero: "ITR filing that is calm, accurate, and built for busy professionals and founders.",
    leadService: "ITR Filing",
    highlights: ["Income source review", "Deduction planning", "Submission support"],
    deliverables: ["Document checklist", "Tax position review", "Return filing", "Post-filing guidance"],
    sections: [
      {
        title: "What we review",
        body: [
          "Salary, business, consulting, and other income sources are mapped against the right filing posture and deductions.",
          "The objective is not only filing the return but reducing confusion around what should be documented and retained.",
        ],
      },
      {
        title: "Why it works",
        body: [
          "The workflow is built to reduce back-and-forth, so the filing journey stays lightweight for clients and repeatable for the team.",
        ],
      },
    ],
    primaryCta: { label: "Start tax filing", href: "/contact" },
  },
  "trademark-registration": {
    slug: "trademark-registration",
    title: "Trademark Registration",
    description: "Secure brand assets with structured search, filing, and objection-aware support.",
    eyebrow: "Brand Protection",
    hero: "Protect the name, identity, and commercial memory you are building before competitors get there.",
    leadService: "Trademark Registration",
    highlights: ["Brand search", "Class strategy", "Application preparation"],
    deliverables: ["Availability check", "Class selection", "Filing support", "Objection-readiness plan"],
    sections: [
      {
        title: "Strategic positioning",
        body: [
          "We frame trademark filing as a business asset decision, not just a legal formality, so the application lines up with growth plans.",
        ],
      },
      {
        title: "What clients receive",
        body: [
          "A concise view of filing strategy, classes, likely friction points, and the next action if objections or follow-up questions appear.",
        ],
      },
    ],
    primaryCta: { label: "Protect your brand", href: "/consultation" },
  },
  "company-registration": {
    slug: "company-registration",
    title: "Company Registration",
    description: "Register a company with operating clarity around structure, tax setup, and launch sequencing.",
    eyebrow: "Business Formation",
    hero: "Turn a founder idea into an operational entity with a launch flow designed for speed and control.",
    leadService: "Company Registration",
    highlights: ["Entity planning", "Founder documentation", "Launch readiness"],
    deliverables: ["Structure recommendation", "DSC and DIN support", "Registration filing", "GST and compliance next steps"],
    sections: [
      {
        title: "Formation with context",
        body: [
          "We align registration with how the business will actually sell, invoice, and scale so incorporation is not separated from operations.",
        ],
      },
      {
        title: "What happens after incorporation",
        body: [
          "The team receives immediate direction on GST, banking, founders' paperwork, and compliance responsibilities that come next.",
        ],
      },
    ],
    primaryCta: { label: "Plan your company launch", href: "/consultation" },
  },
  "llp-registration": {
    slug: "llp-registration",
    title: "LLP Registration",
    description: "Launch an LLP with partner-ready documentation and a clear compliance roadmap.",
    eyebrow: "Business Formation",
    hero: "Build a practical LLP structure for firms that want flexibility with professional governance.",
    leadService: "LLP Registration",
    highlights: ["Partner structure review", "Filing support", "Agreement guidance"],
    deliverables: ["Name planning", "Registration filing", "Agreement support", "Compliance planning"],
    sections: [
      { title: "Designed for partnerships", body: ["An LLP can be the right fit for firms that want a structured legal entity with simpler operating rhythm."] },
    ],
    primaryCta: { label: "Launch LLP", href: "/consultation" },
  },
  "opc-registration": {
    slug: "opc-registration",
    title: "OPC Registration",
    description: "A one-founder company setup flow for solo operators who want a more structured business foundation.",
    eyebrow: "Business Formation",
    hero: "Register an OPC with the same product-minded care we bring to larger launch workflows.",
    leadService: "OPC Registration",
    highlights: ["Single-founder positioning", "Registration filing", "Compliance guidance"],
    deliverables: ["Entity suitability review", "Document support", "Filing", "Post-incorporation checklist"],
    sections: [
      { title: "For solo founders", body: ["OPC can work well when a single founder wants a formal operating base without building a large legal stack on day one."] },
    ],
    primaryCta: { label: "Set up OPC", href: "/contact" },
  },
  "partnership-firm-registration": {
    slug: "partnership-firm-registration",
    title: "Partnership Firm Registration",
    description: "Formalize a partnership with clarity on roles, paperwork, and tax-adjacent requirements.",
    eyebrow: "Business Formation",
    hero: "Move from informal collaboration to a structured partnership that clients and banks can trust.",
    leadService: "Partnership Firm Registration",
    highlights: ["Partner alignment", "Deed guidance", "Registration support"],
    deliverables: ["Structure review", "Documentation support", "Registration filing", "Operating checklist"],
    sections: [
      { title: "Built for practical teams", body: ["We help transform informal working relationships into a legally clearer operating setup without making the process feel heavy."] },
    ],
    primaryCta: { label: "Register partnership", href: "/consultation" },
  },
  "sole-proprietorship-registration": {
    slug: "sole-proprietorship-registration",
    title: "Sole Proprietorship Registration",
    description: "A practical setup for solo sellers and service operators who need a formal business identity fast.",
    eyebrow: "Business Formation",
    hero: "Formalize your solo business with a setup path that is lean, mobile-friendly, and easy to execute.",
    leadService: "Sole Proprietorship Registration",
    highlights: ["Fast setup guidance", "Registration dependencies", "Growth-ready next steps"],
    deliverables: ["Readiness review", "Document support", "Entity setup guidance", "Tax next-step map"],
    sections: [
      { title: "Fast-moving structure", body: ["Sole proprietorship works well for operators who need a straightforward commercial identity before graduating to a larger entity."] },
    ],
    primaryCta: { label: "Start setup", href: "/contact" },
  },
  "startup-india-registration": {
    slug: "startup-india-registration",
    title: "Startup India Registration",
    description: "Get a startup recognition workflow that aligns with entity formation, eligibility, and funding readiness.",
    eyebrow: "Growth Enablement",
    hero: "Position your startup for recognition with a workflow that respects both compliance and growth momentum.",
    leadService: "Startup India Registration",
    highlights: ["Eligibility review", "Application assistance", "Founder guidance"],
    deliverables: ["Readiness assessment", "Document checklist", "Filing support", "Recognition next steps"],
    sections: [
      { title: "Recognition with intent", body: ["We treat Startup India filing as part of a broader launch system so founders understand where it fits and what it unlocks."] },
    ],
    primaryCta: { label: "Check startup readiness", href: "/consultation" },
  },
  "annual-compliance-filing": {
    slug: "annual-compliance-filing",
    title: "Annual Compliance Filing",
    description: "Keep annual filings on track with visibility into deadlines, supporting documents, and execution ownership.",
    eyebrow: "Recurring Compliance",
    hero: "Turn annual filing season into a disciplined operating process instead of a yearly scramble.",
    leadService: "Annual Compliance Filing",
    highlights: ["Deadline planning", "Document readiness", "Filing support"],
    deliverables: ["Compliance calendar", "Filing package prep", "Submission support", "Status tracking"],
    sections: [
      { title: "Execution model", body: ["We reduce deadline stress by turning compliance into a visible workflow with known dependencies and handoffs."] },
    ],
    primaryCta: { label: "Plan compliance flow", href: "/consultation" },
  },
  "gst-return-filing": {
    slug: "gst-return-filing",
    title: "GST Return Filing",
    description: "Recurring GST return support with a calmer, operations-friendly filing rhythm.",
    eyebrow: "Recurring Compliance",
    hero: "Keep GST filing predictable with a workflow built around accuracy, reminders, and clean records.",
    leadService: "GST Return Filing",
    highlights: ["Monthly return management", "Input review", "Compliance continuity"],
    deliverables: ["Return readiness", "Filing support", "Issue resolution guidance", "Recurring cadence"],
    sections: [
      { title: "Operationally useful", body: ["The value is not just submission. It is the confidence that tax data, timing, and follow-up are not being handled ad hoc."] },
    ],
    primaryCta: { label: "Stabilize GST filing", href: "/contact" },
  },
  "roc-filing": {
    slug: "roc-filing",
    title: "ROC Filing",
    description: "Handle ROC obligations with clearer sequencing, reminders, and filing accuracy.",
    eyebrow: "Recurring Compliance",
    hero: "Keep ROC compliance from becoming a surprise by giving it real operating visibility.",
    leadService: "ROC Filing",
    highlights: ["Board and ROC alignment", "Document preparation", "Submission support"],
    deliverables: ["Filing schedule", "Record readiness", "Submission workflow", "Escalation guidance"],
    sections: [
      { title: "Founder-safe process", body: ["We package ROC work in a way that is understandable for founders and manageable for internal finance stakeholders."] },
    ],
    primaryCta: { label: "Get ROC support", href: "/consultation" },
  },
  "accounting-bookkeeping": {
    slug: "accounting-bookkeeping",
    title: "Accounting and Bookkeeping",
    description: "Keep your books clean, current, and usable for compliance, decision-making, and investor conversations.",
    eyebrow: "Finance Operations",
    hero: "Finance hygiene becomes a growth advantage when your numbers are current, readable, and operationally trusted.",
    leadService: "Accounting and Bookkeeping",
    highlights: ["Monthly bookkeeping", "Reconciliations", "Management reporting rhythm"],
    deliverables: ["Ledger cleanup", "Monthly close support", "Cashflow visibility", "Compliance-ready books"],
    sections: [
      { title: "Numbers that can be used", body: ["The work is designed to help founders and operators act on finance data, not just archive it for year-end."] },
    ],
    primaryCta: { label: "Clean up finance ops", href: "/contact" },
  },
  "copyright-registration": {
    slug: "copyright-registration",
    title: "Copyright Registration",
    description: "Protect original work with a filing flow suited for creators, agencies, and product teams.",
    eyebrow: "Intellectual Property",
    hero: "Protect the original assets that make your brand, content, or product distinct.",
    leadService: "Copyright Registration",
    highlights: ["Asset review", "Application guidance", "Ownership clarity"],
    deliverables: ["Eligibility review", "Document support", "Application filing", "Protection guidance"],
    sections: [
      { title: "Protection with context", body: ["We help clients understand which assets are worth formal protection and how to present them cleanly in the filing flow."] },
    ],
    primaryCta: { label: "Protect original work", href: "/consultation" },
  },
  "ca-in-kanpur": {
    slug: "ca-in-kanpur",
    title: "CA in Kanpur",
    description: "Local legal and compliance support for Kanpur businesses that want digital speed without losing practical advisory depth.",
    eyebrow: "Local Advisory",
    hero: "A Kanpur-first service page with modern SaaS delivery and hands-on execution depth.",
    leadService: "CA in Kanpur",
    highlights: ["Local business context", "Founder-friendly support", "Digital operating cadence"],
    deliverables: ["Consultation mapping", "Service recommendations", "Execution support", "Recurring partnership"],
    sections: [
      { title: "Why local still matters", body: ["Teams in Kanpur often want the trust and context of a nearby advisory partner with the speed of an online product experience."] },
    ],
    primaryCta: { label: "Talk to local experts", href: "/contact" },
  },
};

export const LEGAL_POLICY_PAGES: Record<string, LegalPolicyContent> = {
  "privacy-policy": {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description:
      "Enterprise privacy policy for Wadhwani Associates covering document storage, Razorpay transactions, cookies, data use, retention, security, and lawful disclosure.",
    eyebrow: "Privacy",
    hero:
      "This policy explains how Wadhwani Associates handles personal data, business records, payment metadata, document workflows, cookies, communications, and legal disclosures across digital legal, tax, and compliance services.",
    lastUpdated: "May 14, 2026",
    highlights: ["Sensitive document handling", "Razorpay and gateway disclosures", "Retention and security controls"],
    sections: [
      {
        title: "Information we collect",
        body: [
          "We may collect names, phone numbers, email addresses, entity details, billing information, uploaded documents, compliance records, payment references, consultation history, and limited technical usage data needed to deliver services.",
          "Collection is limited to information reasonably required for onboarding, support, service execution, platform operations, fraud prevention, payment administration, and statutory or legal obligations.",
        ],
      },
      {
        title: "How we use and share information",
        body: [
          "Information is used to respond to enquiries, execute purchased services, manage support, reconcile payments, maintain records, prevent fraud, improve operational reliability, and comply with legal or regulatory duties.",
          "Wadhwani Associates does not sell personal data to unrelated advertisers or brokers. Sharing is limited to service providers, professionals, payment partners, and lawful disclosures reasonably required for service delivery or compliance.",
        ],
      },
      {
        title: "Storage, gateways, and retention",
        body: [
          "Sensitive payment instrument data is ordinarily processed by gateways such as Razorpay, while Wadhwani Associates may retain transaction references, invoice records, and payment status needed for support and dispute handling.",
          "Retention periods depend on service type, legal and tax obligations, audit requirements, dispute management, fraud controls, and the record-keeping standards relevant to the engagement.",
        ],
      },
    ],
  },
  "terms-and-conditions": {
    slug: "terms-and-conditions",
    title: "Terms and Conditions",
    description:
      "Razorpay-ready terms governing Wadhwani Associates' GST, ITR, ROC/MCA, MSME, trademark, incorporation, subscription, payment, and digital documentation services.",
    eyebrow: "Terms",
    hero:
      "These terms define the responsibilities, payment rules, digital delivery model, service limitations, government dependency, fraud controls, and dispute expectations for using Wadhwani Associates services.",
    lastUpdated: "May 14, 2026",
    highlights: ["Razorpay-ready payment terms", "Digital service delivery rules", "Government approval dependency"],
    sections: [
      {
        title: "Acceptance and service scope",
        body: [
          "By using the website, submitting an enquiry, booking a consultation, uploading documents, making a payment, or using a subscription service, users agree to these Terms and Conditions and related policies.",
          "Wadhwani Associates provides professional support for GST, ITR, ROC/MCA compliance, MSME registration, trademark services, company incorporation, recurring compliance subscriptions, and digital legal documentation services.",
        ],
      },
      {
        title: "User responsibility and authority dependency",
        body: [
          "Users must provide accurate, complete, current, and legally valid information and documents. Wadhwani Associates relies on user-supplied records for service execution and statutory filing preparation.",
          "Timelines and outcomes may depend on user approvals, document readiness, government departments, statutory portals, banks, registries, payment partners, and other third-party systems outside Wadhwani Associates' direct control.",
        ],
      },
      {
        title: "Payments, subscriptions, and misuse controls",
        body: [
          "Payments may be collected through Razorpay and approved digital channels. Recurring compliance plans and subscriptions are billed according to the selected plan, invoice, proposal, or checkout terms.",
          "Wadhwani Associates may pause services for non-payment, incomplete information, unlawful use, suspected fraud, chargeback abuse, document forgery, or activity that creates legal, security, payment, or compliance risk.",
        ],
      },
      {
        title: "Liability, confidentiality, and jurisdiction",
        body: [
          "Except where prohibited by law, liability for a specific paid engagement is limited to the amount paid to Wadhwani Associates for that engagement, excluding statutory fees, government charges, third-party costs, taxes, and gateway charges.",
          "These terms are governed by Indian law. Subject to mandatory consumer protection rights, disputes shall fall under the jurisdiction of competent courts and authorities in Kanpur, Uttar Pradesh, India.",
        ],
      },
    ],
  },
  "refund-policy": {
    slug: "refund-policy",
    title: "Refund Policy",
    description: "Refund terms for consultations, legal-tech services, filing workflows, and advance payments made to Wadhwani Associates.",
    eyebrow: "Refunds",
    hero: "This refund policy explains when payments may be refundable, how refund requests are reviewed, and where charges remain non-refundable because work has already started or third-party costs have been incurred.",
    lastUpdated: "May 12, 2026",
    highlights: ["Refund eligibility rules", "Service-stage review", "Third-party fee exclusions"],
    sections: [
      {
        title: "General refund principles",
        body: [
          "Refund requests are evaluated based on the stage of service delivery, work already performed, resources allocated, and any third-party charges already committed for the engagement.",
          "Amounts paid toward government fees, statutory charges, filing fees, payment gateway fees, or other third-party costs are generally non-refundable once incurred or committed.",
        ],
      },
      {
        title: "When refunds may be allowed",
        body: [
          "A refund may be considered if a duplicate payment was made, the service cannot be initiated for reasons attributable solely to Wadhwani Associates, or a written cancellation request is received before substantive work has started.",
          "Approved partial refunds may be issued after deducting consultation charges, document review effort, administrative handling, and any third-party or compliance costs already incurred.",
        ],
      },
      {
        title: "Non-refundable cases",
        body: [
          "Payments are ordinarily non-refundable after expert consultation has been delivered, documents have been reviewed, drafting or filing work has begun, credentials have been created, or submissions have been prepared or lodged.",
          "Refunds will also not apply where delays or non-completion arise from client-side inaction, incomplete information, non-cooperation, or changes requested after work has materially progressed.",
        ],
      },
      {
        title: "How to request a refund",
        body: [
          "Refund requests should be submitted from the registered contact details with the payment reference, service name, and reason for the request. We may ask for supporting details needed to verify the claim.",
          "Once reviewed, approved refunds are processed back to the original payment method or another compliant channel within a reasonable operational timeline, subject to banking and payment partner processing cycles.",
        ],
      },
    ],
  },
  "cancellation-policy": {
    slug: "cancellation-policy",
    title: "Cancellation Policy",
    description: "Cancellation rules for consultations, service orders, recurring compliance work, and active execution workflows on Wadhwani Associates.",
    eyebrow: "Cancellations",
    hero: "This cancellation policy sets out how and when a service request, consultation, or execution workflow can be cancelled, and what commercial consequences may follow.",
    lastUpdated: "May 12, 2026",
    highlights: ["Pre-start cancellation window", "Consultation and execution limits", "Billing impact clarity"],
    sections: [
      {
        title: "Cancellation before work starts",
        body: [
          "Users may request cancellation before substantive work begins by contacting Wadhwani Associates through the registered communication channel and sharing the relevant order or payment reference.",
          "If no material work, review, drafting, filing preparation, or third-party booking has occurred, the request may be accepted subject to applicable administrative deductions under the refund policy.",
        ],
      },
      {
        title: "Consultations and scheduled sessions",
        body: [
          "Consultation bookings should be rescheduled or cancelled with reasonable advance notice. Missed appointments, attended consultations, or sessions cancelled after the advisor allocation window may be treated as consumed.",
          "Where a consultation forms part of a packaged service, the consultation value may still be deducted even if the broader service is later cancelled.",
        ],
      },
      {
        title: "Cancellation after execution starts",
        body: [
          "Once document collection, review, drafting, filing preparation, workflow activation, or authority-facing execution has begun, cancellation may be restricted or may result in only a limited partial refund, if any.",
          "Recurring compliance or ongoing service plans may require notice before the next billing or execution cycle to avoid charges for work already scheduled or underway.",
        ],
      },
      {
        title: "Effect of cancellation",
        body: [
          "Upon cancellation, access to service-specific workflows, advisor allocation, execution tracking, or deliverables may be paused or discontinued depending on the stage of the engagement.",
          "Any records that must be retained for legal, accounting, audit, fraud prevention, or dispute management reasons may continue to be stored in accordance with our privacy and compliance obligations.",
        ],
      },
    ],
  },
  "service-delivery-policy": {
    slug: "service-delivery-policy",
    title: "Service Delivery Policy",
    description: "How Wadhwani Associates delivers paid legal, tax, compliance, and consultation services after successful payment.",
    eyebrow: "Service Delivery",
    hero: "This policy explains how paid service requests move from payment confirmation to document collection, expert review, execution, and client handoff.",
    lastUpdated: "May 14, 2026",
    highlights: ["Digital service delivery", "Workflow-based execution", "No physical shipping"],
    sections: [
      {
        title: "Digital delivery model",
        body: [
          "Wadhwani Associates provides legal, tax, compliance, consultation, and workflow execution services digitally through website forms, phone support, email, WhatsApp, client portal updates, and internal CRM-assisted operations.",
          "No physical goods are shipped for standard service purchases. Deliverables may include consultation notes, filing acknowledgements, draft documents, invoices, status updates, and completion confirmations shared through digital channels.",
        ],
      },
      {
        title: "Delivery timelines",
        body: [
          "Service timelines depend on the selected service, document readiness, payment confirmation, user response time, statutory portals, government departments, and third-party systems involved in the workflow.",
          "After payment verification, Wadhwani Associates initiates the relevant workflow and may request documents or clarifications before execution can proceed.",
        ],
      },
      {
        title: "Customer responsibilities",
        body: [
          "Customers must provide accurate information, complete documents, correct contact details, and timely approvals so the assigned service workflow can move forward without unnecessary delay.",
          "Delays caused by incomplete information, incorrect details, missed calls, delayed approvals, statutory portal downtime, or third-party processing are handled according to the stage of the service and applicable policies.",
        ],
      },
      {
        title: "Completion and support",
        body: [
          "A service is treated as delivered when the agreed consultation, document preparation, filing support, submission assistance, or completion handoff has been provided according to the scope of the purchased service.",
          "Customers can contact support for delivery status, document access, payment confirmation, invoices, or clarification on next steps using the contact details listed on the website.",
        ],
      },
    ],
  },
};

export const LEGAL_POLICY_SLUGS = Object.keys(LEGAL_POLICY_PAGES);

export const DYNAMIC_MARKETING_SLUGS = Object.keys(MARKETING_PAGE_CONTENT).filter(
  (slug) => !["gst-registration", "itr-filing", "trademark-registration"].includes(slug),
);

export function getMarketingPage(slug: string) {
  return MARKETING_PAGE_CONTENT[slug] || null;
}

export function getLegalPolicyPage(slug: string) {
  return LEGAL_POLICY_PAGES[slug] || null;
}

export const ALL_MARKETING_ROUTES = [
  "/",
  "/services",
  "/consultation",
  "/contact",
  "/partner",
  "/tools",
  "/payment-methods",
  "/payment-success",
  ...Object.keys(MARKETING_PAGE_CONTENT).map((slug) => `/${slug}`),
  ...LEGAL_POLICY_SLUGS.map((slug) => `/${slug}`),
];




export function findServiceCard(value: string) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return (
    SERVICE_LIBRARY.find((service) =>
      [service.code, service.slug, service.title].some((candidate) =>
        String(candidate || "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "") === normalized
      )
    ) || null
  );
}

// Mega Menu Navigation Data
export type MegaMenuItem = {
  label: string;
  href: string;
  description?: string;
  icon?: string;
  badge?: string;
};

export type MegaMenuCategory = {
  id: string;
  label: string;
  icon: string;
  description: string;
  items: MegaMenuItem[];
  featured?: {
    title: string;
    description: string;
    href: string;
    image?: string;
  };
};

export const MEGA_MENU_CATEGORIES: MegaMenuCategory[] = [
  {
    id: "start-business",
    label: "Start a Business",
    icon: "Briefcase",
    description: "Company registration and business formation",
    items: [
      { label: "Private Limited Company", href: "/company-registration", description: "Most popular for startups", badge: "Popular" },
      { label: "LLP Registration", href: "/llp-registration", description: "For professional partnerships" },
      { label: "One Person Company", href: "/opc-registration", description: "Solo founder structure" },
      { label: "Partnership Firm", href: "/partnership-firm-registration", description: "Traditional partnership" },
      { label: "Sole Proprietorship", href: "/sole-proprietorship-registration", description: "Quick and simple" },
      { label: "Startup India Registration", href: "/startup-india-registration", description: "Government benefits" },
    ],
    featured: {
      title: "Company Registration Guide",
      description: "Learn which business structure is right for you",
      href: "/services",
    },
  },
  {
    id: "tax-compliance",
    label: "Tax & Compliance",
    icon: "FileText",
    description: "GST, ITR, and recurring filings",
    items: [
      { label: "GST Registration", href: "/gst-registration", description: "Get GST number", badge: "Essential" },
      { label: "GST Return Filing", href: "/gst-return-filing", description: "Monthly/quarterly returns" },
      { label: "ITR Filing", href: "/itr-filing", description: "Income tax returns" },
      { label: "Annual Compliance", href: "/annual-compliance-filing", description: "ROC and board filings" },
      { label: "ROC Filing", href: "/roc-filing", description: "Company annual returns" },
    ],
    featured: {
      title: "GST Compliance Calendar",
      description: "Never miss a filing deadline",
      href: "/tools",
    },
  },
  {
    id: "trademark-ip",
    label: "Trademark & IP",
    icon: "Shield",
    description: "Protect your brand and intellectual property",
    items: [
      { label: "Trademark Registration", href: "/trademark-registration", description: "Protect your brand", badge: "Recommended" },
      { label: "Copyright Registration", href: "/copyright-registration", description: "Protect creative works" },
      { label: "Trademark Search", href: "/consultation", description: "Check availability" },
      { label: "Trademark Objection", href: "/consultation", description: "Handle objections" },
    ],
    featured: {
      title: "Brand Protection Guide",
      description: "Everything about protecting your business name",
      href: "/trademark-registration",
    },
  },
  {
    id: "accounting",
    label: "Accounting & Finance",
    icon: "Calculator",
    description: "Bookkeeping and financial management",
    items: [
      { label: "Accounting & Bookkeeping", href: "/accounting-bookkeeping", description: "Monthly bookkeeping" },
      { label: "Payroll Management", href: "/consultation", description: "Salary processing" },
      { label: "Virtual CFO", href: "/consultation", description: "Financial advisory" },
      { label: "Audit Support", href: "/consultation", description: "Statutory audits" },
    ],
    featured: {
      title: "Finance Health Check",
      description: "Get your books audit-ready",
      href: "/accounting-bookkeeping",
    },
  },
  {
    id: "legal",
    label: "Legal Services",
    icon: "Scale",
    description: "Contracts, agreements, and legal compliance",
    items: [
      { label: "Legal Consultation", href: "/consultation", description: "Expert legal advice" },
      { label: "Contract Drafting", href: "/consultation", description: "Business agreements" },
      { label: "MSME Registration", href: "/consultation", description: "Get MSME benefits" },
      { label: "Import Export Code", href: "/consultation", description: "Start trading internationally" },
    ],
    featured: {
      title: "Talk to a Lawyer",
      description: "Get expert legal advice in 30 minutes",
      href: "/consultation",
    },
  },
];

export const TRUST_STATS = {
  googleRating: 4.7,
  totalReviews: 15000,
  clientsServed: 50000,
  yearsExperience: 5,
  expertTeam: 100,
};

export const QUICK_LINKS = [
  { label: "Talk to Expert", href: "/consultation", icon: "Phone" },
  { label: "Tools", href: "/tools", icon: "Wrench" },
  { label: "Partner", href: "/partner", icon: "Users" },
  { label: "Contact", href: "/contact", icon: "Mail" },
];
