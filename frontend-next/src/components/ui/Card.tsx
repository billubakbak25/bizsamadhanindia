import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "surface-card rounded-[28px] border border-[var(--line)] shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
