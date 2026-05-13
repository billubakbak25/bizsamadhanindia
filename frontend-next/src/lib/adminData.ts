export type AdminRecord = Record<string, any>;

export type AdminListResult<T extends AdminRecord> = {
  items: T[];
  meta: AdminRecord;
  raw: AdminRecord;
};

export type AdminGlobalSearchResult = {
  leads: AdminRecord[];
  clients: AdminRecord[];
  services: AdminRecord[];
};

import { adminGet, adminPatch, adminPost, adminQuery, apiFetch, normalizeAdminPath } from "@/lib/apiClient";

function unwrapValue(value: any) {
  if (value && typeof value === "object") {
    for (const key of ["data", "result", "payload", "item"]) {
      if (value[key] !== undefined) {
        return value[key];
      }
    }
  }
  return value;
}

function normalizeArray<T extends AdminRecord>(value: any): T[] {
  const unwrapped = unwrapValue(value);
  if (Array.isArray(unwrapped)) {
    return unwrapped as T[];
  }

  if (unwrapped && typeof unwrapped === "object") {
    for (const key of ["items", "rows", "results", "data"]) {
      if (Array.isArray(unwrapped[key])) {
        return unwrapped[key] as T[];
      }
    }
  }

  return [];
}

function normalizeObject<T extends AdminRecord>(value: any): T {
  const unwrapped = unwrapValue(value);
  if (unwrapped && typeof unwrapped === "object" && !Array.isArray(unwrapped)) {
    return unwrapped as T;
  }

  return {} as T;
}

function normalizeList<T extends AdminRecord>(value: any): AdminListResult<T> {
  const raw = normalizeObject<AdminRecord>(value);
  return {
    items: normalizeArray<T>(value),
    meta: normalizeObject<AdminRecord>(raw.meta ?? raw.pagination ?? raw.pageInfo ?? raw),
    raw,
  };
}

async function requestJson(path: string, init: RequestInit) {
  const response = await apiFetch(normalizeAdminPath(path), {
    ...init,
    credentials: init.credentials ?? "include",
  }, { label: `admin.requestJson:${path}` });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return { ok: true };
}

