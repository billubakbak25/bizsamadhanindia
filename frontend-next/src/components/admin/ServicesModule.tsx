"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAdminService,
  fetchAdminServiceCategories,
  fetchAdminServiceTimeline,
  fetchAdminServices,
  updateAdminServiceStatus,
  type AdminRecord,
} from "@/lib/adminData";
import { EmptyState, Panel, StackList, StatusBadge, SummaryCard, formatDateTime } from "./shared";

function serviceIdOf(service: AdminRecord) {
  return String(service.id ?? service._id ?? service.serviceId ?? "");
}

function serviceSearchText(service: AdminRecord) {
  return [service.name, service.title, service.code, service.category, service.client_name, service.clientName, service.status].filter(Boolean).join(" ").toLowerCase();
}

function resolveTimelineItems(service: AdminRecord | null, timeline: AdminRecord[]) {
  if (timeline.length > 0) {
    return timeline;
  }

  return Array.isArray(service?.timeline) ? (service.timeline as AdminRecord[]) : [];
}

type ServiceDetailViewProps = {
  serviceId: string;
  onServiceSync?: (service: AdminRecord) => void;
};

export function ServiceDetailView({ serviceId, onServiceSync }: ServiceDetailViewProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [service, setService] = useState<AdminRecord | null>(null);
  const [timeline, setTimeline] = useState<AdminRecord[]>([]);

  const syncService = useCallback((nextService: AdminRecord) => {
    setService(nextService);
    onServiceSync?.(nextService);
  }, [onServiceSync]);

  const load = useCallback(async () => {
    if (!serviceId) {
      return;
    }

    setLoading(true);
    try {
      const [serviceResult, timelineResult] = await Promise.all([fetchAdminService(serviceId), fetchAdminServiceTimeline(serviceId)]);
      syncService(serviceResult);
      setTimeline(resolveTimelineItems(serviceResult, timelineResult));
    } finally {
      setLoading(false);
    }
  }, [serviceId, syncService]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveStatus(nextStatus: string) {
    if (!serviceId) {
      return;
    }

    setSaving(true);
    try {
      await updateAdminServiceStatus(serviceId, nextStatus);
      await load();
    } finally {
      setSaving(false);
    }
  }

  if (!serviceId) {
    return <EmptyState title="Service not selected" description="Choose a service from the list to inspect status, documents, tasks, and timeline." />;
  }

  if (loading && !service) {
    return <div className="h-80 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.04]" />;
  }

  if (!service) {
    return <EmptyState title="Service not found" description="The selected service could not be loaded." />;
  }

  const documents = Array.isArray(service.documents) ? service.documents : Array.isArray(service.documentList) ? service.documentList : [];
  const tasks = Array.isArray(service.tasks) ? service.tasks : Array.isArray(service.taskList) ? service.taskList : [];
  const visibleTimeline = resolveTimelineItems(service, timeline);

  return (
    <Panel
      eyebrow="Service detail"
      title={service.name ?? service.title ?? service.code ?? serviceId}
      description={service.category ?? service.client_name ?? service.clientName ?? "Service execution view"}
      actions={(
        <>
          {(["pending", "in progress", "submitted", "completed"] as const).map((nextStatus) => (
            <button key={nextStatus} type="button" onClick={() => void saveStatus(nextStatus)} disabled={saving} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-50">
              {nextStatus}
            </button>
          ))}
        </>
      )}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Status" value={String(service.status ?? "pending")} caption={`Updated ${formatDateTime(service.updatedAt ?? service.updated_at ?? service.createdAt)}`} />
        <SummaryCard label="Tasks" value={String((tasks.length || service.task_count || service.taskCount || 0))} caption="Workflow generated work items" accent="amber" />
        <SummaryCard label="Documents" value={String((documents.length || service.document_count || service.documentCount || 0))} caption="Uploaded and linked assets" accent="rose" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Service details</h3>
          <dl className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Client</dt><dd className="text-right text-white">{service.client_name ?? service.clientName ?? service.client?.name ?? "?"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Category</dt><dd className="text-right text-white">{service.category ?? "?"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Owner</dt><dd className="text-right text-white">{service.assigned_to ?? service.assignedTo ?? "?"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">SLA</dt><dd className="text-right text-white">{service.sla_status ?? service.slaStatus ?? "?"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Due date</dt><dd className="text-right text-white">{formatDateTime(service.due_date ?? service.dueDate)}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Updated</dt><dd className="text-right text-white">{formatDateTime(service.updatedAt ?? service.updated_at ?? service.createdAt)}</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge status={service.status ?? "pending"} />
            {service.sla_status ? <StatusBadge status={service.sla_status} /> : null}
          </div>
        </div>
        <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Documents and tasks</h3>
            <p className="text-xs text-slate-500">{visibleTimeline.length} timeline items</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Documents</p>
              {documents.length ? (
                <div className="space-y-2">
                  {documents.slice(0, 5).map((document: AdminRecord) => (
                    <div key={document.id ?? document._id ?? document.name} className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{document.name ?? document.title ?? document.fileName ?? "Document"}</p>
                          <p className="mt-1 text-sm text-slate-300">{document.tag ?? document.tags ?? document.type ?? "Linked document"}</p>
                        </div>
                        <StatusBadge status={document.status ?? "uploaded"} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No documents" description="Document uploads will appear here as soon as the service receives files." />
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Tasks</p>
              {tasks.length ? (
                <div className="space-y-2">
                  {tasks.slice(0, 5).map((task: AdminRecord) => (
                    <div key={task.id ?? task._id ?? task.title} className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{task.title ?? task.name ?? "Task"}</p>
                          <p className="mt-1 text-sm text-slate-300">{task.assignee_name ?? task.assigneeName ?? task.dueAt ?? task.due_at ?? "Assigned work"}</p>
                        </div>
                        <StatusBadge status={task.status ?? task.sla_status ?? "todo"} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No tasks" description="Workflow generated tasks will appear here automatically." />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <StackList items={visibleTimeline.map((item) => ({
          title: item.title ?? item.action ?? item.message ?? "Timeline item",
          description: item.description ?? item.detail ?? item.message ?? "Service activity",
          meta: item.createdAt ?? item.timestamp ?? item.updatedAt,
          status: item.status ?? item.type ?? "active",
        }))} />
      </div>
    </Panel>
  );
}

export function ServicesModule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [services, setServices] = useState<AdminRecord[]>([]);
  const [categories, setCategories] = useState<AdminRecord[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [serviceResult, categoryResult] = await Promise.all([
        fetchAdminServices({ search, category, limit: 100 }),
        fetchAdminServiceCategories(),
      ]);
      setServices(serviceResult.items);
      setCategories(categoryResult);
      setSelectedServiceId((current) => current || serviceIdOf(serviceResult.items[0] ?? {}));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load services.");
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleServices = useMemo(() => services.filter((service) => serviceSearchText(service).includes(search.toLowerCase()) && (!category || String(service.category ?? service.group ?? "").toLowerCase() === category.toLowerCase())), [services, search, category]);

  useEffect(() => {
    setSelectedServiceId((current) => {
      if (visibleServices.some((service) => serviceIdOf(service) === current)) {
        return current;
      }

      return serviceIdOf(visibleServices[0] ?? {});
    });
  }, [visibleServices]);

  const handleServiceSync = useCallback((nextService: AdminRecord) => {
    const nextServiceId = serviceIdOf(nextService);
    if (!nextServiceId) {
      return;
    }

    setServices((current) => {
      let found = false;
      const nextItems = current.map((service) => {
        if (serviceIdOf(service) !== nextServiceId) {
          return service;
        }

        found = true;
        return { ...service, ...nextService };
      });

      return found ? nextItems : [nextService, ...nextItems];
    });
  }, []);

  return (
    <div className="space-y-6">
      <Panel eyebrow="Service management" title="Category-based service execution" description="Track service records, move statuses, and inspect workflows in one place." actions={<button type="button" onClick={() => void load()} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/50">Reload</button>}>
        {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Services" value={String(visibleServices.length)} caption="Live service records" />
          <SummaryCard label="Categories" value={String(categories.length)} caption="Workflow templates" accent="amber" />
          <SummaryCard label="Selected" value={selectedServiceId ? selectedServiceId.slice(0, 8) : "?"} caption="Service detail focus" accent="slate" />
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel eyebrow="Service list" title="Services" description="Search and filter by category.">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Search</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="mt-2 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Service, client, code..." />
            </label>
            <label className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full bg-transparent text-sm text-white outline-none">
                <option value="">All</option>
                {categories.map((entry) => <option key={String(entry.id ?? entry.value ?? entry.name)} value={String(entry.value ?? entry.name ?? entry.category ?? "")}>{entry.name ?? entry.label ?? entry.value ?? "Category"}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 space-y-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-[18px] border border-white/10 bg-white/[0.04]" />)
            ) : visibleServices.length ? (
              visibleServices.map((service) => {
                const id = serviceIdOf(service);
                const active = id === selectedServiceId;
                return (
                  <button key={id || service.code || service.name} type="button" onClick={() => setSelectedServiceId(id)} className={`w-full rounded-[18px] border px-4 py-4 text-left transition ${active ? "border-emerald-400/50 bg-emerald-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{service.name ?? service.title ?? service.code ?? "Service"}</p>
                        <p className="mt-1 text-sm text-slate-300">{service.category ?? service.client_name ?? service.clientName ?? "Service details"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={service.status ?? "pending"} />
                        <span className="text-xs text-slate-400">{service.assigned_to ?? service.assignedTo ?? "Unassigned"}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <EmptyState title="No services found" description="Change the filters or search term to reveal service records." />
            )}
          </div>
        </Panel>

        <ServiceDetailView serviceId={selectedServiceId} onServiceSync={handleServiceSync} />
      </div>
    </div>
  );
}
