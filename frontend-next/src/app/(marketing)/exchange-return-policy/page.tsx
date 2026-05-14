import type { Metadata } from "next";
import { ComplianceContentPage, type ComplianceContentSection } from "@/components/sections/ComplianceContentPage";
import { BUSINESS_CONTACT, COMPANY, SITE_URL } from "@/lib/constants";

const pageUrl = new URL("/exchange-return-policy", SITE_URL).toString();

export const metadata: Metadata = {
  title: "Exchange and Return Policy | Wadhwani Associates",
  description:
    "Read the exchange and return policy of Wadhwani Associates for digital legal, tax, GST, ROC, trademark, and compliance consultancy services.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Exchange and Return Policy | Wadhwani Associates",
    description:
      "Exchange and return policy for digital and professional consultancy services provided by Wadhwani Associates.",
    url: pageUrl,
    siteName: COMPANY.name,
    type: "article",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exchange and Return Policy | Wadhwani Associates",
    description:
      "Exchange and return terms for digital legal, tax, GST, ROC, trademark, and business compliance services.",
  },
};

const sections: ComplianceContentSection[] = [
  {
    title: "No Physical Product Exchange or Return",
    body: [
      "Wadhwani Associates provides digital and professional consultancy, documentation assistance, tax, legal, GST, ROC/MCA, trademark, MSME, and business compliance services. We do not sell physical products through this website.",
      "No physical products are sold, shipped, exchanged, or returned by Wadhwani Associates. Product exchange, replacement shipping, product return pickup, and physical goods return processes do not apply to our business model.",
    ],
  },
  {
    title: "Digital and Professional Service Nature",
    body: [
      "Our services may involve consultation, document review, filing preparation, application support, compliance coordination, drafting, payment verification, client communication, and workflow execution. Once a service has been initiated, assigned, reviewed, prepared, submitted, or delivered, exchange or return may not be possible.",
      "Exchange or return of services already delivered or initiated may not be possible.",
    ],
  },
  {
    title: "Revision or Support",
    body: [
      "Where applicable, reasonable clarification, correction, or revision support may be provided depending on the selected service scope, stage of service delivery, document status, filing or submission status, client communication records, government or third-party portal status, and internal review outcome.",
      "Revision support does not mean that a completed, initiated, submitted, or authority-dependent service can be exchanged or returned.",
    ],
  },
  {
    title: "Refund and Cancellation",
    body: [
      "Refunds and cancellations are governed separately under the Cancellation Policy and Refund Policy published on this website. Clients should review those policies before making payment or initiating a service request.",
    ],
  },
  {
    title: "Government and Third-Party Dependencies",
    body: [
      "For services involving government portals, statutory authorities, payment gateways, registries, tax systems, or third-party platforms, Wadhwani Associates cannot guarantee approval, acceptance, issuance, processing speed, or final outcome.",
      "We provide consultancy and documentation assistance services and do not guarantee government approval timelines.",
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
      name: "Exchange and Return Policy | Wadhwani Associates",
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

export default function ExchangeReturnPolicyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ComplianceContentPage
        eyebrow="Exchange and return policy"
        title="Exchange and Return Policy"
        description="This policy explains how exchange or return requests are handled for digital and professional services provided by Wadhwani Associates."
        highlights={[
          "No physical products are sold",
          "Service exchange is generally not applicable",
          "Refunds and cancellations are governed separately",
        ]}
        sections={sections}
        ctaTitle="Need clarification on a service request?"
        ctaBody="Contact Wadhwani Associates for service-scope, revision, billing, cancellation, or refund-related clarification."
        ctaPrimaryLabel="Contact support"
        ctaSecondaryLabel="View refund policy"
        ctaSecondaryHref="/refund-policy"
        footerNote="Exchange and return terms apply only to the extent relevant for digital and professional services. Wadhwani Associates does not sell physical products."
      />
    </>
  );
}