function adminSearchText(record: AdminRecord) {
  return [
    record.name,
    record.title,
    record.email,
    record.phone,
    record.status,
    record.category,
    record.city,
    record.client_name,
    record.clientName,
    record.code,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export async function fetchAdminDashboard() {
  const [dashboard, revenue, conversions, pendingWork, topServices] = await Promise.all([
    adminGet<any>("/metrics/dashboard", {}, "admin.dashboard"),
    adminGet<any>("/metrics/revenue", {}, "admin.revenue"),
    adminGet<any>("/metrics/conversions", {}, "admin.conversions"),
    adminGet<any>("/metrics/pending-work", {}, "admin.pendingWork"),
    adminGet<any>("/metrics/top-services", {}, "admin.topServices"),
  ]);

  return {
    dashboard: normalizeObject(dashboard),
    revenue: normalizeObject(revenue),
    conversions: normalizeObject(conversions),
    pendingWork: normalizeObject(pendingWork),
    topServices: normalizeArray(topServices),
  };
}

export async function fetchAdminLeads(params: { search?: string; status?: string; page?: number; limit?: number } = {}) {
  const path = adminQuery("/crm/leads", {
    search: params.search,
    query: params.search,
    status: params.status,
    page: params.page,
    limit: params.limit,
  });

  return normalizeList<AdminRecord>(await adminGet<any>(path, {}, "admin.crm.leads"));
}

export async function fetchAdminLead(leadId: string) {
  return normalizeObject<AdminRecord>(await adminGet<any>(`/crm/leads/${leadId}`, {}, "admin.crm.lead"));
}

export async function qualifyAdminLead(leadId: string, payload: AdminRecord = {}) {
  return normalizeObject<AdminRecord>(await adminPost<any>(`/crm/leads/${leadId}/qualify`, { json: payload }, "admin.crm.qualify"));
}

export async function convertAdminLead(leadId: string, payload: AdminRecord = {}) {
  return normalizeObject<AdminRecord>(await adminPost<any>(`/crm/leads/${leadId}/convert`, { json: payload }, "admin.crm.convert"));
}

export async function updateAdminLeadStatus(leadId: string, status: string) {
  return normalizeObject<AdminRecord>(await adminPatch<any>(`/crm/leads/${leadId}/status`, { json: { status } }, "admin.crm.status"));
}

export async function fetchAdminLeadFollowUps(leadId: string) {
  return normalizeArray<AdminRecord>(await adminGet<any>(`/crm/leads/${leadId}/follow-ups`, {}, "admin.crm.followUps"));
}

export async function createAdminLeadFollowUp(leadId: string, payload: AdminRecord) {
  return normalizeObject<AdminRecord>(await adminPost<any>(`/crm/leads/${leadId}/follow-ups`, { json: payload }, "admin.crm.createFollowUp"));
}

export async function fetchAdminServices(params: { search?: string; status?: string; category?: string; page?: number; limit?: number } = {}) {
  const path = adminQuery("/services", {
    search: params.search,
    query: params.search,
    status: params.status,
    category: params.category,
    page: params.page,
    limit: params.limit,
  });

  return normalizeList<AdminRecord>(await adminGet<any>(path, {}, "admin.services.list"));
}

export async function fetchAdminServiceCategories() {
  return normalizeArray<AdminRecord>(await adminGet<any>("/services/categories", {}, "admin.services.categories"));
}

export async function fetchAdminService(serviceId: string) {
  return normalizeObject<AdminRecord>(await adminGet<any>(`/services/${serviceId}`, {}, "admin.services.detail"));
}

function normalizeTimeline(value: any) {
  const directItems = normalizeArray<AdminRecord>(value);
  if (directItems.length > 0) {
    return directItems;
  }

  const detail = normalizeObject<AdminRecord>(value);
  return Array.isArray(detail.timeline) ? (detail.timeline as AdminRecord[]) : [];
}

export async function fetchAdminServiceTimeline(serviceId: string) {
  const response = await adminGet<any>(`/services/${serviceId}/timeline`, {}, "admin.services.timeline");
  return normalizeTimeline(response);
}

export async function updateAdminServiceStatus(serviceId: string, status: string, payload: AdminRecord = {}) {
  return normalizeObject<AdminRecord>(await adminPatch<any>(`/services/${serviceId}/status`, { json: { status, ...payload } }, "admin.services.status"));
}

export async function uploadAdminServiceDocument(serviceId: string, formData: FormData) {
  return normalizeObject<AdminRecord>(await requestJson(`/services/${serviceId}/documents`, {
    method: "POST",
    body: formData,
  }));
}

export async function fetchAdminTasks(params: { search?: string; status?: string; assignee?: string; page?: number; limit?: number } = {}) {
  const path = adminQuery("/tasks", {
    search: params.search,
    query: params.search,
    status: params.status,
    assignee: params.assignee,
    page: params.page,
    limit: params.limit,
  });

  return normalizeList<AdminRecord>(await adminGet<any>(path, {}, "admin.tasks.list"));
}

export async function fetchAdminOverdueTasks() {
  return normalizeArray<AdminRecord>(await adminGet<any>("/tasks/overdue", {}, "admin.tasks.overdue"));
}

export async function autoAssignAdminTasks(payload: AdminRecord = {}) {
  return normalizeObject<AdminRecord>(await adminPost<any>("/tasks/auto-assign", { json: payload }, "admin.tasks.autoAssign"));
}

export async function updateAdminTaskStatus(taskId: string, status: string, payload: AdminRecord = {}) {
  return normalizeObject<AdminRecord>(await adminPatch<any>(`/tasks/${taskId}/status`, { json: { status, ...payload } }, "admin.tasks.status"));
}

export async function fetchAdminClientStatus(clientId: string) {
  return normalizeObject<AdminRecord>(await adminGet<any>(`/crm/clients/${clientId}/status`, {}, "admin.clients.status"));
}

export async function fetchAdminClientDirectory() {
  const [services, leads] = await Promise.all([
    fetchAdminServices({ limit: 500 }),
    fetchAdminLeads({ limit: 500 }),
  ]);

  const clientMap = new Map<string, AdminRecord>();

  services.items.forEach((service) => {
    const clientId = String(service.client_id ?? service.clientId ?? service.client?.id ?? service.client?.clientId ?? "").trim();
    if (!clientId) {
      return;
    }

    const current = clientMap.get(clientId) ?? {
      id: clientId,
      name: service.client_name ?? service.clientName ?? service.client?.name ?? "Client",
      email: service.client_email ?? service.clientEmail ?? service.client?.email ?? "",
      phone: service.client_phone ?? service.clientPhone ?? service.client?.phone ?? "",
      services: [],
      activeServices: 0,
      pendingTasks: 0,
      documents: 0,
      status: service.client_status ?? service.clientStatus ?? "active",
      latestActivityAt: service.updatedAt ?? service.updated_at ?? null,
    };

    const servicesList = Array.isArray(current.services) ? current.services : [];
    servicesList.push(service);
    current.services = servicesList;
    current.activeServices = servicesList.filter((entry) => {
      const status = String(entry.status ?? "").toLowerCase();
      return status !== "completed" && status !== "closed";
    }).length;
    current.pendingTasks = servicesList.reduce((total, entry) => total + Number(entry.task_count ?? entry.taskCount ?? 0), 0);
    current.documents = servicesList.reduce((total, entry) => total + Number(entry.document_count ?? entry.documentCount ?? 0), 0);
    current.latestActivityAt = [current.latestActivityAt, service.updatedAt ?? service.updated_at ?? null].filter(Boolean).sort().at(-1) ?? current.latestActivityAt;
    clientMap.set(clientId, current);
  });

  leads.items.forEach((lead) => {
    const clientId = String(lead.client_id ?? lead.clientId ?? lead.converted_client_id ?? lead.convertedClientId ?? "").trim();
    if (!clientId || clientMap.has(clientId)) {
      return;
    }

    clientMap.set(clientId, {
      id: clientId,
      name: lead.client_name ?? lead.clientName ?? lead.name ?? "Client",
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      services: [],
      activeServices: 0,
      pendingTasks: 0,
      documents: 0,
      status: lead.status ?? "active",
      latestActivityAt: lead.updatedAt ?? lead.createdAt ?? null,
    });
  });

  return Array.from(clientMap.values()).sort((left, right) => String(right.latestActivityAt ?? "").localeCompare(String(left.latestActivityAt ?? "")));
}

export async function fetchAdminGlobalSearch(query: string): Promise<AdminGlobalSearchResult> {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length < 2) {
    return {
      leads: [],
      clients: [],
      services: [],
    };
  }

  const [leadResults, serviceResults, clientDirectory] = await Promise.all([
    fetchAdminLeads({ search: normalizedQuery, limit: 5 }),
    fetchAdminServices({ search: normalizedQuery, limit: 5 }),
    fetchAdminClientDirectory(),
  ]);

  return {
    leads: leadResults.items.slice(0, 5),
    services: serviceResults.items.slice(0, 5),
    clients: clientDirectory.filter((client) => adminSearchText(client).includes(normalizedQuery)).slice(0, 5),
  };
}

export async function fetchAdminWorkflowDefinitions() {
  return normalizeArray<AdminRecord>(await adminGet<any>("/workflow/definitions", {}, "admin.workflow.definitions"));
}

export async function uploadAdminDocumentForService(serviceId: string, file: File, metadata: AdminRecord = {}) {
  const formData = new FormData();
  formData.append("file", file);
  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, String(value));
    }
  });
  return uploadAdminServiceDocument(serviceId, formData);
}



