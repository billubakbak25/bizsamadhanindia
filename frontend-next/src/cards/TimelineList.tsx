import { Card } from "@/components/ui/Card";

type TimelineItem = {
  id?: string | number;
  title: string;
  description: string;
  timestamp?: string;
  tone?: "emerald" | "amber" | "sky" | "slate";
};

type TimelineListProps = {
  title: string;
  items: TimelineItem[];
  emptyText?: string;
};

const DOTS = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  slate: "bg-slate-500",
};

export function TimelineList({ title, items, emptyText = "No activity yet." }: TimelineListProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Live timeline</span>
      </div>
      <div className="mt-5 space-y-4">
        {items.length ? (
          items.map((item, index) => (
            <div key={item.id || `${item.title}-${index}`} className="flex gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <span className={["mt-1 h-2.5 w-2.5 rounded-full", DOTS[item.tone || "slate"]].join(" ")} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{item.timestamp || "Just now"}</p>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600">{emptyText}</div>
        )}
      </div>
    </Card>
  );
}
