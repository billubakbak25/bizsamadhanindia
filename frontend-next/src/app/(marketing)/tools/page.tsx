import type { Metadata } from "next";
import { ToolDefaultsExplorer } from "@/components/forms/ToolDefaultsExplorer";
import { ApiHealthChip } from "@/components/ui/ApiHealthChip";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Tools",
  description: "Explore live tool presets for GST and compliance planning from the Wadhwani Associates backend.",
};

export default function ToolsPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="p-6 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Product tools</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950">Dynamic calculators and planning defaults, now served through Next.js.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">No static tools HTML remains. These presets are requested from the live backend so the product can evolve without frontend rewrites.</p>
            </div>
            <ApiHealthChip label="Railway API" />
          </div>
        </Card>
        <ToolDefaultsExplorer />
      </div>
    </section>
  );
}
