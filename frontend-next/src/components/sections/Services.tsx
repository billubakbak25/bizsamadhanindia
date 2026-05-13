import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SERVICE_LIBRARY } from "@/lib/constants";
import { fetchPricingCatalog, formatStartingPrice } from "@/lib/pricing";

export async function Services() {
  const pricingCatalog = await fetchPricingCatalog().catch(() => []);
  const pricingByCode = new Map(pricingCatalog.map((item) => [item.code, item]));

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--brand)]">Service catalog</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Signature legal, tax, and compliance journeys built as productized services.
          </h2>
          <p className="text-base leading-8 text-slate-600">
            The catalog is structured for scale: service pages convert, consultation captures intent, and operational dashboards keep delivery visible.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {SERVICE_LIBRARY.map((service) => {
            const pricing = pricingByCode.get(service.code);
            return (
              <Card key={service.slug} className="flex h-full flex-col justify-between p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                      {service.category}
                    </span>
                    <span className="text-sm font-medium text-slate-500">{formatStartingPrice(pricing?.finalPrice)}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-950">{service.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{service.description}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {service.outcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={`/${service.slug}`} className="mt-8 inline-flex text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-deep)]">
                  View service page
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}