"use client";

import { Card } from "@/components/ui/Card";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
};

export function SearchBar({ value, onChange, placeholder = "Search", helper }: SearchBarProps) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="block min-w-0 flex-1 space-y-2 text-sm font-medium text-slate-700">
          <span>{helper || "Search across the current view"}</span>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]"
          />
        </label>
      </div>
    </Card>
  );
}
