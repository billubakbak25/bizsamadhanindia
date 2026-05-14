import type { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/Button";

type ContactAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  external?: boolean;
};

type ContactCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  content: ReactNode;
  actions?: ContactAction[];
};

export function ContactCard({ eyebrow, title, description, icon, content, actions = [] }: ContactCardProps) {
  return (
    <Card className="flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">{eyebrow}</p>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
          </div>
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-[var(--brand)] dark:bg-emerald-950/40">
          {icon}
        </div>
      </div>

      <div className="mt-6 flex-1 text-sm leading-7 text-slate-700 dark:text-slate-200">{content}</div>

      {actions.length ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {actions.map((action) =>
            action.external ? (
              <a
                key={action.href}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClassName({ variant: action.variant || "secondary", className: "min-w-[148px]" })}
              >
                {action.label}
              </a>
            ) : (
              <Link
                key={action.href}
                href={action.href}
                className={buttonClassName({ variant: action.variant || "secondary", className: "min-w-[148px]" })}
              >
                {action.label}
              </Link>
            ),
          )}
        </div>
      ) : null}
    </Card>
  );
}
