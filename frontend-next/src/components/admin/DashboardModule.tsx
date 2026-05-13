
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAdminDashboard, fetchAdminLeads, fetchAdminServices, fetchAdminTasks, type AdminRecord } from "@/lib/adminData";
import { EmptyState, Panel, StackList, StatusBadge, SummaryCard, formatCompactNumber, formatCurrency } from "./shared";

function isOpenStatus(value: unknown) {
  const normalized = String(value ?? "").toLowerCase();
  return !["completed", "done", "closed", "submitted"].includes(normalized);
}

function matchesQuery(record: AdminRecord, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    record.name,
    record.title,
    record.email,
    record.phone,
    record.status,
    record.category,
    record.client_name,
    record.clientName,
    record.service_name,
    record.serviceName,
    record.assignee_name,
    record.assigneeName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function DashboardModule() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [snapshot, setSnapshot] = useState<AdminRecord>({});
  const [leads, setLeads] = useState<AdminRecord[]>([]);
  const [services, setServices] = useState<AdminRecord[]>([]);
  const [tasks, setTasks] = useState<AdminRecord[]>([]);

  const load = useCallback(async (silent = false) => {
    try {
      setError(null);
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [dashboardResult, leadsResult, servicesResult, tasksResult] = await Promise.all([
        fetchAdminDashboard(),
        fetchAdminLeads({ limit: 100 }),
        fetchAdminServices({ limit: 100 }),
        fetchAdminTasks({ limit: 100 }),
      ]);

      const dashboardPayload = dashboardResult.dashboard ?? dashboardResult;
      setSnapshot({
        ...dashboardPayload,
        revenue: dashboardResult.revenue,
        conversions: dashboardResult.conversions,
        pendingWork: dashboardResult.pendingWork,
        topServices: dashboardResult.topServices,
      });
      setLeads(leadsResult.items);
      setServices(servicesResult.items);
      setTasks(tasksResult.items);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load(true);
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, [load]);

  const query = search.trim().toLowerCase();
  const filteredLeads = useMemo(() => leads.filter((lead) => matchesQuery(lead, query)), [leads, query]);
  const filteredServices = useMemo(() => services.filter((service) => matchesQuery(service, query)), [services, query]);
  const filteredTasks = useMemo(() => tasks.filter((task) => matchesQuery(task, query)), [tasks, query]);

  const dashboardPayload = snapshot ?? {};
  const metricTotals = {
    leads: Number(dashboardPayload.totalLeads ?? dashboardPayload.leads ?? filteredLeads.length ?? 0),
    activeServices: Number(dashboardPayload.activeServices ?? dashboardPayload.services ?? services.filter((item) => isOpenStatus(item.status)).length),
    pendingTasks: Number(dashboardPayload.pendingTasks ?? dashboardPayload.tasks ?? filteredTasks.filter((item) => isOpenStatus(item.status)).length),
    revenue: Number(dashboardPayload.revenue?.total ?? dashboardPayload.revenue ?? dashboardPayload.totalRevenue ?? 0),
  };

  const recentActivity = useMemo(() => {
    const activity = [
      ...(Array.isArray(dashboardPayload.recentActivity) ? dashboardPayload.recentActivity : []),
      ...(Array.isArray(dashboardPayload.timeline) ? dashboardPayload.timeline : []),
    ];

    if (activity.length) {
      return activity.slice(0, 8).map((item: AdminRecord) => ({
        title: item.title ?? item.message ?? item.action ?? "Update",
        description: item.description ?? item.detail ?? item.message ?? item.entity ?? "",
        meta: item.createdAt ?? item.timestamp ?? item.time ?? item.updatedAt ?? "",
        status: item.status ?? item.type ?? "active",
      }));
    }

    return [
      ...filteredLeads.slice(0, 3).map((lead) => ({
        title: lead.name ?? lead.title ?? "Lead activity",
        description: lead.status ?? lead.source ?? "Lead movement in CRM",
        meta: lead.updatedAt ?? lead.createdAt,
        status: lead.status ?? "new",
      })),
      ...filteredServices.slice(0, 3).map((service) => ({
        title: service.name ?? service.title ?? "Service activity",
        description: service.category ?? service.status ?? "Service execution in progress",
        meta: service.updatedAt ?? service.createdAt,
        status: service.status ?? "pending",
      })),
      ...filteredTasks.slice(0, 2).map((task) => ({
        title: task.title ?? "Task activity",
        description: task.assignee_name ?? task.assigneeName ?? task.status ?? "Task update",
        meta: task.updatedAt ?? task.createdAt,
        status: task.status ?? "todo",
      })),
    ];
  }, [dashboardPayload, filteredLeads, filteredServices, filteredTasks]);

  const overdueAlerts = useMemo(
    () => filteredTasks.filter((task) => String(task.sla_status ?? task.slaStatus ?? "").toLowerCase() === "breached" || String(task.status ?? "").toLowerCase() === "overdue"),
    [filteredTasks],
  );

  return (
    <div className="space-y-6">
      <Panel
        eyebrow="Control center"
        title="Production-grade admin dashboard"
        description="Live CRM, service, and workflow operations with polling-based freshness, mobile-first cards, and centralized control."
        actions={(
          <>
            <Link href="/admin/crm" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/50">Open CRM</Link>
            <Link href="/admin/services" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/50">Review services</Link>
            <button type="button" onClick={() => void load(true)} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/15">{refreshing ? "Refreshing..." : "Refresh"}</button>
          </>
        )}
      >
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <label className="block rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Global search</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search leads, clients, services, tasks..."
                className="mt-2 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Total leads" value={formatCompactNumber(metricTotals.leads)} caption="CRM pipeline entries" />
              <SummaryCard label="Active services" value={formatCompactNumber(metricTotals.activeServices)} caption="In-flight service records" accent="amber" />
              <SummaryCard label="Pending tasks" value={formatCompactNumber(metricTotals.pendingTasks)} caption="Open work across teams" accent="rose" />
              <SummaryCard label="Revenue" value={formatCurrency(metricTotals.revenue)} caption="Reported from metrics API" accent="slate" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">SLA attention</p>
              <p className="mt-3 text-3xl font-semibold text-white">{formatCompactNumber(overdueAlerts.length)}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Tasks with overdue or breached SLA windows that need immediate intervention.</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Freshness</p>
              <p className="mt-3 text-lg font-semibold text-white">{loading ? "Loading live data..." : refreshing ? "Syncing every 30s" : "Live polling active"}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Recent updates are refreshed without a page reload so operators can keep working.</p>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel eyebrow="Recent activity" title="Operational timeline" description="A consolidated view of the most recent CRM, service, and task changes.">
          {loading && !recentActivity.length ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-[20px] border border-white/10 bg-white/[0.04]" />
              ))}
            </div>
          ) : recentActivity.length ? (
            <StackList items={recentActivity} />
          ) : (
            <EmptyState title="Nothing to show yet" description="Once CRM, service, and workflow events start flowing, the timeline appears here." />
          )}
        </Panel>

        <Panel eyebrow="Operational slices" title="Search results" description="Filtered CRM records across leads, services, and tasks.">
          <div className="space-y-5">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Leads</h3>
                <span className="text-xs text-slate-500">{filteredLeads.length}</span>
              </div>
              {filteredLeads.length ? (
                <div className="space-y-2">
                  {filteredLeads.slice(0, 4).map((lead) => (
                    <Link key={lead.id ?? lead._id ?? lead.email ?? lead.name} href={`/admin/crm/${lead.id ?? lead._id ?? ""}`} className="block rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-emerald-400/40 hover:bg-white/[0.06]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{lead.name ?? lead.title ?? "Lead"}</p>
                          <p className="mt-1 text-sm text-slate-300">{lead.email ?? lead.phone ?? lead.source ?? "CRM entry"}</p>
                        </div>
                        <StatusBadge status={lead.status ?? "new"} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No matching leads.</p>
              )}
            </section>
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Services</h3>
                <span className="text-xs text-slate-500">{filteredServices.length}</span>
              </div>
              {filteredServices.length ? (
                <div className="space-y-2">
                  {filteredServices.slice(0, 4).map((service) => (
                    <Link key={service.id ?? service._id ?? service.code ?? service.name} href={`/admin/services/${service.id ?? service._id ?? ""}`} className="block rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-emerald-400/40 hover:bg-white/[0.06]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{service.name ?? service.title ?? "Service"}</p>
                          <p className="mt-1 text-sm text-slate-300">{service.category ?? service.client_name ?? service.clientName ?? "Category"}</p>
                        </div>
                        <StatusBadge status={service.status ?? "pending"} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No matching services.</p>
              )}
            </section>
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Tasks</h3>
                <span className="text-xs text-slate-500">{filteredTasks.length}</span>
              </div>
              {filteredTasks.length ? (
                <div className="space-y-2">
                  {filteredTasks.slice(0, 4).map((task) => (
                    <div key={task.id ?? task._id ?? task.title} className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{task.title ?? task.name ?? "Task"}</p>
                          <p className="mt-1 text-sm text-slate-300">{task.assignee_name ?? task.assigneeName ?? task.dueDate ?? task.due_at ?? "Task assignment"}</p>
                        </div>
                        <StatusBadge status={task.sla_status ?? task.status ?? "todo"} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No matching tasks.</p>
              )}
            </section>
          </div>
        </Panel>
      </div>
    </div>
  );
}

