import type { Metadata } from "next";
import { ComplianceContentPage, type ComplianceContentSection } from "@/components/sections/ComplianceContentPage";
import { BUSINESS_CONTACT, COMPANY, SITE_URL } from "@/lib/constants";

const pageUrl = new URL("/service-description", SITE_URL).toString();

export const metadata: Metadata = {
  title: "Legal, Tax, GST & Compliance Services | Wadhwani Associates",
  description:
    "Wadhwani Associates provides GST registration, ITR filing, company registration, ROC/MCA compliance, trademark, MSME, tax consultancy, and digital professional documentation services across India.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Legal, Tax, GST & Compliance Services | Wadhwani Associates",
    description:
      "Digital-first consultancy and documentation assistance for GST, income tax, company registration, ROC/MCA compliance, trademark, MSME, and business compliance needs.",
    url: pageUrl,
    siteName: COMPANY.name,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legal, Tax, GST & Compliance Services | Wadhwani Associates",
    description:
      "Professional legal, tax, GST, ROC, trademark, MSME, and compliance consultancy services across India.",
  },
};

const sections: ComplianceContentSection[] = [
  {
    title: "Detailed Service Description",
    body: [
      "Wadhwani Associates provides professional consultancy and documentation assistance services for individuals, founders, professionals, and businesses. Our services are designed to help clients understand compliance requirements, prepare documents, submit information accurately, and coordinate the next steps in legal, tax, registration, and statutory workflows.",
      "Services are delivered digitally or remotely unless otherwise specified. Service timelines depend on the selected service, client document submission, government portal availability, statutory processing, third-party systems, and authority-side approvals.",
    ],
  },
  {
    title: "Services We Provide",
    items: [
      "GST Registration and GST Filing support",
      "Income Tax Return Filing assistance",
      "Company Registration consultancy and documentation support",
      "ROC/MCA Compliance support",
      "Trademark search, documentation, and filing assistance",
      "MSME/Udyam Registration assistance",
      "Tax Consultancy for individuals and businesses",
      "Legal Documentation support",
      "Business Compliance Services",
      "Digital Professional Consultancy",
    ],
  },
  {
    title: "Delivery and Timeline Terms",
    body: [
      "Service delivery timelines depend on the type of service selected, document readiness, client response time, payment confirmation, government portal availability, statutory authority processing, and third-party systems.",
      "Delays may occur due to incomplete documents, incorrect client information, delayed approvals, government portal downtime, statutory processing time, payment confirmation delays, or third-party system issues.",
      "We provide consultancy and documentation assistance services and do not guarantee government approval timelines.",
    ],
  },
  {
    title: "Professional Scope",
    body: [
      "Our role is to provide consultancy, documentation assistance, filing support, and service coordination based on the selected package or written scope. Where a service requires government, statutory, registry, payment partner, or third-party approval, the final decision and processing speed remain outside our direct control.",
      "Clients are responsible for providing accurate information, complete documents, lawful authorization, and timely approvals required for the selected service.",
    ],
  },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "Legal, Tax, GST and Compliance Services",
      description: metadata.description,
      inLanguage: "en-IN",
    },
    {
      "@type": "Service",
      name: "Legal, Tax, GST, ROC, Trademark and Business Compliance Services",
      provider: { "@id": `${SITE_URL}#organization`, name: COMPANY.name },
      serviceType: [
        "GST Registration",
        "Income Tax Return Filing",
        "Company Registration",
        "ROC/MCA Compliance",
        "Trademark Services",
        "MSME Registration",
        "Tax Consultancy",
        "Legal Documentation",
        "Business Compliance Services",
      ],
      areaServed: { "@type": "Country", name: "India" },
      url: pageUrl,
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: COMPANY.name,
      url: SITE_URL,
      email: BUSINESS_CONTACT.supportEmail,
      telephone: `+91${BUSINESS_CONTACT.primaryPhones[0]}`,
    },
  ],
};

export default function ServiceDescriptionPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ComplianceContentPage
        eyebrow="Service description"
        title="Professional Legal, Tax and Compliance Services"
        description="Digital-first consultancy and documentation assistance for GST, income tax, company registration, ROC/MCA compliance, trademark, MSME, and business compliance needs."
        highlights={[
          "Consultancy and documentation assistance services",
          "Digital and remote delivery unless otherwise specified",
          "Government approval timelines are not guaranteed",
        ]}
        sections={sections}
        ctaTitle="Need help choosing the right service?"
        ctaBody="Share your requirement with Wadhwani Associates and our support team will guide you toward the relevant service workflow."
        ctaPrimaryLabel="Request a callback"
        ctaSecondaryLabel="Contact support"
        ctaSecondaryHref="/contact"
        footerNote="All services are professional consultancy, documentation assistance, filing support, or digital service coordination services. Wadhwani Associates does not sell physical goods through this website."
      />
    </>
  );
}
