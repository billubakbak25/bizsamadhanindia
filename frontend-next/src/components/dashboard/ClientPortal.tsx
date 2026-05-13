"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { CaptchaPlaceholder } from "@/components/auth/CaptchaPlaceholder";
import { ApiHealthChip } from "@/components/ui/ApiHealthChip";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ClientDocumentsPanel } from "@/components/dashboard/ClientDocumentsPanel";
import { ApiError, apiJson, unwrapData } from "@/lib/api";

const TOKEN_STORAGE_KEY = "bizsamadhan.client.token";
const RESEND_COOLDOWN_SECONDS = 30;

type Envelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

type PortalDashboard = {
  client?: { name?: string; phone?: string; email?: string };
  metrics?: {
    totalPayments?: number;
    totalRevenue?: number;
    activeServices?: number;
    totalDocuments?: number;
    totalSubscriptions?: number;
    totalConsultations?: number;
    openTickets?: number;
  };
};

type CollectionItem = Record<string, unknown>;

type ClientServiceSummary = {
  id: string;
  name: string;
  status: string;
  currentStep: string;
  category: string;
  reference: string;
  updatedAt: string;
};

function authHeaders(token: string): Record<string, string> {
  return token ? { Authorization: "Bearer " + token } : {};
}

function normalizeLoginEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeCollection(payload: Envelope<CollectionItem[] | { items?: CollectionItem[] }> | null | undefined) {
  const data = payload ? unwrapData(payload) : null;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object" && Array.isArray((data as { items?: CollectionItem[] }).items)) {
    return (data as { items?: CollectionItem[] }).items || [];
  }

  return [] as CollectionItem[];
}

function parseRecord(value: unknown): CollectionItem | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as CollectionItem;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as CollectionItem;
      }
    } catch {
      return null;
    }
  }

  return null;
}

