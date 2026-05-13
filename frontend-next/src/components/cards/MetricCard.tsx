import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type MetricCardProps = {
  label: string;
  value: string | number;
  tone?: "brand" | "accent" | "slate" | "emerald";
  helper?: ReactNode;
};

const TONES = {
  brand: "text-[var(--brand)]",
  accent: "text-amber-600",
  slate: "text-slate-950",
  emerald: "text-emerald-700",
};

export function MetricCard({ label, value, tone = "slate", helper }: MetricCardProps) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className={["mt-3 text-3xl font-semibold tracking-tight", TONES[tone]].join(" ")}>{value}</p>
      {helper ? <div className="mt-2 text-sm text-slate-600">{helper}</div> : null}
    </Card>
  );
}
