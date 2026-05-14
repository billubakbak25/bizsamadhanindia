import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Clock3,
  FileCheck2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  ShieldCheck,
  TimerReset,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import { ContactCard } from "@/components/sections/contact/ContactCard";
import { GoogleMapEmbed } from "@/components/sections/contact/GoogleMapEmbed";
import { StickyMobileContactBar } from "@/components/sections/contact/StickyMobileContactBar";
import { Card } from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/Button";
import { BUSINESS_CONTACT, SITE_URL } from "@/lib/constants";

const pageUrl = new URL("/contact", SITE_URL).toString();
const officeAddress = BUSINESS_CONTACT.officeAddressLines.join(" ");
const primaryCallHref = `tel:+91${BUSINESS_CONTACT.primaryPhones[0]}`;
const secondaryCallHref = `tel:+91${BUSINESS_CONTACT.primaryPhones[1]}`;
const supportEmailHref = `mailto:${BUSINESS_CONTACT.supportEmail}`;
const whatsappHref = `https://wa.me/${BUSINESS_CONTACT.whatsappNumber}?text=${encodeURIComponent(
  "Hello Wadhwani Associates, I need help with GST, ITR, ROC, MSME, trademark, incorporation, or compliance services.",
)}`;

const trustIndicators = [
  "Professional legal, tax, and compliance support delivered through documented digital workflows",
  "Visible office address, dual contact numbers, grievance path, and policy links for merchant verification confidence",
  "Secure communication guidance for payments, documents, and consultation follow-up",
];

const responseStandards = [
  {
    title: "Consultation enquiries",
    detail: "Inbound calls, form submissions, and WhatsApp requests are triaged to the relevant advisory queue during working hours.",
  },
  {
    title: "Active client support",
    detail: "Document, billing, and filing-stage queries for ongoing matters are prioritised against the relevant execution workflow.",
  },
  {
    title: "Grievance handling",
    detail: "Escalation requests are acknowledged quickly and reviewed with service, billing, and communication records where applicable.",
  },
];

const faqs = [
  {
    question: "How quickly does Wadhwani Associates respond to new enquiries?",
    answer:
      "During business hours, most new enquiries are acknowledged within 30 to 60 minutes. More complex service questions may move into a scheduled callback or advisor review depending on the subject matter.",
  },
  {
    question: "Can I use WhatsApp for service queries and document coordination?",
    answer:
      "Yes. WhatsApp is available for initial coordination and support follow-up. For sensitive records, invoice confirmation, grievance review, and policy-linked requests, we may move the conversation to email or the formal enquiry flow for better auditability.",
  },
  {
    question: "Do you support GST, ITR, ROC/MCA, MSME, trademark, and incorporation requests from the same contact desk?",
    answer:
      "Yes. The contact desk routes enquiries across GST registration and filing, Income Tax Return filing, ROC and MCA compliance, MSME registration, trademark filing, company incorporation, recurring compliance retainers, and digital legal documentation support.",
  },
  {
    question: "What should I include when raising a billing or grievance issue?",
    answer:
      "Please include your name, phone number, service name, invoice or payment reference, and a brief description of the issue. That helps the operations team review transaction history and service records without unnecessary delay.",
  },
];