export async function fetchAdminPricingServices() {
  const response = await adminGet<any>("/pricing/services", {}, "admin.pricing.services");
  return normalizeList<AdminRecord>(response.data ?? response);
}

export async function saveAdminPricingService(payload: AdminRecord) {
  return normalizeObject<AdminRecord>(await adminPost<any>("/pricing/services", { json: payload }, "admin.pricing.saveService"));
}

export async function updateAdminPricingService(code: string, payload: AdminRecord) {
  return normalizeObject<AdminRecord>(await adminPatch<any>(`/pricing/services/${code}`, { json: payload }, "admin.pricing.updateService"));
}

export async function fetchAdminPricingRules(params: { serviceCode?: string } = {}) {
  const path = adminQuery("/pricing/rules", {
    serviceCode: params.serviceCode,
  });

  const response = await adminGet<any>(path, {}, "admin.pricing.rules");
  return normalizeList<AdminRecord>(response.data ?? response);
}

export async function createAdminPricingRule(payload: AdminRecord) {
  return normalizeObject<AdminRecord>(await adminPost<any>("/pricing/rules", { json: payload }, "admin.pricing.createRule"));
}

export async function updateAdminPricingRule(id: string, payload: AdminRecord) {
  return normalizeObject<AdminRecord>(await adminPatch<any>(`/pricing/rules/${id}`, { json: payload }, "admin.pricing.updateRule"));
}