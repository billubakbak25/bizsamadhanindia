"use client";

import { CreditCard, Landmark, RefreshCw, Smartphone, WalletCards } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { apiJson, unwrapData } from "@/lib/api";
import { useApi } from "@/hooks/useApi";

type RazorpayMethodsPayload = {
  success?: boolean;
  source?: string;
  reason?: string;
  refreshed_at?: string;
  cache?: string;
  note?: string;
  methods?: Record<string, boolean | number | string | unknown>;
  banks?: Record<string, string>;
  wallets?: Record<string, string>;
  upi?: Record<string, string | boolean | number | unknown>;
  apps?: Record<string, string>;
  card_networks?: string[];
};

type PaymentMethodEnvelope = {
  success?: boolean;
  data?: RazorpayMethodsPayload;
};

const methodLabels: Record<string, string> = {
  card: "Cards",
  netbanking: "Netbanking",
  upi: "UPI",
  wallet: "Wallets",
  emi: "EMI",
  cardless_emi: "Cardless EMI",
  paylater: "Pay Later",
  app: "Payment Apps",
};

const methodIcons = {
  card: CreditCard,
  netbanking: Landmark,
  upi: Smartphone,
  wallet: WalletCards,
};

function asEntries(value: Record<string, unknown> | undefined) {
  return Object.entries(value || {}).filter(([, item]) => item !== false && item !== null && item !== undefined);
}

function formatValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? "Available" : "Unavailable";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const objectValue = value as { name?: string; display_name?: string; enabled?: boolean };
    return objectValue.name || objectValue.display_name || (objectValue.enabled === false ? "Unavailable" : "Available");
  }

  return "Available";
}

function DirectoryList({ title, items, emptyText }: { title: string; items: [string, unknown][]; emptyText: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{items.length}</span>
      </div>
      <div className="mt-5 max-h-96 overflow-y-auto pr-1">
        {items.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {items.map(([code, value]) => (
              <li key={code} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold text-slate-950">{formatValue(value)}</span>
                <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-slate-400">{code}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-7 text-slate-600">{emptyText}</p>
        )}
      </div>
    </Card>
  );
}

export function PaymentMethodsDirectory() {
  const { data, error, isLoading } = useApi(
    async () => {
      const payload = await apiJson<PaymentMethodEnvelope>("/api/payment-methods", { cache: "no-store" }, { label: "payment.methods" });
      return unwrapData<RazorpayMethodsPayload>(payload);
    },
    [],
  );

  const methods = asEntries(data?.methods as Record<string, unknown> | undefined);
  const banks = asEntries(data?.banks as Record<string, unknown> | undefined);
  const wallets = asEntries(data?.wallets as Record<string, unknown> | undefined);
  const upi = asEntries(data?.upi as Record<string, unknown> | undefined);
  const apps = asEntries(data?.apps as Record<string, unknown> | undefined);
  const networks = (data?.card_networks || []).map((network) => [network, network] as [string, unknown]);

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Live Razorpay availability</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Checkout keeps Razorpay default blocks enabled and the bank/provider directory below is fetched from Razorpay so new banks and payment instruments do not require a code deploy.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 font-semibold text-slate-950">
              <RefreshCw className="h-4 w-4 text-[var(--brand)]" />
              {isLoading ? "Syncing..." : data?.source === "razorpay" ? "Synced with Razorpay" : "Fallback mode"}
            </span>
            <span className="mt-1 block text-xs text-slate-500">{data?.refreshed_at ? `Updated ${new Date(data.refreshed_at).toLocaleString("en-IN")}` : "Waiting for supported methods"}</span>
          </div>
        </div>
        {error ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{error.message}</p> : null}
        {data?.reason ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{data.reason}</p> : null}
        {data?.note ? <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{data.note}</p> : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {methods.map(([code, value]) => {
          const Icon = methodIcons[code as keyof typeof methodIcons] || CreditCard;
          return (
            <div key={code} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-950/5">
              <Icon className="h-5 w-5 text-[var(--brand)]" />
              <p className="mt-4 font-semibold text-slate-950">{methodLabels[code] || code}</p>
              <p className="mt-1 text-sm text-slate-500">{formatValue(value)}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DirectoryList title="Netbanking banks" items={banks} emptyText="Live bank list appears here after Razorpay credentials are configured." />
        <DirectoryList title="Wallet providers" items={wallets} emptyText="Live wallet providers appear here after Razorpay credentials are configured." />
        <DirectoryList title="UPI instruments" items={upi} emptyText="UPI collect, intent, and QR availability is controlled through Razorpay Checkout." />
        <DirectoryList title="Payment apps" items={apps} emptyText="Supported payment apps appear here when Razorpay returns app instruments." />
        <DirectoryList title="Card networks" items={networks} emptyText="Card network details are handled by Razorpay Checkout." />
      </div>
    </div>
  );
}
