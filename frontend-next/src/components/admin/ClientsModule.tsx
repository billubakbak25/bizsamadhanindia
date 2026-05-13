
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAdminClientDirectory, fetchAdminClientStatus, fetchAdminServices, type AdminRecord } from "@/lib/adminData";
import { EmptyState, Panel, StackList, StatusBadge, SummaryCard, formatDateTime } from "./shared";

function clientIdOf(client: AdminRecord) {
  return String(client.id ?? client.clientId ?? client._id ?? "");
}

function clientSearchText(client: AdminRecord) {
  return [client.name, client.email, client.phone, client.status, client.city, client.latestActivityAt].filter(Boolean).join(" ").toLowerCase();
}

export function ClientDetailView({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(true);
  const [clientStatus, setClientStatus] = useState<AdminRecord | null>(null);
  const [services, setServices] = useState<AdminRecord[]>([]);

  const load = useCallback(async () => {
    if (!clientId) {
      return;
    }

    setLoading(true);
    try {
      const [statusResult, servicesResult] = await Promise.all([
        fetchAdminClientStatus(clientId),
        fetchAdminServices({ limit: 500 }),
      ]);
      setClientStatus(statusResult);
      setServices(servicesResult.items.filter((service) => String(service.client_id ?? service.clientId ?? service.client?.id ?? "") === clientId));
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!clientId) {
    return <EmptyState title="Client not selected" description="Select a client row to inspect services, status, and documents." />;
  }

  if (loading && !clientStatus) {
    return <div className="h-80 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.04]" />;
  }

  if (!clientStatus) {
    return <EmptyState title="Client not found" description="The selected client profile could not be loaded." />;
  }

  const timeline = [
    {
      title: clientStatus.status ?? "Active",
      description: clientStatus.summary ?? clientStatus.description ?? "Client health snapshot from CRM.",
      meta: clientStatus.updatedAt ?? clientStatus.updated_at ?? clientStatus.createdAt,
      status: clientStatus.status ?? "active",
    },
    ...services.slice(0, 6).map((service) => ({
      title: service.name ?? service.title ?? "Service",
      description: service.status ?? service.category ?? "Assigned service",
      meta: service.updatedAt ?? service.createdAt,
      status: service.status ?? "pending",
    })),
  ];

  return (
    <Panel eyebrow="Client profile" title={clientStatus.name ?? clientStatus.clientName ?? clientId} description={clientStatus.email ?? clientStatus.phone ?? clientStatus.status ?? "Client overview"}>
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Status" value={String(clientStatus.status ?? "active")} caption="From CRM client status API" />
        <SummaryCard label="Services" value={String(services.length)} caption="Linked service records" accent="amber" />
        <SummaryCard label="Updated" value={formatDateTime(clientStatus.updatedAt ?? clientStatus.updated_at ?? clientStatus.createdAt)} caption="Most recent change" accent="slate" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Client snapshot</h3>
          <dl className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Name</dt><dd className="text-right text-white">{clientStatus.name ?? clientStatus.clientName ?? "?"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Email</dt><dd className="text-right text-white">{clientStatus.email ?? "?"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Phone</dt><dd className="text-right text-white">{clientStatus.phone ?? "?"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Owner</dt><dd className="text-right text-white">{clientStatus.owner ?? clientStatus.assignedTo ?? "?"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Last update</dt><dd className="text-right text-white">{formatDateTime(clientStatus.updatedAt ?? clientStatus.updated_at ?? clientStatus.createdAt)}</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge status={clientStatus.status ?? "active"} />
            {clientStatus.risk ? <StatusBadge status={clientStatus.risk} /> : null}
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Services and activity</h3>
            <p className="text-xs text-slate-500">{timeline.length} items</p>
          </div>
          <div className="mt-4 space-y-3">
            {services.length ? (
              services.map((service) => (
                <div key={service.id ?? service._id ?? service.name} className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{service.name ?? service.title ?? "Service"}</p>
                      <p className="mt-1 text-sm text-slate-300">{service.category ?? service.code ?? "Category"}</p>
                    </div>
                    <StatusBadge status={service.status ?? "pending"} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No services linked" description="Service records for this client will appear here once the service is created." />
            )}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <StackList items={timeline} />
      </div>
    </Panel>
  );
}

export function ClientsModule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<AdminRecord[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAdminClientDirectory();
      setClients(result);
      setSelectedClientId((current) => current || clientIdOf(result[0] ?? {}));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleClients = useMemo(() => clients.filter((client) => clientSearchText(client).includes(search.toLowerCase())), [clients, search]);

  return (
    <div className="space-y-6">
      <Panel eyebrow="Client management" title="Clients, services, and operational health" description="A derived client directory built from the live service graph and CRM status API." actions={<button type="button" onClick={() => void load()} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/50">Reload</button>}>
        {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Clients" value={String(visibleClients.length)} caption="Derived from the service layer" />
          <SummaryCard label="Active services" value={String(visibleClients.reduce((sum, client) => sum + Number(client.activeServices ?? 0), 0))} caption="Across the client directory" accent="amber" />
          <SummaryCard label="Pending tasks" value={String(visibleClients.reduce((sum, client) => sum + Number(client.pendingTasks ?? 0), 0))} caption="Current client workload" accent="rose" />
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel eyebrow="Directory" title="Client list" description="Search across names, emails, and statuses.">
          <label className="block rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Search</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="mt-2 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Client name, email, city..." />
          </label>
          <div className="mt-4 space-y-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-[18px] border border-white/10 bg-white/[0.04]" />)
            ) : visibleClients.length ? (
              visibleClients.map((client) => {
                const id = clientIdOf(client);
                const active = id === selectedClientId;
                return (
                  <button key={id || client.email || client.name} type="button" onClick={() => setSelectedClientId(id)} className={`w-full rounded-[18px] border px-4 py-4 text-left transition ${active ? "border-emerald-400/50 bg-emerald-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{client.name ?? client.clientName ?? "Client"}</p>
                        <p className="mt-1 text-sm text-slate-300">{client.email ?? client.phone ?? client.city ?? "Client details"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={client.status ?? "active"} />
                        <span className="text-xs text-slate-400">{client.activeServices ?? 0} services</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <EmptyState title="No clients found" description="Try a broader search term to surface more client records." />
            )}
          </div>
        </Panel>

        <ClientDetailView clientId={selectedClientId} />
      </div>
    </div>
  );
}
