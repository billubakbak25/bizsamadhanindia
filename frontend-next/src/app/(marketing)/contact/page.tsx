import type { Metadata } from "next";
import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import { Card } from "@/components/ui/Card";
import { ApiHealthChip } from "@/components/ui/ApiHealthChip";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact BizSamadhan India for legal, tax, compliance, and finance execution support.",
};

export default function ContactPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Direct contact</p>
            <ApiHealthChip label="Railway API" />
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-slate-950">Talk to the team that is actually shipping the work.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">This page submits straight into the live lead pipeline and keeps the frontend aligned with the backend's validation rules.</p>
          <div className="mt-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-950">Email:</span> {COMPANY.email}</p>
            <p><span className="font-semibold text-slate-950">Phone:</span> {COMPANY.phone}</p>
            <p><span className="font-semibold text-slate-950">Base:</span> {COMPANY.city}</p>
          </div>
        </Card>
        <LeadCaptureForm title="Send your requirement" description="Use the production lead endpoint to start a conversation with the right advisor." />
      </div>
    </section>
  );
}
