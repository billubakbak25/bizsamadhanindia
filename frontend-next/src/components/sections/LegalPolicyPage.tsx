import Link from "next/link";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/Button";
import { COMPANY, type LegalPolicyContent } from "@/lib/constants";

export function LegalPolicyPage({ page }: { page: LegalPolicyContent }) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-4">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-[var(--brand)]">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900">{page.title}</span>
          </nav>

          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            {page.eyebrow}
          </span>

          <div className="space-y-3">
            <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">{page.title}</h1>
            <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">{page.hero}</p>
            <p className="text-sm text-slate-500">Last updated: {page.lastUpdated}</p>
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {page.highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-medium text-slate-700">
                {highlight}
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          {page.sections.map((section) => (
            <Card key={section.title} className="p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-slate-950">{section.title}</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-950">Need clarification?</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Reach the Wadhwani Associates support team for policy questions, billing clarifications, or service-specific assistance.
              </p>
              <div className="flex flex-col gap-2 text-sm text-slate-700 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[var(--brand)]" />
                  {COMPANY.email}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[var(--brand)]" />
                  {COMPANY.phone}
                </span>
              </div>
            </div>

            <Link href="/contact" className={buttonClassName({ size: "lg", className: "justify-center" })}>
              Contact support
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
