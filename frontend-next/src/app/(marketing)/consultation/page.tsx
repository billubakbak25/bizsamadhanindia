import { Suspense } from "react";
import type { Metadata } from "next";
import { ConsultationBooking } from "@/components/forms/ConsultationBooking";
import { ApiHealthChip } from "@/components/ui/ApiHealthChip";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Consultation",
  description: "Book a legal, tax, or compliance consultation through BizSamadhan India's live consultation flow.",
};

export default function ConsultationPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="p-6 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Consultation funnel</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950">Book a live consultation without leaving the product.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Slots are requested from the Railway backend on page load, so the experience is easy to verify in browser Network and Console tabs.</p>
            </div>
            <ApiHealthChip label="Railway API" />
          </div>
        </Card>
        <Suspense fallback={<Card className="p-6 sm:p-7 text-sm text-slate-600">Loading consultation flow...</Card>}>
          <ConsultationBooking />
        </Suspense>
      </div>
    </section>
  );
}