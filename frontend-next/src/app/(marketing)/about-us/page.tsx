import type { Metadata } from "next";
import { BriefcaseBusiness, FileCheck2, ShieldCheck, UsersRound } from "lucide-react";
import { ComplianceContentPage, type ComplianceContentSection } from "@/components/sections/ComplianceContentPage";
import { Card } from "@/components/ui/Card";
import { BUSINESS_CONTACT, COMPANY, SITE_URL } from "@/lib/constants";

const pageUrl = new URL("/about-us", SITE_URL).toString();

export const metadata: Metadata = {
  title: "About Wadhwani Associates | Legal, Tax & Compliance Services in India",
  description:
    "Learn about Wadhwani Associates, a digital-first legal, tax, GST, ROC, trademark, and business compliance consultancy serving Indian businesses with professional documentation and support.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "About Wadhwani Associates | Legal, Tax & Compliance Services in India",
    description:
      "Professional legal, tax, GST, ROC, trademark, documentation, and business compliance support by Wadhwani Associates.",
    url: pageUrl,
    siteName: COMPANY.name,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Wadhwani Associates | Legal, Tax & Compliance Services in India",
    description:
      "Digital-first legal, tax, GST, ROC, trademark, and business compliance consultancy for Indian clients.",
  },
};

const sections: ComplianceContentSection[] = [
  {
    title: "Who We Are",
    body: [
      "Wadhwani Associates is a Kanpur-based professional services firm focused on simplifying legal, tax, and business compliance requirements for Indian clients. We support individuals, professionals, startups, small businesses, and growing enterprises with consultancy and documentation assistance across key compliance areas.",
      "Our work is built around practical guidance, responsible documentation, clear communication, and service transparency. We help clients understand what is required, what documents are needed, what timelines may apply, and what dependencies may affect completion.",
    ],
  },
  {
    title: "What We Do",
    body: [
      "We provide consultancy, documentation assistance, filing support, and digital professional service coordination for legal, tax, GST, ROC/MCA, trademark, MSME, and business compliance matters.",
      "Our services are delivered digitally or remotely unless a specific engagement requires an offline meeting, physical document review, or in-person coordination. Timelines may vary depending on client document readiness, government portal availability, statutory processing, third-party systems, and authority-side approvals.",
      "We provide consultancy and documentation assistance services and do not guarantee government approval timelines.",
    ],
  },
  {
    title: "Our Services",
    items: [
      "GST Registration and GST Filing",
      "Income Tax Return Filing",
      "Company Registration",
      "ROC/MCA Compliance",
      "Trademark Services",
      "MSME Registration",
      "Tax Consultancy",
      "Legal Documentation",
      "Business Compliance Services",
      "Digital Professional Consultancy",
    ],
  },
  {
    title: "Why Clients Trust Us",
    items: [
      "Clear service descriptions and policy disclosures",
      "Digital-first communication through phone, email, WhatsApp, and online forms",
      "Document-focused workflows for better accuracy",
      "Professional support for tax, legal, GST, ROC, and compliance matters",
      "Transparent guidance on government dependencies and approval timelines",
      "Defined support contact for service, billing, and documentation queries",
    ],
  },
  {
    title: "Professional Commitment",
    body: [
      "Our commitment is to provide responsible, well-documented, and client-focused professional support. We aim to reduce confusion, avoid avoidable documentation gaps, and help clients make informed decisions before proceeding with filings, registrations, or compliance-related work.",
      "We maintain a practical and compliance-oriented approach. Where a matter depends on a government department, statutory authority, portal availability, payment partner, or third-party system, we communicate those dependencies clearly.",
    ],
  },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "About Wadhwani Associates",
      description: metadata.description,
      inLanguage: "en-IN",
      mainEntity: { "@id": `${SITE_URL}#organization` },
    },
    {
      "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
      "@id": `${SITE_URL}#organization`,
      name: COMPANY.name,
      alternateName: COMPANY.brandName,
      url: SITE_URL,
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
      ],
    },
  ],
};

const principles = [
  { title: "Compliance-first", body: "Service communication is structured around clear scope, document readiness, policy visibility, and lawful professional support.", icon: ShieldCheck },
  { title: "Client-centric", body: "Clients receive practical guidance, support contact visibility, and clear next steps for active service requests.", icon: UsersRound },
  { title: "Document-led", body: "We focus on correct information, complete records, and better handoff before filing or authority-facing steps begin.", icon: FileCheck2 },
  { title: "Digital-first", body: "Most service journeys are coordinated through approved remote channels for speed, tracking, and accessibility.", icon: BriefcaseBusiness },
];

export default function AboutUsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ComplianceContentPage
        eyebrow="About Wadhwani Associates"
        title="About Wadhwani Associates"
        description="Professional legal, tax, GST, ROC, trademark, and business compliance support for individuals, founders, and growing businesses across India."
        highlights={[
          "Digital-first professional services for Indian clients",
          "Visible support representative and office contact details",
          "Compliance-oriented documentation and consultation workflows",
        ]}
        sections={sections}
        ctaTitle="Need professional compliance support?"
        ctaBody="Share your requirement with Wadhwani Associates and our support team will guide you toward the relevant tax, legal, registration, or compliance workflow."
        ctaPrimaryLabel="Speak with support"
        ctaSecondaryLabel="View services"
        footerNote="Biz Samadhan India is the website and digital service identity operated for Wadhwani Associates. All professional services are provided under the business identity Wadhwani Associates."
      >
        <div className="grid gap-4 md:grid-cols-4">
          {principles.map((item) => (
            <Card key={item.title} className="p-5">
              <item.icon className="h-6 w-6 text-[var(--brand)]" />
              <h2 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
            </Card>
          ))}
        </div>
      </ComplianceContentPage>
    </>
  );
}
