import type { ReactNode } from "react";

type StatusTone = "emerald" | "amber" | "rose" | "slate";

export function formatDateTime(value: unknown) {
  if (!value) {
    return "?";
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatCurrency(value: unknown) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) {
    return "?0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(value: unknown) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function statusTone(status: unknown): StatusTone {
  const normalized = String(status ?? "").toLowerCase();
  if (["completed", "done", "closed", "submitted", "active"].includes(normalized)) {
    return "emerald";
  }
  if (["in progress", "pending", "processing"].includes(normalized)) {
    return "amber";
  }
  if (["blocked", "overdue", "breached", "failed"].includes(normalized)) {
    return "rose";
  }
  return "slate";
}

export function StatusBadge({ status, className = "" }: { status: unknown; className?: string }) {
  const tone = statusTone(status);
  const colorClasses: Record<StatusTone, string> = {
    emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    rose: "border-rose-400/30 bg-rose-500/10 text-rose-200",
    slate: "border-white/10 bg-white/5 text-slate-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${colorClasses[tone]} ${className}`.trim()}>
      {String(status ?? "Unknown")}
    </span>
  );
}

export function Panel({
  eyebrow,
  title,
  description,
  actions,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6 ${className}`.trim()}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{eyebrow}</p> : null}
          <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{title}</h2>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

export function SummaryCard({
  label,
  value,
  caption,
  accent = "emerald",
}: {
  label: string;
  value: string;
  caption?: string;
  accent?: StatusTone;
}) {
  const accents: Record<StatusTone, string> = {
    emerald: "from-emerald-500/25 to-teal-500/10 text-emerald-200",
    amber: "from-amber-500/25 to-orange-500/10 text-amber-100",
    rose: "from-rose-500/25 to-pink-500/10 text-rose-100",
    slate: "from-white/10 to-white/5 text-slate-100",
  };

  return (
    <div className={`rounded-[24px] border border-white/10 bg-gradient-to-br p-5 shadow-lg shadow-black/10 ${accents[accent]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
      {caption ? <p className="mt-2 text-sm leading-6 text-white/70">{caption}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/15 bg-white/[0.02] px-5 py-10 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function StackList({ items }: { items: Array<{ title: string; description?: string; meta?: string; status?: unknown }> }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={`${item.title}-${item.meta ?? item.description ?? ""}`} className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-white">{item.title}</p>
              {item.description ? <p className="mt-1 text-sm leading-6 text-slate-300">{item.description}</p> : null}
            </div>
            {item.status !== undefined ? <StatusBadge status={item.status} /> : null}
          </div>
          {item.meta ? <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">{item.meta}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[18px] border border-white/10 bg-white/[0.05] ${className}`.trim()} />;
}

export function AdminRouteSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6">
        <div className="space-y-5">
          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-10 w-full max-w-sm" />
            <SkeletonBlock className="h-5 w-full max-w-3xl" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 w-28 rounded-full" />
            ))}
          </div>
          <SkeletonBlock className="h-14 w-full rounded-[22px]" />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-32 w-full rounded-[24px]" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6">
          <div className="space-y-4">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-8 w-64" />
            <SkeletonBlock className="h-5 w-full max-w-2xl" />
            <SkeletonBlock className="h-14 w-full rounded-[18px]" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-16 w-full rounded-[18px]" />
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6">
          <div className="space-y-4">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-8 w-56" />
            <SkeletonBlock className="h-5 w-full max-w-xl" />
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-28 w-full rounded-[24px]" />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-20 w-full rounded-[20px]" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
