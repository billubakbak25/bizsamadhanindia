
"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { fetchAdminService, fetchAdminServices, uploadAdminDocumentForService, type AdminRecord } from "@/lib/adminData";
import { EmptyState, Panel, StatusBadge, SummaryCard, formatDateTime } from "./shared";

function serviceIdOf(service: AdminRecord) {
  return String(service.id ?? service._id ?? service.serviceId ?? "");
}

function documentList(service: AdminRecord) {
  const docs = Array.isArray(service.documents) ? service.documents : Array.isArray(service.documentList) ? service.documentList : [];
  return docs as AdminRecord[];
}

export function DocumentsModule() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<AdminRecord[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedService, setSelectedService] = useState<AdminRecord | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAdminServices({ limit: 100 });
      setServices(result.items);
      setSelectedServiceId((current) => current || serviceIdOf(result.items[0] ?? {}));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load services for documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSelected = useCallback(async () => {
    if (!selectedServiceId) {
      setSelectedService(null);
      return;
    }

    const detail = await fetchAdminService(selectedServiceId);
    setSelectedService(detail);
  }, [selectedServiceId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadSelected().catch(() => undefined);
  }, [loadSelected]);

  const visibleServices = useMemo(() => services.filter((service) => [service.name, service.title, service.category, service.client_name, service.clientName].filter(Boolean).join(" ").toLowerCase().includes(serviceSearch.toLowerCase())), [services, serviceSearch]);
  const docs = selectedService ? documentList(selectedService) : [];

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedServiceId || !file) {
      return;
    }

    setSaving(true);
    try {
      await uploadAdminDocumentForService(selectedServiceId, file, { title, tags, notes });
      setTitle("");
      setTags("");
      setNotes("");
      setFile(null);
      await loadSelected();
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Panel eyebrow="Document management" title="Service-linked uploads" description="Upload, tag, preview, and track documents against a specific service record." actions={<button type="button" onClick={() => void load()} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/50">Reload</button>}>
        {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Services" value={String(services.length)} caption="Available for document uploads" />
          <SummaryCard label="Documents" value={String(docs.length)} caption="Linked to selected service" accent="amber" />
          <SummaryCard label="Selected" value={selectedServiceId ? selectedServiceId.slice(0, 8) : "?"} caption="Service context" accent="rose" />
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel eyebrow="Service picker" title="Choose a service" description="Select the service whose documents you want to manage.">
          <label className="block rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Search services</span>
            <input value={serviceSearch} onChange={(event) => setServiceSearch(event.target.value)} className="mt-2 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Service, client, category..." />
          </label>
          <div className="mt-4 space-y-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-[18px] border border-white/10 bg-white/[0.04]" />)
            ) : visibleServices.length ? (
              visibleServices.map((service) => {
                const id = serviceIdOf(service);
                const active = id === selectedServiceId;
                return (
                  <button key={id || service.name} type="button" onClick={() => setSelectedServiceId(id)} className={`w-full rounded-[18px] border px-4 py-4 text-left transition ${active ? "border-emerald-400/50 bg-emerald-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{service.name ?? service.title ?? "Service"}</p>
                        <p className="mt-1 text-sm text-slate-300">{service.category ?? service.client_name ?? service.clientName ?? "Service record"}</p>
                      </div>
                      <StatusBadge status={service.status ?? "pending"} />
                    </div>
                  </button>
                );
              })
            ) : (
              <EmptyState title="No services found" description="The selected search phrase does not match any service records." />
            )}
          </div>
        </Panel>

        <Panel eyebrow="Documents" title="Upload and review" description="Upload a file with tags and notes, then inspect the service document list.">
          <form onSubmit={submitUpload} className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2 text-sm text-slate-200">
                <span>Document title</span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="GST certificate, signed draft, etc." />
              </label>
              <label className="block space-y-2 text-sm text-slate-200">
                <span>Tags</span>
                <input value={tags} onChange={(event) => setTags(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="gst, draft, urgent" />
              </label>
            </div>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Notes</span>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Any context for the staff member reviewing this file." />
            </label>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>File</span>
              <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="block w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-100" />
            </label>
            <button type="submit" disabled={saving || !selectedServiceId || !file} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Uploading..." : "Upload document"}</button>
          </form>

          <div className="mt-6 space-y-3">
            {docs.length ? docs.map((document: AdminRecord) => (
              <div key={document.id ?? document._id ?? document.name} className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{document.name ?? document.title ?? document.fileName ?? "Document"}</p>
                    <p className="mt-1 text-sm text-slate-300">{document.tags ?? document.tag ?? document.type ?? "Service document"}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(document.createdAt ?? document.uploadedAt ?? document.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={document.status ?? "uploaded"} />
                    {document.url ?? document.downloadUrl ? <a href={String(document.url ?? document.downloadUrl)} className="text-xs font-semibold text-emerald-300">Download</a> : null}
                  </div>
                </div>
              </div>
            )) : <EmptyState title="No documents yet" description="Select a service and upload the first file to start the document timeline." />}
          </div>
        </Panel>
      </div>

      {selectedService ? (
        <Panel eyebrow="Service context" title={selectedService.name ?? selectedService.title ?? selectedServiceId} description="The selected service record that owns the document timeline.">
          <dl className="grid gap-3 md:grid-cols-3 text-sm text-slate-200">
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4"><dt className="text-slate-400">Client</dt><dd className="mt-1 text-white">{selectedService.client_name ?? selectedService.clientName ?? "?"}</dd></div>
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4"><dt className="text-slate-400">Category</dt><dd className="mt-1 text-white">{selectedService.category ?? "?"}</dd></div>
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4"><dt className="text-slate-400">Updated</dt><dd className="mt-1 text-white">{formatDateTime(selectedService.updatedAt ?? selectedService.updated_at ?? selectedService.createdAt)}</dd></div>
          </dl>
        </Panel>
      ) : null}
    </div>
  );
}
