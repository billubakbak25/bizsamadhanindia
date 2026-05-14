"use client";

import { startTransition, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiJson, createQueryString, unwrapData } from "@/lib/api";
import { SERVICE_LIBRARY } from "@/lib/constants";

type Slot = {
  id?: string;
  slot: string;
  label: string;
  available: boolean;
};

type SlotPayload = {
  slots: Slot[];
};

const fallbackSlots: Slot[] = [
  { id: "fallback-0930", slot: "09:30", label: "09:30 AM", available: true },
  { id: "fallback-1100", slot: "11:00", label: "11:00 AM", available: true },
  { id: "fallback-1330", slot: "13:30", label: "01:30 PM", available: true },
  { id: "fallback-1500", slot: "15:00", label: "03:00 PM", available: true },
];

function tomorrowDate() {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  return next.toISOString().slice(0, 10);
}

function resolveServiceTitle(value: string | null) {
  const normalizedValue = String(value || "").trim().toLowerCase();

  if (!normalizedValue) {
    return null;
  }

  return (
    SERVICE_LIBRARY.find((service) => {
      return service.title.toLowerCase() === normalizedValue || service.slug.toLowerCase() === normalizedValue;
    })?.title || null
  );
}

export function ConsultationBooking() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    consultationType: "CA",
    service: SERVICE_LIBRARY[0]?.title || "GST Registration",
    preferredDate: tomorrowDate(),
    mode: "call",
    preferredSlot: "",
    notes: "",
  });
  const [slots, setSlots] = useState<Slot[]>(fallbackSlots);
  const [status, setStatus] = useState("Choose a service and we will load live availability.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    const suggestedService = resolveServiceTitle(searchParams.get("service"));

    if (!suggestedService) {
      return;
    }

    setForm((current) => {
      if (current.service === suggestedService) {
        return current;
      }

      return {
        ...current,
        service: suggestedService,
      };
    });
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const query = createQueryString({
      consultationType: form.consultationType,
      service: form.service,
      mode: form.mode,
      date: form.preferredDate,
    });

    setStatus("Loading live slots...");

    apiJson<{ success?: boolean; data?: SlotPayload }>(`/api/consultations/slots?${query}`, { cache: "no-store" }, { label: "consultation.slots" })
      .then((payload) => {
        if (!active) {
          return;
        }

        const nextSlots = unwrapData(payload)?.slots?.length ? unwrapData(payload).slots : fallbackSlots;
        setSlots(nextSlots);
        setForm((current) => ({ ...current, preferredSlot: nextSlots[0]?.slot || current.preferredSlot }));
        setStatus("Live slots loaded from Railway.");
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        console.error("[Wadhwani Associates Consultation] slot load failed", error);
        setSlots(fallbackSlots);
        setForm((current) => ({ ...current, preferredSlot: fallbackSlots[0]?.slot || current.preferredSlot }));
        setStatus("Live slots are unavailable, so a curated fallback schedule is shown.");
      });

    return () => {
      active = false;
    };
  }, [form.consultationType, form.service, form.mode, form.preferredDate]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("Submitting your consultation request...");

    startTransition(async () => {
      try {
        const payload = await apiJson<{ message?: string }>(
          "/api/consultations",
          {
            method: "POST",
            json: {
              name: form.fullName,
              phone: form.phone,
              email: form.email,
              consultationType: form.consultationType,
              service: form.service,
              preferredDate: form.preferredDate,
              preferredSlot: form.preferredSlot,
              mode: form.mode,
              notes: form.notes,
              status: "requested",
              source: "website",
            },
          },
          { label: "consultation.create" },
        );

        setForm({
          fullName: "",
          phone: "",
          email: "",
          consultationType: "CA",
          service: SERVICE_LIBRARY[0]?.title || "GST Registration",
          preferredDate: tomorrowDate(),
          mode: "call",
          preferredSlot: fallbackSlots[0]?.slot || "09:30",
          notes: "",
        });
        setStatus(payload.message || "Consultation request submitted successfully.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to submit your consultation request.");
      } finally {
        setIsSubmitting(false);
      }
    });
  }

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Book a consultation</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">Choose a service, pick a slot, and send the request directly to the Railway API.</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">Live API connected</div>
      </div>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Full name</span>
            <input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Phone</span>
            <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} inputMode="tel" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Email</span>
            <input value={form.email} onChange={(event) => updateField("email", event.target.value)} type="email" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Consultation type</span>
            <select value={form.consultationType} onChange={(event) => updateField("consultationType", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]">
              <option value="CA">CA</option>
              <option value="Legal">Legal</option>
              <option value="Compliance">Compliance</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
            <span>Service</span>
            <select value={form.service} onChange={(event) => updateField("service", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]">
              {SERVICE_LIBRARY.map((service) => (
                <option key={service.slug} value={service.title}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Mode</span>
            <select value={form.mode} onChange={(event) => updateField("mode", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]">
              <option value="call">Call</option>
              <option value="video">Video</option>
            </select>
          </label>
        </div>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Preferred date</span>
          <input type="date" value={form.preferredDate} onChange={(event) => updateField("preferredDate", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
        </label>
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Available slots</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {slots.map((slot) => {
              const isSelected = form.preferredSlot === slot.slot;
              return (
                <button
                  key={slot.id || slot.slot}
                  type="button"
                  onClick={() => updateField("preferredSlot", slot.slot)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${isSelected ? "border-[var(--brand)] bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Notes</span>
          <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">{status}</p>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Confirm consultation"}</Button>
        </div>
      </form>
    </Card>
  );
}