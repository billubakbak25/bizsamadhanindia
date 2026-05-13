"use client";

import { apiJson } from "@/lib/api";
import { useApi } from "@/hooks/useApi";

type HealthResponse = {
  success?: boolean;
  status?: string;
  timestamp?: string;
  uptime?: number;
};

export function ApiHealthChip({ label = "API status" }: { label?: string }) {
  const { data, error, isLoading, reload } = useApi(
    () => apiJson<HealthResponse>("/health", { cache: "no-store" }, { label: `${label}.health` }),
    [label],
  );

  const stateLabel = isLoading ? "Checking backend" : error ? "Backend issue" : data?.status || "Connected";
  const tone = isLoading ? "bg-amber-50 text-amber-700" : error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700";

  return (
    <button
      type="button"
      onClick={reload}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${tone}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      <span>{label}: {stateLabel}</span>
    </button>
  );
}
