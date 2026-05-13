"use client";

import { startTransition, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiJson, unwrapData } from "@/lib/api";
import { SERVICE_LIBRARY, type ServiceCard } from "@/lib/constants";
import { loadRazorpayCheckout, type RazorpayCheckoutOptions, type RazorpayPaymentSuccessPayload } from "@/lib/razorpay";

type LeadResponse = {
  message?: string;
  id?: number;
};

type LeadEnvelope = {
  success?: boolean;
  data?: LeadResponse;
};

type PaymentOrderResponse = {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  service: string;
  service_name?: string;
  price?: number;
  customer_name: string;
  customer_phone: string;
  checkout?: {
    key?: string;
    amount?: number;
    currency?: string;
    name?: string;
    description?: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    notes?: Record<string, string>;
  };
};

type PaymentVerificationResponse = {
  success?: boolean;
  message?: string;
  confirmation_url?: string;
  order_id?: string;
};

type LeadCaptureFormProps = {
  defaultService?: string;
  defaultCity?: string;
  title?: string;
  description?: string;
  allowPayment?: boolean;
  servicePrice?: number | null;
  lockService?: boolean;
  leadEndpoint?: string;
  trackingContext?: string;
  minimal?: boolean;
  placement?: string;
};

function normalizeMessage(message: string) {
  const trimmed = message.trim();
  return trimmed.length >= 5 ? trimmed : "Payment initiated from the website.";
}

function normalizeServiceLookup(value: string | undefined) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function resolveServiceOption(value?: string): ServiceCard {
  const normalized = normalizeServiceLookup(value);
  return (
    SERVICE_LIBRARY.find((service) => {
      return [service.code, service.slug, service.title].some((candidate) => normalizeServiceLookup(candidate) === normalized);
    }) || SERVICE_LIBRARY[0]
  );
}

function formatPriceLabel(price: number | null | undefined) {
  if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
    return "Buy now";
  }

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price));

  return `Buy now - ${formatted}`;
}