function pickValue(record: CollectionItem | null | undefined, keys: string[]) {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

function pickNestedRecord(record: CollectionItem | null | undefined, keys: string[]) {
  for (const key of keys) {
    const nestedRecord = parseRecord(record?.[key]);
    if (nestedRecord) {
      return nestedRecord;
    }
  }

  return null;
}

function formatPortalDate(value: unknown) {
  if (!value) {
    return "Awaiting sync";
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function serviceUpdatedAt(service: ClientServiceSummary) {
  const timestamp = new Date(service.updatedAt || 0).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function normalizeClientService(item: CollectionItem): ClientServiceSummary {
  const metadata = parseRecord(item.metadata);
  const workflow = pickNestedRecord(metadata, ["workflow", "workflowInstance", "execution"]);
  const serviceMeta = pickNestedRecord(metadata, ["service", "details"]);

  return {
    id: pickValue(item, ["id", "serviceId", "_id"]) || [pickValue(item, ["name", "service_name", "serviceName"]), pickValue(item, ["updatedAt", "updated_at", "createdAt", "created_at"])].filter(Boolean).join("-"),
    name: pickValue(item, ["service_name", "serviceName", "name"]) || "Service",
    status: pickValue(item, ["status"]) || "pending",
    currentStep: pickValue(workflow, ["currentStepLabel", "currentStepTitle", "currentStepName", "currentStepCode"]) || pickValue(metadata, ["currentStepLabel", "currentStep", "workflowStep"]) || "Workflow step will appear here once the service progresses.",
    category: pickValue(serviceMeta, ["categoryLabel", "category", "serviceCategory"]) || pickValue(metadata, ["categoryLabel", "category", "serviceCategory"]),
    reference: pickValue(item, ["orderId", "order_id", "paymentId", "payment_id"]),
    updatedAt: pickValue(item, ["updatedAt", "updated_at", "createdAt", "created_at"]) || pickValue(workflow, ["lastStatusChangedAt", "updatedAt", "createdAt"]),
  };
}

export function ClientPortal() {
  const [token, setToken] = useState(() => (typeof window === "undefined" ? "" : window.localStorage.getItem(TOKEN_STORAGE_KEY) || ""));
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSentTo, setOtpSentTo] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [authStatus, setAuthStatus] = useState("Use email OTP login to access your client workspace.");
  const [isBusy, setIsBusy] = useState(false);
  const [resendReadyAt, setResendReadyAt] = useState(0);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [dashboard, setDashboard] = useState<PortalDashboard | null>(null);
  const [payments, setPayments] = useState<CollectionItem[]>([]);
  const [services, setServices] = useState<CollectionItem[]>([]);
  const [documents, setDocuments] = useState<CollectionItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<CollectionItem[]>([]);
  const [consultations, setConsultations] = useState<CollectionItem[]>([]);
  const [tickets, setTickets] = useState<CollectionItem[]>([]);
  const [ticketForm, setTicketForm] = useState({ subject: "", category: "general", priority: "normal", message: "" });
  const [ticketStatus, setTicketStatus] = useState("Create support tickets directly from the portal.");
  const [uploadStatus, setUploadStatus] = useState("Upload documents after signing in.");
  const [documentType, setDocumentType] = useState("general");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const serviceSummaries = useMemo(() => services.map(normalizeClientService).sort((left, right) => serviceUpdatedAt(right) - serviceUpdatedAt(left)), [services]);
  const recentServiceUpdates = serviceSummaries.slice(0, 5);
  const normalizedEmail = normalizeLoginEmail(email);
  const activeEmail = otpSentTo || normalizedEmail;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      return;
    }

    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, [token]);

  useEffect(() => {
    if (!resendReadyAt) {
      setResendCountdown(0);
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((resendReadyAt - Date.now()) / 1000));
      setResendCountdown(remaining);
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [resendReadyAt]);

  async function loadPortal(currentToken: string) {
    try {
      const [dashboardPayload, paymentsPayload, servicesPayload, documentsPayload, subscriptionsPayload, consultationsPayload, ticketsPayload] = await Promise.all([
        apiJson<Envelope<PortalDashboard>>("/client/dashboard", { cache: "no-store", headers: authHeaders(currentToken) }, { label: "portal.dashboard" }),
        apiJson<Envelope<CollectionItem[]>>("/client/payments", { cache: "no-store", headers: authHeaders(currentToken) }, { label: "portal.payments" }),
        apiJson<Envelope<CollectionItem[]>>("/client/services", { cache: "no-store", headers: authHeaders(currentToken) }, { label: "portal.services" }),
        apiJson<Envelope<CollectionItem[]>>("/client/documents", { cache: "no-store", headers: authHeaders(currentToken) }, { label: "portal.documents" }),
        apiJson<Envelope<{ items?: CollectionItem[] }>>("/client/subscriptions", { cache: "no-store", headers: authHeaders(currentToken) }, { label: "portal.subscriptions" }),
        apiJson<Envelope<{ items?: CollectionItem[] }>>("/client/consultations", { cache: "no-store", headers: authHeaders(currentToken) }, { label: "portal.consultations" }),
        apiJson<Envelope<{ items?: CollectionItem[] }>>("/client/tickets", { cache: "no-store", headers: authHeaders(currentToken) }, { label: "portal.tickets" }),
      ]);

      setDashboard(unwrapData(dashboardPayload) || null);
      setPayments(normalizeCollection(paymentsPayload));
      setServices(normalizeCollection(servicesPayload));
      setDocuments(normalizeCollection(documentsPayload));
      setSubscriptions(normalizeCollection(subscriptionsPayload));
      setConsultations(normalizeCollection(consultationsPayload));
      setTickets(normalizeCollection(ticketsPayload));
      setAuthStatus("Client workspace synced with Railway.");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setToken("");
        setDashboard(null);
        setPayments([]);
        setServices([]);
        setDocuments([]);
        setSubscriptions([]);
        setConsultations([]);
        setTickets([]);
        setAuthStatus("Session expired. Please verify your email OTP again.");
        return;
      }

      setAuthStatus(error instanceof Error ? error.message : "Unable to load client workspace.");
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadPortal(token);
  }, [token]);

  function startCooldown(seconds = RESEND_COOLDOWN_SECONDS) {
    setResendReadyAt(Date.now() + (seconds * 1000));
  }

  function requestOtp(targetEmail: string) {
    const nextEmail = normalizeLoginEmail(targetEmail);
    if (!captchaVerified) {
      setAuthStatus("Complete the CAPTCHA placeholder check before requesting an OTP.");
      return;
    }

    setIsBusy(true);
    setAuthStatus("Sending OTP to your email...");

    startTransition(async () => {
      try {
        const payload = await apiJson<Envelope<{ cooldownSeconds?: number }>>(
          "/api/auth/send-otp-email",
          {
            method: "POST",
            json: {
              email: nextEmail,
              captchaToken: captchaVerified ? "placeholder-ok" : "",
            },
          },
          { label: "portal.sendOtpEmail" },
        );

        const data = unwrapData(payload) || {};
        setOtpSentTo(nextEmail);
        startCooldown(Number(data.cooldownSeconds) || RESEND_COOLDOWN_SECONDS);
        setAuthStatus(payload.message || `OTP sent to ${nextEmail}.`);
      } catch (error) {
        setAuthStatus(error instanceof Error ? error.message : "Unable to send OTP.");
      } finally {
        setIsBusy(false);
      }
    });
  }

  function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    requestOtp(email);
  }

  function handleResendOtp() {
    if (!activeEmail || resendCountdown > 0) {
      return;
    }

    requestOtp(activeEmail);
  }

  function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setAuthStatus("Verifying OTP...");

    startTransition(async () => {
      try {
        const payload = await apiJson<Envelope<{ accessToken: string }>>(
          "/api/auth/verify-otp-email",
          { method: "POST", json: { email: activeEmail, otp } },
          { label: "portal.verifyOtpEmail" },
        );

        const data = unwrapData(payload);
        setToken(data?.accessToken || "");
        setOtp("");
        setAuthStatus("Email verified. Signing you in...");
      } catch (error) {
        setAuthStatus(error instanceof Error ? error.message : "OTP verification failed.");
      } finally {
        setIsBusy(false);
      }
    });
  }

  function handleLogout() {
    setToken("");
    setDashboard(null);
    setPayments([]);
    setServices([]);
    setDocuments([]);
    setSubscriptions([]);
    setConsultations([]);
    setTickets([]);
    setOtpSentTo("");
    setOtp("");
    setCaptchaVerified(false);
    setAuthStatus("Signed out of the client portal.");
  }

  function handleTicketSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setTicketStatus("Verify email OTP before creating a ticket.");
      return;
    }

    setTicketStatus("Creating support ticket...");

    startTransition(async () => {
      try {
        const payload = await apiJson<Envelope<CollectionItem>>(
          "/client/tickets",
          {
            method: "POST",
            headers: authHeaders(token),
            json: ticketForm,
          },
          { label: "portal.createTicket" },
        );

        setTicketForm({ subject: "", category: "general", priority: "normal", message: "" });
        setTicketStatus(payload.message || "Support ticket created successfully.");
        await loadPortal(token);
      } catch (error) {
        setTicketStatus(error instanceof Error ? error.message : "Unable to create support ticket.");
      }
    });
  }

  function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !uploadFile) {
      setUploadStatus("Choose a file after verifying email OTP.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("document_type", documentType);

    setUploadStatus("Uploading document...");

    startTransition(async () => {
      try {
        const payload = await apiJson<Envelope<CollectionItem>>(
          "/client/documents/upload",
          {
            method: "POST",
            headers: authHeaders(token),
            body: formData,
          },
          { label: "portal.uploadDocument" },
        );

        setUploadFile(null);
        setUploadStatus(payload.message || "Document uploaded successfully.");
        await loadPortal(token);
      } catch (error) {
        setUploadStatus(error instanceof Error ? error.message : "Unable to upload document.");
      }
    });
  }

  if (!token) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card className="p-6 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Client portal</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">Secure email OTP sign-in</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Enter your email, complete the lightweight CAPTCHA placeholder, receive a 6-digit code, and continue into your client workspace.</p>
            </div>
            <ApiHealthChip label="Railway API" />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <form className="space-y-4" onSubmit={handleSendOtp}>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Step 1</p>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]"
                    placeholder="name@company.com"
                    required
                  />
                </label>
              </div>
              <CaptchaPlaceholder checked={captchaVerified} disabled={isBusy} onChange={setCaptchaVerified} />
              <Button type="submit" disabled={isBusy || !normalizedEmail || !captchaVerified}>{isBusy ? "Sending..." : "Send OTP"}</Button>
            </form>
            <form className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5" onSubmit={handleVerifyOtp}>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Step 2</p>
                <p className="text-sm leading-7 text-slate-600">{activeEmail ? `Enter the code sent to ${activeEmail}.` : "Send an OTP first, then enter the 6-digit code here."}</p>
              </div>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>6-digit OTP</span>
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 tracking-[0.35em] outline-none transition focus:border-[var(--brand)]"
                  placeholder="123456"
                  inputMode="numeric"
                  disabled={!activeEmail}
                  required
                />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="submit" disabled={isBusy || !activeEmail || otp.length !== 6}>{isBusy ? "Verifying..." : "Verify and continue"}</Button>
                <Button type="button" variant="secondary" onClick={handleResendOtp} disabled={isBusy || !activeEmail || resendCountdown > 0}>
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend OTP"}
                </Button>
              </div>
            </form>
          </div>
          <p className="mt-5 text-sm text-slate-600">{authStatus}</p>
        </Card>
        <Card className="p-6 sm:p-7">
          <h2 className="text-2xl font-semibold text-slate-950">What the portal includes</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
            <li>Payments, services, documents, consultations, and ticket visibility</li>
            <li>Email OTP entry backed by the existing JWT-authenticated client session</li>
            <li>Resend cooldown, expiry checks, and rate limiting for production-safe access</li>
          </ul>
        </Card>
      </div>
    );
  }

  const contactLine = [dashboard?.client?.email || activeEmail, dashboard?.client?.phone].filter(Boolean).join(" | ");

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Authenticated workspace</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Welcome back, {dashboard?.client?.name || "client"}</h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">{contactLine || "Client profile synced"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ApiHealthChip label="Railway API" />
            <Button variant="secondary" onClick={() => void loadPortal(token)}>Refresh data</Button>
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">{authStatus}</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Payments</p><p className="mt-3 text-3xl font-semibold text-slate-950">{dashboard?.metrics?.totalPayments || 0}</p></Card>
        <Card className="p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Revenue</p><p className="mt-3 text-3xl font-semibold text-slate-950">Rs {Math.round(dashboard?.metrics?.totalRevenue || 0).toLocaleString("en-IN")}</p></Card>
        <Card className="p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Active services</p><p className="mt-3 text-3xl font-semibold text-slate-950">{dashboard?.metrics?.activeServices || 0}</p></Card>
        <Card className="p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Open tickets</p><p className="mt-3 text-3xl font-semibold text-slate-950">{dashboard?.metrics?.openTickets || 0}</p></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-950">Services</h2>
          <div className="mt-5 space-y-3">
            {serviceSummaries.length ? serviceSummaries.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{item.name}</p>
                    <p className="mt-1 text-slate-500">{item.currentStep}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">{item.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  {item.category ? <span>Category: {item.category}</span> : null}
                  {item.reference ? <span>Reference: {item.reference}</span> : null}
                  <span>Updated: {formatPortalDate(item.updatedAt)}</span>
                </div>
              </div>
            )) : <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">No services are linked to this client yet.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-950">Recent service updates</h2>
          <div className="mt-5 space-y-3">
            {recentServiceUpdates.length ? recentServiceUpdates.map((item) => (
              <div key={item.id + "-update"} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-950">{item.name}</p>
                <p className="mt-1 text-slate-500">Status: {item.status}</p>
                <p className="mt-1 text-slate-500">Step: {item.currentStep}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">Last sync {formatPortalDate(item.updatedAt)}</p>
              </div>
            )) : <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">Service timeline updates will appear here as soon as your services sync.</p>}
          </div>
        </Card>

        <ClientDocumentsPanel documents={documents} totalDocuments={dashboard?.metrics?.totalDocuments} className="xl:col-span-2" />

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-950">Consultations</h2>
          <div className="mt-5 space-y-3">
            {consultations.slice(0, 5).map((item, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-950">{String(item.service || item.consultationType || "Consultation")}</p>
                <p className="mt-1 text-slate-500">{String(item.status || "scheduled")} | {String(item.preferredDate || item.preferred_date || "-")}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-950">Recent tickets</h2>
          <div className="mt-5 space-y-3">
            {tickets.slice(0, 5).map((item, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-950">{String(item.subject || "Support ticket")}</p>
                <p className="mt-1 text-slate-500">{String(item.status || "open")} | {String(item.priority || "normal")}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-950">Create support ticket</h2>
          <form className="mt-5 space-y-4" onSubmit={handleTicketSubmit}>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Subject</span>
              <input value={ticketForm.subject} onChange={(event) => setTicketForm((current) => ({ ...current, subject: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Category</span>
                <select value={ticketForm.category} onChange={(event) => setTicketForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]">
                  <option value="general">General</option>
                  <option value="billing">Billing</option>
                  <option value="consultation">Consultation</option>
                  <option value="document">Document</option>
                  <option value="service">Service</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Priority</span>
                <select value={ticketForm.priority} onChange={(event) => setTicketForm((current) => ({ ...current, priority: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>
            </div>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Message</span>
              <textarea value={ticketForm.message} onChange={(event) => setTicketForm((current) => ({ ...current, message: event.target.value }))} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">{ticketStatus}</p>
              <Button type="submit">Create ticket</Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-950">Upload document</h2>
          <form className="mt-5 space-y-4" onSubmit={handleUpload}>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Document type</span>
              <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]">
                <option value="general">General</option>
                <option value="invoice">Invoice</option>
                <option value="compliance">Compliance</option>
                <option value="identity">Identity</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Choose file</span>
              <input type="file" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">{uploadStatus}</p>
              <Button type="submit">Upload</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
