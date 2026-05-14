import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BUSINESS_CONTACT, COMPANY } from "@/lib/constants";

export type ComplianceContentSection = {
  title: string;
  body?: string[];
  items?: string[];
};

type ComplianceContentPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  sections: ComplianceContentSection[];
  ctaTitle: string;
  ctaBody: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  footerNote: string;
  children?: ReactNode;
};

export function ComplianceContentPage({
  eyebrow,
  title,
  description,
  highlights,
  sections,
  ctaTitle,
  ctaBody,
  ctaPrimaryLabel = "Contact support",
  ctaPrimaryHref = "/contact",
  ctaSecondaryLabel = "Explore services",
  ctaSecondaryHref = "/services",
  footerNote,
  children,
}: ComplianceContentPageProps) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-5">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="transition hover:text-[var(--brand)]">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900">{title}</span>
          </nav>

          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            {eyebrow}
          </span>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="text-base leading-8 text-slate-600 sm:text-lg">{description}</p>
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-medium leading-6 text-slate-700">
                {highlight}
              </div>
            ))}
          </div>
        </Card>

        {children}

        <div className="grid gap-5">
          {sections.map((section) => (
            <Card key={section.title} className="p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{section.title}</h2>
              {section.body?.length ? (
                <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
              {section.items?.length ? (
                <ul className="mt-5 grid gap-3 text-sm leading-7 text-slate-700 sm:grid-cols-2 sm:text-base">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--brand)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--brand)] to-teal-600 p-6 text-white sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-semibold tracking-tight">{ctaTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-emerald-50 sm:text-base">{ctaBody}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <Link href={ctaPrimaryHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--brand)] transition hover:bg-emerald-50">
                  {ctaPrimaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={ctaSecondaryHref} className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  {ctaSecondaryLabel}
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Contact information</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{COMPANY.name}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Official Support Representative: {BUSINESS_CONTACT.supportPerson}
              </p>
              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <a href={`tel:+91${BUSINESS_CONTACT.primaryPhones[0]}`} className="inline-flex items-center gap-2 transition hover:text-[var(--brand)]">
                  <Phone className="h-4 w-4 text-[var(--brand)]" />
                  {BUSINESS_CONTACT.primaryPhoneDisplay[0]}
                </a>
                <a href={`tel:+91${BUSINESS_CONTACT.primaryPhones[1]}`} className="inline-flex items-center gap-2 transition hover:text-[var(--brand)]">
                  <Phone className="h-4 w-4 text-[var(--brand)]" />
                  {BUSINESS_CONTACT.primaryPhoneDisplay[1]}
                </a>
                <a href={`mailto:${BUSINESS_CONTACT.supportEmail}`} className="inline-flex items-center gap-2 transition hover:text-[var(--brand)]">
                  <Mail className="h-4 w-4 text-[var(--brand)]" />
                  {BUSINESS_CONTACT.supportEmail}
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Office address</p>
              <address className="mt-3 flex gap-3 not-italic text-sm leading-7 text-slate-700">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[var(--brand)]" />
                <span>{BUSINESS_CONTACT.officeAddressOneLine}</span>
              </address>
              <p className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-7 text-slate-600">{footerNote}</p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