export function LeadCaptureForm({
  defaultService = SERVICE_LIBRARY[0]?.title || "GST Registration",
  defaultCity = "",
  title = "Tell us what you need",
  description = "We will route your requirement to the right legal, tax, or compliance specialist.",
  allowPayment = false,
  servicePrice = null,
  lockService = false,
  leadEndpoint = "/api/crm/leads",
  trackingContext = "website",
  minimal = false,
  placement = "lead_form",
}: LeadCaptureFormProps) {
  const router = useRouter();
  const initialService = resolveServiceOption(defaultService);
  const [form, setForm] = useState(() => ({
    name: "",
    phone: "",
    email: "",
    serviceCode: initialService.code,
    city: defaultCity,
    message: "",
    website: "",
  }));
  const [status, setStatus] = useState("Share your details and we will call you back.");
  const [isPending, setIsPending] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const selectedService = resolveServiceOption(form.serviceCode);

  useEffect(() => {
    const nextService = resolveServiceOption(defaultService);
    setForm((current) => {
      if (current.serviceCode === nextService.code && current.city === defaultCity) {
        return current;
      }

      return {
        ...current,
        serviceCode: nextService.code,
        city: defaultCity,
      };
    });
  }, [defaultCity, defaultService]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetNonServiceFields() {
    setForm((current) => ({ ...current, name: "", phone: "", email: "", message: "", website: "" }));
  }

  function buildDefaultMessage() {
    return `${selectedService.title} enquiry from ${form.city || "SEO page"}.`;
  }

  function buildSubmitMessage() {
    return normalizeMessage(form.message || buildDefaultMessage());
  }

  function trackFunnelEvent(eventName: string, payload: Record<string, unknown> = {}) {
    const eventPayload = {
      event: eventName,
      placement,
      serviceCode: selectedService.code,
      serviceName: selectedService.title,
      city: form.city,
      context: trackingContext,
      ...payload,
    };

    console.log("FUNNEL_EVENT:", eventPayload);

    if (typeof window !== "undefined") {
      const targetWindow = window as Window & { dataLayer?: Record<string, unknown>[] };
      targetWindow.dataLayer?.push(eventPayload);
    }
  }

  function validatePaymentInput() {
    if (!form.name.trim() || form.name.trim().length < 2) {
      throw new Error("Please enter a valid name before starting payment.");
    }

    if (!form.phone.trim()) {
      throw new Error("Please enter a valid phone number before starting payment.");
    }

    if (!selectedService?.code) {
      throw new Error("Please select the service you want to pay for.");
    }
  }

  function resolveConfirmationUrl(confirmationUrl: string | undefined, fallbackOrderId: string) {
    if (confirmationUrl && /^https?:\/\//i.test(confirmationUrl)) {
      window.location.assign(confirmationUrl);
      return;
    }

    router.push(confirmationUrl || `/payment-success?orderId=${encodeURIComponent(fallbackOrderId)}`);
  }

  async function handlePaymentSuccess(order: PaymentOrderResponse, payload: RazorpayPaymentSuccessPayload) {
    setStatus("Verifying your payment...");

    const verification = await apiJson<PaymentVerificationResponse>(
      "/api/verify-payment",
      {
        method: "POST",
        json: payload,
      },
      { label: "payment.verify" },
    );

    trackFunnelEvent("payment_verified", { orderId: verification.order_id || order.order_id });
    setStatus(verification.message || "Payment verified successfully.");
    resolveConfirmationUrl(verification.confirmation_url, verification.order_id || order.order_id);
  }

  async function handlePayNow() {
    setIsPaying(true);
    setStatus("Preparing secure checkout...");

    try {
      validatePaymentInput();

      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        serviceCode: selectedService.code,
        serviceName: selectedService.title,
        category: selectedService.category,
        city: form.city,
        website: form.website,
        message: buildSubmitMessage(),
        source: trackingContext,
      };

      trackFunnelEvent("payment_click", {
        service: payload.serviceName,
        serviceCode: payload.serviceCode,
        category: payload.category,
        city: payload.city,
      });

      const scriptReady = await loadRazorpayCheckout();
      if (!scriptReady || typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Razorpay checkout could not be loaded. Please try again.");
      }

      const order = await apiJson<PaymentOrderResponse>(
        "/api/create-order",
        {
          method: "POST",
          json: payload,
        },
        { label: "payment.createOrder" },
      );

      if (!order.key_id) {
        throw new Error("Razorpay key is missing from the checkout response.");
      }

      const options: RazorpayCheckoutOptions = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: order.checkout?.name || "BizSamadhan India",
        description: order.checkout?.description || `${selectedService.title} service package`,
        order_id: order.order_id,
        prefill: {
          name: form.name,
          email: form.email || undefined,
          contact: form.phone,
        },
        notes: {
          service: selectedService.code,
          serviceName: selectedService.title,
          city: form.city,
          ...(order.checkout?.notes || {}),
        },
        theme: { color: "#0f766e" },
        modal: {
          ondismiss: () => {
            setStatus("Checkout was closed before payment completion.");
            setIsPaying(false);
          },
        },
        handler: async (paymentPayload) => {
          try {
            await handlePaymentSuccess(order, paymentPayload);
          } catch (error) {
            trackFunnelEvent("payment_verification_error", { message: error instanceof Error ? error.message : "Unknown error" });
            setStatus(error instanceof Error ? error.message : "Payment verification failed.");
            setIsPaying(false);
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", (response) => {
        const description = response && response.error && response.error.description ? response.error.description : "Payment failed. Please try again.";
        trackFunnelEvent("payment_failed", { message: description });
        setStatus(description);
        setIsPaying(false);
      });
      paymentObject.open();
    } catch (error) {
      trackFunnelEvent("payment_error", { message: error instanceof Error ? error.message : "Unknown error" });
      setStatus(error instanceof Error ? error.message : "Unable to start payment right now.");
      setIsPaying(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setStatus("Submitting your request...");
    trackFunnelEvent("form_submit_attempt");

    startTransition(async () => {
      try {
        const payload = await apiJson<LeadEnvelope>(
          leadEndpoint,
          {
            method: "POST",
            json: {
              name: form.name,
              phone: form.phone,
              email: form.email,
              serviceCode: selectedService.code,
              serviceName: selectedService.title,
              category: selectedService.category,
              city: form.city,
              message: buildSubmitMessage(),
              website: form.website,
              source: trackingContext,
            },
          },
          { label: "lead.capture" },
        );
        trackFunnelEvent("form_submit", { status: "success" });
        const result = unwrapData<LeadResponse>(payload);

        resetNonServiceFields();
        setStatus(result.message || "Lead submitted successfully.");
      } catch (error) {
        trackFunnelEvent("form_submit", { status: "error", message: error instanceof Error ? error.message : "Unknown error" });
        setStatus(error instanceof Error ? error.message : "Unable to submit your request.");
      } finally {
        setIsPending(false);
      }
    });
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>
      {minimal ? (
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
          <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-800">{selectedService.title}</span>
          {form.city ? <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">{form.city}</span> : null}
          <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-800">Free consultation</span>
        </div>
      ) : null}
      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Name</span>
            <input value={form.name} onChange={(event) => updateField("name", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Phone</span>
            <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" inputMode="tel" required />
          </label>
        </div>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Email <span className="font-normal text-slate-400">(optional)</span></span>
          <input value={form.email} onChange={(event) => updateField("email", event.target.value)} type="email" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" />
        </label>
        {!minimal ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Service</span>
              {lockService ? (
                <input value={selectedService.title} readOnly className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none" />
              ) : (
                <select value={form.serviceCode} onChange={(event) => updateField("serviceCode", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]">
                  {SERVICE_LIBRARY.map((service) => (
                    <option key={service.slug} value={service.code}>
                      {service.title}
                    </option>
                  ))}
                </select>
              )}
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>City</span>
              <input value={form.city} onChange={(event) => updateField("city", event.target.value)} readOnly={Boolean(defaultCity)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none" />
            </label>
          </div>
        ) : null}
        <label className="hidden">
          <span>Website</span>
          <input value={form.website} onChange={(event) => updateField("website", event.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
        {!minimal ? (
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Message</span>
            <textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
          </label>
        ) : null}
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-600">{status}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="submit" disabled={isPending || isPaying} className="w-full">
              {isPending ? "Sending..." : "Start Now"}
            </Button>
            {allowPayment ? (
              <Button type="button" variant="secondary" disabled={isPending || isPaying} onClick={handlePayNow} className="w-full">
                {isPaying ? "Opening checkout..." : formatPriceLabel(servicePrice)}
              </Button>
            ) : null}
          </div>
        </div>
      </form>
    </Card>
  );
}