"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { apiJson } from "@/lib/api";
import { useApi } from "@/hooks/useApi";

export function PaymentStatusCard() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || searchParams.get("order_id") || "";

  const { data, error, isLoading } = useApi(
    async () => {
      if (!orderId) {
        return null;
      }

      return apiJson<Record<string, unknown>>(`/api/payment-details/${orderId}`, { cache: "no-store" }, { label: "payment.details" });
    },
    [orderId],
  );

  return (
    <Card className="p-6 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Payment confirmation</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-950">Payment flow completed</h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">If you arrived here from the live payment flow, the order details can be verified against the Railway payment API.</p>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">
        {!orderId ? "No order identifier was found in the URL. The payment page is ready, but order-specific details require ?orderId=... in the query string." : null}
        {orderId && isLoading ? `Loading order ${orderId}...` : null}
        {orderId && error ? error.message : null}
        {orderId && data ? <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-600">{JSON.stringify(data, null, 2)}</pre> : null}
      </div>
    </Card>
  );
}
