"use client";

import { startTransition, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiJson, unwrapData } from "@/lib/api";
import { useApi } from "@/hooks/useApi";

type PackageItem = {
  key: string;
  name: string;
  badge?: string;
  description: string;
  amountFormatted?: string;
  includedServices?: string[];
};

export function PartnerApplication() {
  const { data } = useApi(
    async () => {
      const payload = await apiJson<{ success?: boolean; data?: { items: PackageItem[] } }>("/api/packages", { cache: "no-store" }, { label: "partner.packages" });
      return unwrapData(payload)?.items || [];
    },
    [],
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    city: "",
    focusArea: "compliance",
    message: "",
  });
  const [status, setStatus] = useState("Apply to build a referral-led growth motion with Wadhwani Associates.");
  const [isPending, setIsPending] = useState(false);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setStatus("Submitting partner application...");

    startTransition(async () => {
      try {
        const payload = await apiJson<{ message?: string }>(
          "/api/partners/apply",
          {
            method: "POST",
            json: {
              ...form,
              source: "website",
            },
          },
          { label: "partner.apply" },
        );

        setForm({ name: "", email: "", phone: "", companyName: "", city: "", focusArea: "compliance", message: "" });
        setStatus(payload.message || "Partner interest captured successfully.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to submit partner application.");
      } finally {
        setIsPending(false);
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-6 sm:p-7">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-950">Apply as a growth partner</h2>
          <p className="text-sm leading-7 text-slate-600">Join the referral and bundled-services motion with a cleaner operating workflow and clearer package positioning.</p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Name</span>
              <input value={form.name} onChange={(event) => updateField("name", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Phone</span>
              <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Email</span>
              <input value={form.email} onChange={(event) => updateField("email", event.target.value)} type="email" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Company</span>
              <input value={form.companyName} onChange={(event) => updateField("companyName", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>City</span>
              <input value={form.city} onChange={(event) => updateField("city", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Focus area</span>
              <select value={form.focusArea} onChange={(event) => updateField("focusArea", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]">
                <option value="compliance">Compliance</option>
                <option value="tax">Tax</option>
                <option value="startup-advisory">Startup advisory</option>
                <option value="client-referrals">Client referrals</option>
              </select>
            </label>
          </div>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Message</span>
            <textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">{status}</p>
            <Button type="submit" disabled={isPending}>{isPending ? "Applying..." : "Submit application"}</Button>
          </div>
        </form>
      </Card>
      <Card className="p-6 sm:p-7">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Live package catalog</p>
          <h3 className="text-2xl font-semibold text-slate-950">Bundled offers from the backend</h3>
          <p className="text-sm leading-7 text-slate-600">These package cards are loaded from the Railway marketplace API so the partner page stays dynamic.</p>
        </div>
        <div className="mt-6 space-y-4">
          {(data || []).map((item) => (
            <div key={item.key} className="rounded-3xl border border-slate-200 bg-white px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-lg font-semibold text-slate-950">{item.name}</h4>
                {item.badge ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{item.badge}</span> : null}
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              <p className="mt-4 text-sm font-semibold text-slate-900">{item.amountFormatted || "Consultation-led pricing"}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

