"use client";

import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button";
import { formatServicePrice } from "@/lib/pricing";

type CTAProps = {
  serviceName: string;
  cityName: string;
  serviceCode: string;
  price?: number | null;
  variant?: "hero" | "compact";
  targetId?: string;
};

function trackCtaClick(action: string, payload: Record<string, unknown>) {
  const eventPayload = { event: "cta_click", action, ...payload };
  console.log("FUNNEL_EVENT:", eventPayload);

  if (typeof window !== "undefined") {
    const targetWindow = window as Window & { dataLayer?: Record<string, unknown>[] };
    targetWindow.dataLayer?.push(eventPayload);
  }
}

export function CTA({ serviceName, cityName, serviceCode, price = null, variant = "hero", targetId = "lead-form" }: CTAProps) {
  const priceLabel = price ? formatServicePrice(price) : "live pricing";
  const isCompact = variant === "compact";
  const href = `#${targetId}`;
  const trackPayload = { serviceCode, serviceName, cityName, price: price || null, targetId };

  return (
    <div className={isCompact ? "flex flex-col gap-3 sm:flex-row" : "space-y-4"}>
      {!isCompact ? (
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          24-48 hr support - expert assisted - {priceLabel}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={href} onClick={() => trackCtaClick("start_now", trackPayload)} data-track={`${serviceCode}_start_now`} className={buttonClassName({ size: "lg" })}>
          Start Now
        </Link>
        <Link href={href} onClick={() => trackCtaClick("talk_to_expert", trackPayload)} data-track={`${serviceCode}_talk_to_expert`} className={buttonClassName({ variant: "secondary", size: "lg" })}>
          Talk to Expert
        </Link>
        <Link href={href} onClick={() => trackCtaClick("buy_now", trackPayload)} data-track={`${serviceCode}_buy_now`} className={buttonClassName({ variant: "ghost", size: "lg", className: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100 hover:bg-emerald-100" })}>
          Buy Now
        </Link>
      </div>
    </div>
  );
}