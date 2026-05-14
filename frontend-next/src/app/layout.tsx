import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { BUSINESS_CONTACT, COMPANY, SITE_URL } from "@/lib/constants";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${COMPANY.name} | Legal, Tax, and Compliance SaaS`,
    template: `%s | ${COMPANY.name}`,
  },
  description: COMPANY.description,
  applicationName: COMPANY.name,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: COMPANY.name,
    description: COMPANY.description,
    url: SITE_URL,
    siteName: COMPANY.name,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: COMPANY.name,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: COMPANY.name,
    description: COMPANY.description,
    images: ["/og-image.svg"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
      "@id": `${SITE_URL}#organization`,
      name: COMPANY.name,
      alternateName: COMPANY.brandName,
      url: SITE_URL,
      logo: `${SITE_URL}/og-image.svg`,
      image: `${SITE_URL}/og-image.svg`,
      email: COMPANY.email,
      telephone: `+91${BUSINESS_CONTACT.primaryPhones[0]}`,
      priceRange: "Rs",
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
        {
          "@type": "ContactPoint",
          name: BUSINESS_CONTACT.supportPerson,
          contactType: "billing and grievance support",
          telephone: `+91${BUSINESS_CONTACT.primaryPhones[1]}`,
          email: BUSINESS_CONTACT.supportEmail,
          areaServed: "IN",
          availableLanguage: ["English", "Hindi"],
        },
      ],
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}#support-person`,
      name: BUSINESS_CONTACT.supportPerson,
      jobTitle: "Official Support Representative",
      worksFor: {
        "@id": `${SITE_URL}#organization`,
      },
      email: BUSINESS_CONTACT.supportEmail,
      telephone: `+91${BUSINESS_CONTACT.primaryPhones[0]}`,
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="bg-[var(--bg)] text-slate-950 antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        {children}
      </body>
    </html>
  );
}
