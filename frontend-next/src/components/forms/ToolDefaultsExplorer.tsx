"use client";

import { Card } from "@/components/ui/Card";
import { apiJson, unwrapData } from "@/lib/api";
import { useApi } from "@/hooks/useApi";

type ToolDefault = {
  key: string;
  name: string;
  description: string;
  inputs: Record<string, string | number | boolean>;
  outputLabels: string[];
};

export function ToolDefaultsExplorer() {
  const { data, error, isLoading } = useApi(
    async () => {
      const payload = await apiJson<{ success?: boolean; data?: { items: ToolDefault[] } }>("/api/tools/defaults", { cache: "no-store" }, { label: "tools.defaults" });
      return unwrapData(payload)?.items || [];
    },
    [],
  );

  if (isLoading) {
    return <Card className="p-6 text-sm text-slate-600">Loading live tool defaults from the backend...</Card>;
  }

  if (error) {
    return <Card className="p-6 text-sm text-rose-600">{error.message}</Card>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {(data || []).map((tool) => (
        <Card key={tool.key} className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Live tool preset</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">{tool.name}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{tool.description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {Object.entries(tool.inputs).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">{key}</span>
                <span className="mt-2 block font-semibold text-slate-950">{String(value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {tool.outputLabels.map((label) => (
              <span key={label} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                {label}
              </span>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
