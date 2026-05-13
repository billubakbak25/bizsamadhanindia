
"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  convertAdminLead,
  createAdminLeadFollowUp,
  fetchAdminLead,
  fetchAdminLeadFollowUps,
  fetchAdminLeads,
  qualifyAdminLead,
  updateAdminLeadStatus,
  type AdminRecord,
} from "@/lib/adminData";
import { EmptyState, Panel, StackList, StatusBadge, SummaryCard, formatDateTime } from "./shared";

function getLeadLabel(lead: AdminRecord) {
  return lead.name ?? lead.fullName ?? lead.title ?? lead.subject ?? "Lead";
}

function getLeadId(lead: AdminRecord) {
  return String(lead.id ?? lead._id ?? lead.leadId ?? "");
}

function getLeadSearchText(lead: AdminRecord) {
  return [lead.name, lead.email, lead.phone, lead.status, lead.source, lead.assigned_to, lead.assignedTo, lead.city].filter(Boolean).join(" ").toLowerCase();
}

export function LeadDetailView({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lead, setLead] = useState<AdminRecord | null>(null);
  const [followUps, setFollowUps] = useState<AdminRecord[]>([]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!leadId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [leadResult, followUpResult] = await Promise.all([fetchAdminLead(leadId), fetchAdminLeadFollowUps(leadId)]);
      setLead(leadResult);
      setFollowUps(followUpResult);
      setStatus(String(leadResult.status ?? ""));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load lead detail.");
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    void load();
  }, [load]);

  const followUpTimeline = useMemo(
    () => followUps.map((item) => ({
      title: item.subject ?? item.title ?? item.message ?? "Follow-up",
      description: item.message ?? item.note ?? item.status ?? "CRM follow-up activity",
      meta: item.createdAt ?? item.scheduledAt ?? item.dueAt ?? item.updatedAt,
      status: item.status ?? "pending",
    })),
    [followUps],
  );

  async function saveStatus(nextStatus: string) {
    if (!leadId) {
      return;
    }

    setSaving(true);
    try {
      await updateAdminLeadStatus(leadId, nextStatus);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function markQualified() {
    if (!leadId) {
      return;
    }

    setSaving(true);
    try {
      await qualifyAdminLead(leadId, { status: "qualified" });
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function convertLead() {
    if (!leadId) {
      return;
    }

    setSaving(true);
    try {
      await convertAdminLead(leadId, { createService: true });
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function createFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!leadId || !note.trim()) {
      return;
    }

    setSaving(true);
    try {
      await createAdminLeadFollowUp(leadId, { message: note, subject: `Follow-up: ${getLeadLabel(lead ?? {})}`, status: "pending" });
      setNote("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  if (!leadId) {
    return <EmptyState title="Lead not selected" description="Pick a lead from the CRM table to view conversion history and follow-ups." />;
  }

  if (loading && !lead) {
    return <div className="h-80 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.04]" />;
  }

  if (!lead) {
    return <EmptyState title="Lead not found" description={error ?? "The selected lead could not be loaded."} />;
  }

  return (
    <Panel
      eyebrow="Lead detail"
      title={getLeadLabel(lead)}
      description={lead.email ?? lead.phone ?? lead.source ?? "CRM detail view"}
      actions={(
        <>
          <button type="button" onClick={markQualified} disabled={saving} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/15">Qualified</button>
          <button type="button" onClick={convertLead} disabled={saving} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30">Convert</button>
          <button type="button" onClick={() => void saveStatus("follow-up")} disabled={saving} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30">Move status</button>
        </>
      )}
    >
      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Current status" value={String(lead.status ?? "new")} caption={`Updated ${formatDateTime(lead.updatedAt ?? lead.updated_at ?? lead.createdAt)}`} />
        <SummaryCard label="Source" value={String(lead.source ?? lead.channel ?? "Direct")} caption={lead.assigned_to ?? lead.assignedTo ?? "Unassigned"} accent="amber" />
        <SummaryCard label="Priority" value={String(lead.priority ?? lead.score ?? "Normal")} caption={lead.city ?? lead.location ?? "Unknown region"} accent="rose" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Profile</h3>
          <dl className="space-y-3 text-sm text-slate-200">
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Email</dt><dd className="text-right text-white">{lead.email ?? "?"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Phone</dt><dd className="text-right text-white">{lead.phone ?? "?"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">City</dt><dd className="text-right text-white">{lead.city ?? lead.location ?? "?"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Assigned</dt><dd className="text-right text-white">{lead.assigned_to ?? lead.assignedTo ?? "Unassigned"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Converted client</dt><dd className="text-right text-white">{lead.client_name ?? lead.clientName ?? lead.client_id ?? lead.clientId ?? "?"}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-slate-400">Last action</dt><dd className="text-right text-white">{formatDateTime(lead.updatedAt ?? lead.createdAt)}</dd></div>
          </dl>
          <div className="flex flex-wrap gap-2 pt-2">
            <StatusBadge status={lead.status ?? "new"} />
            {lead.service_status ? <StatusBadge status={lead.service_status} /> : null}
          </div>
        </div>
        <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Follow-ups</h3>
            <p className="text-xs text-slate-500">{followUps.length} records</p>
          </div>
          <form onSubmit={createFollowUp} className="space-y-3 rounded-[20px] border border-white/10 bg-white/[0.02] p-4">
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Add a follow-up</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Call scheduled for tomorrow, share GST checklist, etc." />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="submit" disabled={saving || !note.trim()} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50">Add follow-up</button>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none">
                <option value="">Change status</option>
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="follow-up">Follow-up</option>
                <option value="lost">Lost</option>
              </select>
              <button type="button" onClick={() => void saveStatus(status)} disabled={saving || !status} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50">Save status</button>
            </div>
          </form>
          {followUpTimeline.length ? <StackList items={followUpTimeline} /> : <EmptyState title="No follow-ups yet" description="Follow-up activity will appear here after a touchpoint is logged." />}
        </div>
      </div>
    </Panel>
  );
}

export function CrmModule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [leads, setLeads] = useState<AdminRecord[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAdminLeads({ search, status, page, limit: 25 });
      setLeads(result.items);
      setSelectedLeadId((current) => current || getLeadId(result.items[0] ?? {}));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load leads.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const pipelineCounts = useMemo(() => ({
    new: leads.filter((lead) => String(lead.status ?? "").toLowerCase() === "new").length,
    qualified: leads.filter((lead) => String(lead.status ?? "").toLowerCase() === "qualified").length,
    converted: leads.filter((lead) => String(lead.status ?? "").toLowerCase() === "converted").length,
  }), [leads]);

  return (
    <div className="space-y-6">
      <Panel
        eyebrow="CRM panel"
        title="Lead management and conversion"
        description="Search, qualify, convert, and follow up on leads without leaving the admin workflow."
        actions={(
          <>
            <button type="button" onClick={() => void loadLeads()} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/50">Reload</button>
            <button type="button" onClick={() => setSearch("")} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/50">Clear search</button>
          </>
        )}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="New" value={String(pipelineCounts.new)} caption="Fresh CRM entries" />
          <SummaryCard label="Qualified" value={String(pipelineCounts.qualified)} caption="Ready for conversion" accent="amber" />
          <SummaryCard label="Converted" value={String(pipelineCounts.converted)} caption="Clients created" accent="emerald" />
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel eyebrow="Lead table" title="Pipeline list" description="Search, filter, and page through CRM records.">
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_200px_120px]">
            <label className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Search</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="mt-2 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Name, email, service..." />
            </label>
            <label className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full bg-transparent text-sm text-white outline-none">
                <option value="">All</option>
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </label>
            <label className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Page</span>
              <input type="number" min={1} value={page} onChange={(event) => setPage(Number(event.target.value) || 1)} className="mt-2 w-full bg-transparent text-sm text-white outline-none" />
            </label>
          </div>
          {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-[18px] border border-white/10 bg-white/[0.04]" />)}
            </div>
          ) : leads.length ? (
            <div className="space-y-2">
              {leads.map((lead) => {
                const leadId = getLeadId(lead);
                const active = leadId === selectedLeadId;
                return (
                  <button key={leadId || lead.email || lead.name} type="button" onClick={() => setSelectedLeadId(leadId)} className={`w-full rounded-[18px] border px-4 py-4 text-left transition ${active ? "border-emerald-400/50 bg-emerald-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{getLeadLabel(lead)}</p>
                        <p className="mt-1 text-sm text-slate-300">{lead.email ?? lead.phone ?? lead.source ?? "Lead info"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={lead.status ?? "new"} />
                        {lead.convertedAt ? <span className="text-xs text-slate-400">Converted {formatDateTime(lead.convertedAt)}</span> : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No leads found" description="Try another keyword or reset the filter to load more CRM records." />
          )}
        </Panel>

        <LeadDetailView leadId={selectedLeadId} />
      </div>
    </div>
  );
}
