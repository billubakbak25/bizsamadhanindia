import { CheckCircle2 } from "lucide-react";

export type PolicySection = {
  id: string;
  title: string;
  body: string[];
};

export function PolicySectionCard({ section }: { section: PolicySection }) {
  return (
    <section
      id={section.id}
      className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none sm:p-8"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{section.title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base sm:leading-8">
        {section.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export function InsightList({ title, items, tone = "slate" }: { title: string; items: string[]; tone?: "slate" | "emerald" }) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30"
      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";

  return (
    <section className={`rounded-2xl border p-6 ${toneClass} sm:p-8`}>
      <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--brand)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
