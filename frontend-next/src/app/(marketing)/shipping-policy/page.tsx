import type { Metadata } from "next";
import { ComplianceContentPage, type ComplianceContentSection } from "@/components/sections/ComplianceContentPage";
import { BUSINESS_CONTACT, COMPANY, SITE_URL } from "@/lib/constants";

const pageUrl = new URL("/shipping-policy", SITE_URL).toString();

export const metadata: Metadata = {
  title: "Shipping Policy | Wadhwani Associates",
  description:
    "Read the shipping policy of Wadhwani Associates. We provide digital and professional services only and do not ship physical products.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Shipping Policy | Wadhwani Associates",
    description:
      "Shipping policy for digital legal, tax, GST, ROC, trademark, MSME, and compliance consultancy services by Wadhwani Associates.",
    url: pageUrl,
    siteName: COMPANY.name,
    type: "article",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shipping Policy | Wadhwani Associates",
    description: "Wadhwani Associates provides digital and professional services only. No physical products are shipped.",
  },
};

const sections: ComplianceContentSection[] = [
  {
    title: "No Physical Product Delivery",
    body: [
      "Wadhwani Associates provides legal, tax, GST, ROC/MCA, trademark, MSME, business compliance, documentation assistance, and digital professional consultancy services. We do not sell or ship physical products through our website.",
      "Shipping policy is not applicable to our business model as we do not deal in physical product delivery.",
      "No physical goods, packages, parcels, or merchandise are sold or shipped by Wadhwani Associates. Courier shipping, shipping charges, delivery tracking for physical goods, and product dispatch timelines do not apply.",
    ],
  },
  {
    title: "Digital Service Delivery",
    body: [
      "Service-related communication, documents, acknowledgements, status updates, invoices, and completion information may be delivered electronically through approved digital channels.",
    ],
    items: ["Email", "WhatsApp", "Client portal", "Phone communication", "Website forms", "Government portal updates", "Digital document links or attachments"],
  },
  {
    title: "Service Delivery Timelines",
    body: [
      "Service delivery timelines depend on the type of service selected, document readiness, client response time, payment confirmation, government portal availability, statutory authority processing, and third-party systems.",
      "Where government approval, portal processing, registration issuance, certificate generation, or statutory acceptance is required, timelines are controlled by the relevant authority or platform.",
    ],
  },
  {
    title: "Client Responsibility",
    body: [
      "Clients must provide accurate information, correct documents, valid contact details, and timely approvals. Delays may occur if documents are incomplete, details are incorrect, payment is not confirmed, or government/statutory portals are unavailable.",
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
      name: "Shipping Policy | Wadhwani Associates",
      description: metadata.description,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: COMPANY.name,
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
    },
  ],
};

export default function ShippingPolicyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ComplianceContentPage
        eyebrow="Shipping policy"
        title="Shipping Policy"
        description="This policy explains how service deliverables are shared by Wadhwani Associates for digital and professional consultancy services."
        highlights={[
          "No physical goods are sold or shipped",
          "Service deliverables are shared through digital channels",
          "Shipping charges and courier timelines do not apply",
        ]}
        sections={sections}
        ctaTitle="Need service delivery support?"
        ctaBody="Contact Wadhwani Associates for document access, invoice confirmation, service handoff, or delivery-status clarification."
        ctaPrimaryLabel="Contact support"
        ctaSecondaryLabel="View service delivery policy"
        ctaSecondaryHref="/service-delivery-policy"
        footerNote="Wadhwani Associates provides digital and professional services only. No physical products are shipped."
      />
    </>
  );
}
