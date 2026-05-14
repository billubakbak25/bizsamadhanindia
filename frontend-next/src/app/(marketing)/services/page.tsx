import type { Metadata } from "next";
import { Services } from "@/components/sections/Services";
import { Card } from "@/components/ui/Card";
import { ApiHealthChip } from "@/components/ui/ApiHealthChip";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore Wadhwani Associates' legal, tax, compliance, and finance service catalog.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <Card className="p-6 sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Service architecture</p>
                <h1 className="mt-3 text-4xl font-semibold text-slate-950">A clean SaaS service catalog with no static HTML baggage.</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Every card below resolves to a real Next.js route, with reusable content modules and a shared lead-capture flow.</p>
              </div>
              <ApiHealthChip label="Railway API" />
            </div>
          </Card>
        </div>
      </section>
      <Services />
    </>
  );
}
