"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ApiHealthChip } from "@/components/ui/ApiHealthChip";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AdminDocumentReviewPanel } from "@/components/dashboard/AdminDocumentReviewPanel";
import { ApiError, unwrapData } from "@/lib/api";
import { adminGet, adminPost } from "@/lib/apiClient";

type AdminSession = {
  authenticated: boolean;
  admin: {
    username: string;
    authenticatedAt: string;
  } | null;
};

type Envelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

type AdminLead = {
  id: number | string;
  name?: string;
  service?: string;
  phone?: string;
  status?: string;
  timestamp?: string;
  createdAt?: string;
};

type AdminConsultation = {
  id: number | string;
  name?: string;
  service?: string;
  status?: string;
  preferredDate?: string;
  preferredSlot?: string;
};

type AdminTicket = {
  id: number | string;
  subject?: string;
  status?: string;
  priority?: string;
  client?: {
    name?: string;
  };
};

type AdminClient = {
  id: number | string;
  name?: string;
  phone?: string;
  email?: string;
  summary?: {
    services?: { active?: number };
    payments?: { total?: number };
  };
};

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function normalizeCollection<T>(payload: Envelope<T[] | { items?: T[] }> | null | undefined) {
  const data = payload ? unwrapData(payload) : null;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object" && Array.isArray((data as { items?: T[] }).items)) {
    return (data as { items?: T[] }).items || [];
  }

  return [] as T[];
}

function extractOverviewCards(record: Record<string, unknown>, prefix = ""): Array<{ label: string; value: string }> {
  return Object.entries(record).flatMap(([key, value]) => {
    const label = `${prefix}${key}`;

    if (typeof value === "number") {
      return [{ label, value: value.toLocaleString("en-IN") }];
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return extractOverviewCards(value as Record<string, unknown>, `${label}.`);
    }

    return [] as { label: string; value: string }[];
  });
}

