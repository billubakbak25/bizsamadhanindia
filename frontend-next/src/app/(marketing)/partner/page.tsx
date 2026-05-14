import type { Metadata } from "next";
import { PartnerApplication } from "@/components/forms/PartnerApplication";
import { ApiHealthChip } from "@/components/ui/ApiHealthChip";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Partner Program",
  description: "Apply to the Wadhwani Associates partner program and explore bundled packages from the live backend catalog.",
};

export default function PartnerPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="p-6 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Partner distribution</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950">Build a referral and bundled-services channel with the platform.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">The package catalog on this page is loaded from the Railway marketplace API, and the application form submits directly into the partner workflow.</p>
            </div>
            <ApiHealthChip label="Railway API" />
          </div>
        </Card>
        <PartnerApplication />
      </div>
    </section>
  );
}