const relatedLinks = [
  { label: "GST Registration", href: "/gst-registration" },
  { label: "ITR Filing", href: "/itr-filing" },
  { label: "Company Incorporation", href: "/company-registration" },
  { label: "Trademark Services", href: "/trademark-registration" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms and Conditions", href: "/terms-and-conditions" },
  { label: "Service Delivery Policy", href: "/service-delivery-policy" },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${pageUrl}#localbusiness`,
      name: BUSINESS_CONTACT.businessName,
      url: SITE_URL,
      image: new URL("/og-image.svg", SITE_URL).toString(),
      email: BUSINESS_CONTACT.supportEmail,
      telephone: `+91${BUSINESS_CONTACT.primaryPhones[0]}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "LIG 25 SF Colony, Barra 3",
        addressLocality: BUSINESS_CONTACT.officeCity,
        addressRegion: BUSINESS_CONTACT.officeRegion,
        postalCode: BUSINESS_CONTACT.postalCode,
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: BUSINESS_CONTACT.geo.latitude,
        longitude: BUSINESS_CONTACT.geo.longitude,
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          name: BUSINESS_CONTACT.supportPerson,
          contactType: "customer support",
          telephone: `+91${BUSINESS_CONTACT.primaryPhones[0]}`,
          email: BUSINESS_CONTACT.supportEmail,
          areaServed: "IN",
          availableLanguage: ["English", "Hindi"],
        },
        {
          "@type": "ContactPoint",
          name: BUSINESS_CONTACT.supportPerson,
          contactType: "grievance support",
          telephone: `+91${BUSINESS_CONTACT.primaryPhones[1]}`,
          email: BUSINESS_CONTACT.supportEmail,
          areaServed: "IN",
          availableLanguage: ["English", "Hindi"],
        },
      ],
      employee: {
        "@id": `${pageUrl}#support-person`,
      },
      hasMap: BUSINESS_CONTACT.directionsUrl,
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:30",
          closes: "19:00",
        },
      ],
    },
    {
      "@type": "Person",
      "@id": `${pageUrl}#support-person`,
      name: BUSINESS_CONTACT.supportPerson,
      jobTitle: "Official Support Representative",
      worksFor: {
        "@id": `${pageUrl}#localbusiness`,
      },
      email: BUSINESS_CONTACT.supportEmail,
      telephone: `+91${BUSINESS_CONTACT.primaryPhones[0]}`,
    },
    {
      "@type": "ProfessionalService",
      "@id": `${pageUrl}#professionalservice`,
      name: `${BUSINESS_CONTACT.businessName} Contact Desk`,
      url: pageUrl,
      serviceType: [
        "GST registration and filing",
        "Income Tax Return filing",
        "ROC and MCA compliance",
        "MSME registration",
        "Trademark filing",
        "Company incorporation",
        "Subscription compliance services",
        "Digital documentation services",
      ],
      provider: {
        "@id": `${pageUrl}#localbusiness`,
      },
      areaServed: {
        "@type": "Country",
        name: "India",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "Contact Us | Wadhwani Associates",
      description:
        "Contact Wadhwani Associates for GST, ITR, ROC/MCA, MSME, trademark, incorporation, compliance subscriptions, and digital documentation services.",
      dateModified: "2026-05-14",
      inLanguage: "en-IN",
      mainEntity: {
        "@id": `${pageUrl}#localbusiness`,
      },
      breadcrumb: {
        "@id": `${pageUrl}#breadcrumb`,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
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
          name: "Contact Us",
          item: pageUrl,
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "Contact Us | Wadhwani Associates",
  description:
    "Reach Wadhwani Associates for GST, ITR, ROC/MCA, MSME, trademark, incorporation, subscription compliance, billing, grievance, and digital documentation support.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Contact Us | Wadhwani Associates",
    description:
      "Enterprise contact page for legal, tax, compliance, payment, and grievance support at Wadhwani Associates.",
    url: pageUrl,
    siteName: BUSINESS_CONTACT.businessName,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Wadhwani Associates",
    description:
      "Office address, phone support, WhatsApp, email, grievance routing, and trusted business contact details for Wadhwani Associates.",
  },
};

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ecfeff_100%)] px-4 pb-12 pt-10 dark:bg-slate-950 dark:bg-none sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="transition hover:text-[var(--brand)]">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 dark:text-slate-100">Contact Us</span>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)] shadow-sm backdrop-blur dark:border-emerald-900/50 dark:bg-slate-900/70">
                <ShieldCheck className="h-4 w-4" />
                Merchant-trust contact desk
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                  Reach a real compliance team with visible office details, live support routes, and documented follow-up.
                </h1>
                <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300 sm:text-lg">
                  Wadhwani Associates supports GST registration and filing, Income Tax Return filing, ROC and MCA compliance, MSME registration,
                  trademark filing, company incorporation, subscription compliance services, and digital documentation services through a
                  professional contact and service workflow built for trust.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {trustIndicators.map((indicator) => (
                  <div
                    key={indicator}
                    className="rounded-[24px] border border-white/70 bg-white/85 p-5 text-sm leading-6 text-slate-700 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {indicator}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a href={primaryCallHref} className={buttonClassName({ size: "lg", className: "gap-2" })}>
                  <Phone className="h-4 w-4" />
                  Call primary desk
                </a>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClassName({ variant: "secondary", size: "lg", className: "gap-2" })}>
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp support
                </a>
                <a href="#contact-form" className={buttonClassName({ variant: "ghost", size: "lg", className: "gap-2" })}>
                  Share your requirement
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <Card className="p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Business identity</p>
              <div className="mt-4 space-y-4">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{BUSINESS_CONTACT.businessName}</h2>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                  A digital-first legal, tax, and compliance support business with visible contact channels, documented working hours,
                  grievance routing, and policy-backed merchant presentation for payment and trust verification.
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 sm:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[var(--brand)] dark:bg-slate-950">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Official support representative</p>
                      <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">{BUSINESS_CONTACT.supportPerson}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {BUSINESS_CONTACT.supportRepresentativeLabel}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Primary numbers</p>
                  <div className="mt-3 space-y-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                    <a href={primaryCallHref} className="block hover:text-[var(--brand)]">
                      {BUSINESS_CONTACT.primaryPhoneDisplay[0]}
                    </a>
                    <a href={secondaryCallHref} className="block hover:text-[var(--brand)]">
                      {BUSINESS_CONTACT.primaryPhoneDisplay[1]}
                    </a>
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Support email</p>
                  <a href={supportEmailHref} className="mt-3 block text-sm font-medium text-slate-900 hover:text-[var(--brand)] dark:text-slate-100">
                    {BUSINESS_CONTACT.supportEmail}
                  </a>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Registered office contact point</p>
                <address className="mt-3 not-italic text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {BUSINESS_CONTACT.officeAddressLines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </address>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <ContactCard
            eyebrow="Direct support"
            title="Speak to the service desk"
            description="Use the contact route most suited to your urgency and the nature of your request."
            icon={<Phone className="h-5 w-5" />}
            content={
              <div className="space-y-3">
                <p>Call the primary desk for GST, ITR, ROC, incorporation, and documentation enquiries.</p>
                <p>Use the secondary number for follow-up, escalation, and service continuity where the primary line is busy.</p>
              </div>
            }
            actions={[
              { label: BUSINESS_CONTACT.primaryPhoneDisplay[0], href: primaryCallHref, variant: "primary", external: true },
              { label: BUSINESS_CONTACT.primaryPhoneDisplay[1], href: secondaryCallHref, variant: "secondary", external: true },
            ]}
          />

          <ContactCard
            eyebrow="Written communication"
            title="Use support email or WhatsApp"
            description="Suitable for document checklists, invoice references, call-back requests, and service summaries."
            icon={<Mail className="h-5 w-5" />}
            content={
              <div className="space-y-3">
                <p>Email is preferred for payment references, policy-linked requests, privacy concerns, and grievance documentation.</p>
                <p>WhatsApp is useful for fast coordination, but sensitive or billing-critical matters may be moved to email for cleaner records.</p>
              </div>
            }
            actions={[
              { label: "Email support", href: supportEmailHref, variant: "primary", external: true },
              { label: "WhatsApp now", href: whatsappHref, variant: "secondary", external: true },
            ]}
          />

          <ContactCard
            eyebrow="Office location"
            title="Visit or verify the office address"
            description="Visible office details help build legitimacy for clients, payment partners, and grievance handling."
            icon={<Building2 className="h-5 w-5" />}
            content={
              <div className="space-y-3">
                <address className="not-italic leading-7">
                  {BUSINESS_CONTACT.officeAddressLines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </address>
                <p className="text-slate-600 dark:text-slate-300">Please call ahead for scheduled meetings or document handoff visits.</p>
              </div>
            }
            actions={[
              { label: "Get directions", href: BUSINESS_CONTACT.directionsUrl, variant: "primary", external: true },
              { label: "Open map", href: BUSINESS_CONTACT.directionsUrl, variant: "secondary", external: true },
            ]}
          />
        </div>
      </section>

      <section className="px-4 py-2 sm:px-6 lg:px-8 lg:py-4">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.98fr_1.02fr]">
          <div id="contact-form">
            <LeadCaptureForm
              title="Share your requirement with the right team"
              description="This enquiry form routes directly into the active lead workflow so GST, tax, incorporation, compliance, and documentation requests reach the correct advisory queue."
            />
          </div>

          <div className="space-y-6">
            <Card className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Working hours</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Operational availability</h2>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-[var(--brand)] dark:bg-emerald-950/40">
                  <Clock3 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {BUSINESS_CONTACT.workingHours.map((slot) => (
                  <div key={slot.label} className="flex items-start justify-between gap-4 rounded-[22px] border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <span className="text-sm font-semibold text-slate-950 dark:text-white">{slot.label}</span>
                    <span className="text-right text-sm text-slate-600 dark:text-slate-300">{slot.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Response timeline</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">What to expect after you contact us</h2>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-[var(--brand)] dark:bg-emerald-950/40">
                  <TimerReset className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {responseStandards.map((item) => (
                  <div key={item.title} className="rounded-[22px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GoogleMapEmbed
            title="Find the Kanpur office"
            description="Use the embedded map for merchant-verification clarity, office-location confidence, and direct navigation support."
            embedUrl={BUSINESS_CONTACT.mapEmbedUrl}
            directionsUrl={BUSINESS_CONTACT.directionsUrl}
            address={officeAddress}
          />

          <div className="space-y-6">
            <Card className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Grievance support</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Escalation path for service, billing, and communication issues</h2>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                  <TriangleAlert className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
                <p>
                  For unresolved support issues, payment disputes, response delays, or service-scope clarifications, contact the grievance path through
                  the support email and include your phone number, service name, invoice or payment reference, and issue summary.
                </p>
                <p>
                  Initial grievance acknowledgement is expected within 1 business day, followed by a review of payment records, communication logs,
                  and the active execution stage where relevant.
                </p>
                <div className="rounded-[22px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="font-semibold text-slate-950 dark:text-white">Recommended subject line</p>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">Grievance Support - [Your Name] - [Service / Payment Reference]</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href={supportEmailHref} className={buttonClassName({ className: "gap-2" })}>
                    <Mail className="h-4 w-4" />
                    Raise a grievance
                  </a>
                  <a href={secondaryCallHref} className={buttonClassName({ variant: "secondary", className: "gap-2" })}>
                    <Phone className="h-4 w-4" />
                    Escalation line
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Trust and security</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Secure communication and business-trust messaging</h2>
              <div className="mt-6 space-y-4">
                <div className="rounded-[22px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[var(--brand)]" />
                    <p className="font-semibold text-slate-950 dark:text-white">Use documented channels for payments and sensitive records</p>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    Payment references, invoices, compliance documents, and grievance issues should be routed through visible phone, email, or form channels so the team can track them properly.
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <FileCheck2 className="h-5 w-5 text-[var(--brand)]" />
                    <p className="font-semibold text-slate-950 dark:text-white">GST-compliant, policy-backed service presentation</p>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    The contact experience connects to policy pages, visible office information, and service-specific workflows to strengthen legitimacy for clients and payment partners.
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-[var(--brand)]" />
                    <p className="font-semibold text-slate-950 dark:text-white">Professional identity for legal-tech and compliance work</p>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    Clear contact visibility, office location, response standards, and escalation handling reduce merchant-verification friction and build customer confidence.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 py-2 sm:px-6 lg:px-8 lg:py-4">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Helpful links</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Navigate to related services and policies</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                These links improve discovery for users, strengthen policy transparency for merchant reviewers, and help search engines connect the contact page with commercial and compliance intent.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--brand)] hover:text-[var(--brand)] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Questions customers and payment reviewers usually care about</h2>
          </div>
          <div className="mt-8 grid gap-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-[28px] border border-slate-200 bg-white p-6 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950">
                <summary className="cursor-pointer list-none text-lg font-semibold text-slate-950 dark:text-white">{faq.question}</summary>
                <p className="mt-4 max-w-5xl text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 pt-2 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mx-auto max-w-7xl rounded-[32px] bg-gradient-to-r from-[var(--brand)] to-teal-600 px-6 py-8 text-white shadow-[0_30px_80px_-40px_rgba(15,118,110,0.6)] sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">Ready to connect</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Speak with the Wadhwani Associates team through a verified and visible support channel.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={primaryCallHref} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--brand)] transition hover:bg-emerald-50">
                <Phone className="h-4 w-4" />
                Call now
              </a>
              <a href={supportEmailHref} className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                <Mail className="h-4 w-4" />
                Email support
              </a>
            </div>
          </div>
        </div>
      </section>

      <StickyMobileContactBar callHref={primaryCallHref} whatsappHref={whatsappHref} emailHref={supportEmailHref} />
    </>
  );
}
