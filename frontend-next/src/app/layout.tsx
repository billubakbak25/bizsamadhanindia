import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { COMPANY, SITE_URL } from "@/lib/constants";

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

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="bg-[var(--bg)] text-slate-950 antialiased">{children}</body>
    </html>
  );
}