export function AdminDashboard() {
  const [session, setSession] = useState<AdminSession>({ authenticated: false, admin: null });
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [status, setStatus] = useState("Checking admin session...");
  const [isBusy, setIsBusy] = useState(false);
  const [overview, setOverview] = useState<Record<string, unknown>>({});
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [consultations, setConsultations] = useState<AdminConsultation[]>([]);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [clients, setClients] = useState<AdminClient[]>([]);

  const overviewCards = useMemo(() => extractOverviewCards(overview).slice(0, 8), [overview]);

  async function loadSession() {
    const payload = await adminGet<AdminSession>("/session", { cache: "no-store" }, "admin.session");
    setSession(payload);
    setStatus(payload.authenticated ? "Admin session active." : "Admin login required.");
    return payload;
  }

  async function loadDashboard() {
    try {
      const [overviewPayload, leadsPayload, consultationsPayload, ticketsPayload, clientsPayload] = await Promise.all([
        adminGet<Envelope<Record<string, unknown>>>("/overview", { cache: "no-store" }, "admin.overview"),
        adminGet<Envelope<AdminLead[]>>("/leads", { cache: "no-store" }, "admin.leads"),
        adminGet<Envelope<AdminConsultation[]>>("/consultations", { cache: "no-store" }, "admin.consultations"),
        adminGet<Envelope<AdminTicket[]>>("/tickets", { cache: "no-store" }, "admin.tickets"),
        adminGet<Envelope<AdminClient[]>>("/clients", { cache: "no-store" }, "admin.clients"),
      ]);

      setOverview(unwrapData(overviewPayload) || {});
      setLeads(normalizeCollection(leadsPayload));
      setConsultations(normalizeCollection(consultationsPayload));
      setTickets(normalizeCollection(ticketsPayload));
      setClients(normalizeCollection(clientsPayload));
      setStatus("Admin console synced with Railway.");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setSession({ authenticated: false, admin: null });
        setStatus("Admin session expired. Please log in again.");
        return;
      }

      setStatus(error instanceof Error ? error.message : "Unable to load admin dashboard.");
    }
  }

  useEffect(() => {
    loadSession().catch((error) => {
      setStatus(error instanceof Error ? error.message : "Unable to verify admin session.");
    });
  }, []);

  useEffect(() => {
    if (!session.authenticated) {
      return;
    }

    loadDashboard();
  }, [session.authenticated]);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setStatus("Signing in...");

    startTransition(async () => {
      try {
        await adminPost<{ message?: string }>("/login", { json: credentials }, "admin.login");

        const nextSession = await loadSession();
        if (nextSession.authenticated) {
          await loadDashboard();
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Invalid admin credentials.");
      } finally {
        setIsBusy(false);
      }
    });
  }

  function handleLogout() {
    setIsBusy(true);
    setStatus("Signing out...");

    startTransition(async () => {
      try {
        await adminPost<{ message?: string }>("/logout", {}, "admin.logout");
        setSession({ authenticated: false, admin: null });
        setOverview({});
        setLeads([]);
        setConsultations([]);
        setTickets([]);
        setClients([]);
        setStatus("Signed out successfully.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to sign out.");
      } finally {
        setIsBusy(false);
      }
    });
  }

  if (!session.authenticated) {
    return (
      <Card className="p-6 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Admin control room</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Secure admin access</h1>
          </div>
          <ApiHealthChip label="Railway API" />
        </div>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleLogin}>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Username</span>
            <input value={credentials.username} onChange={(event) => setCredentials((current) => ({ ...current, username: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Password</span>
            <input value={credentials.password} onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))} type="password" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
          </label>
          <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">{status}</p>
            <Button type="submit" disabled={isBusy}>{isBusy ? "Signing in..." : "Login to admin"}</Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Authenticated admin</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Operations dashboard</h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">Signed in as {session.admin?.username || "admin"}. Overview, leads, consultations, clients, and tickets are loaded from the live Railway API.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ApiHealthChip label="Railway API" />
            <Button variant="secondary" onClick={() => loadDashboard()}>Refresh data</Button>
            <Button variant="ghost" onClick={handleLogout} disabled={isBusy}>Logout</Button>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">{status}</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <Card key={card.label} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label.replace(/_/g, " ")}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-950">Latest leads</h2>
          <div className="mt-5 space-y-3">
            {leads.slice(0, 6).map((lead) => (
              <div key={lead.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-950">{lead.name || "Lead"}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{lead.status || "new"}</span>
                </div>
                <p className="mt-2">{lead.service || "Service enquiry"}</p>
                <p className="mt-1 text-slate-500">{lead.phone || "-"} | {formatDate(lead.timestamp || lead.createdAt)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-950">Consultation requests</h2>
          <div className="mt-5 space-y-3">
            {consultations.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-950">{item.name || "Consultation"}</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{item.status || "requested"}</span>
                </div>
                <p className="mt-2">{item.service || "General consultation"}</p>
                <p className="mt-1 text-slate-500">{item.preferredDate || "-"} | {item.preferredSlot || "Slot pending"}</p>
              </div>
            ))}
          </div>
        </Card>

        <AdminDocumentReviewPanel className="xl:col-span-2" />

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-950">Support tickets</h2>
          <div className="mt-5 space-y-3">
            {tickets.slice(0, 6).map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-950">{ticket.subject || "Support ticket"}</span>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{ticket.priority || "normal"}</span>
                </div>
                <p className="mt-2">Client: {ticket.client?.name || "Unknown client"}</p>
                <p className="mt-1 text-slate-500">Status: {ticket.status || "open"}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-950">Client portfolio</h2>
          <div className="mt-5 space-y-3">
            {clients.slice(0, 6).map((client) => (
              <div key={client.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-950">{client.name || "Client"}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{client.summary?.services?.active || 0} active services</span>
                </div>
                <p className="mt-2">{client.phone || "-"} | {client.email || "No email"}</p>
                <p className="mt-1 text-slate-500">Payments: {client.summary?.payments?.total || 0}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

