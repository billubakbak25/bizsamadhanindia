"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchAdminGlobalSearch,
  type AdminGlobalSearchResult,
  type AdminRecord,
} from "@/lib/adminData";
import { SkeletonBlock, StatusBadge } from "@/components/admin/shared";

const EMPTY_RESULTS: AdminGlobalSearchResult = {
  leads: [],
  clients: [],
  services: [],
};

function recordId(record: AdminRecord) {
  return String(record.id ?? record._id ?? record.clientId ?? record.leadId ?? record.serviceId ?? "").trim();
}

function labelOf(record: AdminRecord, fallback: string) {
  return String(record.name ?? record.title ?? record.clientName ?? record.email ?? fallback);
}

function descriptionOf(record: AdminRecord, fallback: string) {
  return String(record.email ?? record.phone ?? record.category ?? record.city ?? record.client_name ?? record.clientName ?? fallback);
}

function buildHref(kind: keyof AdminGlobalSearchResult, record: AdminRecord) {
  const id = recordId(record);

  if (kind === "leads") {
    return id ? `/admin/crm/${id}` : "/admin/crm";
  }

  if (kind === "clients") {
    return id ? `/admin/clients/${id}` : "/admin/clients";
  }

  return id ? `/admin/services/${id}` : "/admin/services";
}

function SearchGroup({
  title,
  kind,
  items,
}: {
  title: string;
  kind: keyof AdminGlobalSearchResult;
  items: AdminRecord[];
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{title}</p>
      <div className="space-y-2">
        {items.map((item) => {
          const href = buildHref(kind, item);
          return (
            <Link
              key={`${kind}-${recordId(item)}-${labelOf(item, title)}`}
              href={href}
              className="block rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-emerald-400/40 hover:bg-white/[0.06]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{labelOf(item, title)}</p>
                  <p className="mt-1 text-sm text-slate-300">{descriptionOf(item, `${title} result`)}</p>
                </div>
                <StatusBadge status={item.status ?? kind.slice(0, -1)} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function GlobalAdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminGlobalSearchResult>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalized = query.trim();

    if (normalized.length < 2) {
      setResults(EMPTY_RESULTS);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    const timer = window.setTimeout(() => {
      void fetchAdminGlobalSearch(normalized)
        .then((next) => {
          if (!active) {
            return;
          }
          setResults(next);
        })
        .catch((searchError) => {
          if (!active) {
            return;
          }
          setResults(EMPTY_RESULTS);
          setError(searchError instanceof Error ? searchError.message : "Unable to search admin records.");
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const hasResults = results.leads.length > 0 || results.clients.length > 0 || results.services.length > 0;
  const showPanel = query.trim().length >= 2;

  return (
    <div className="mt-5 space-y-3">
      <label className="block rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Global search</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search lead, client, or service..."
          className="mt-2 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </label>

      {showPanel ? (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-16 w-full rounded-[18px]" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-rose-300">{error}</p>
          ) : hasResults ? (
            <div className="grid gap-4 xl:grid-cols-3">
              <SearchGroup title="Leads" kind="leads" items={results.leads} />
              <SearchGroup title="Clients" kind="clients" items={results.clients} />
              <SearchGroup title="Services" kind="services" items={results.services} />
            </div>
          ) : (
            <p className="text-sm text-slate-300">No admin records matched that search yet.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
