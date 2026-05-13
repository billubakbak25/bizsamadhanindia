const paymentRepository = require("../repositories/paymentRepository");
const serviceRepository = require("../repositories/serviceRepository");
const documentRepository = require("../repositories/documentRepository");
const consultationRepository = require("../repositories/consultationRepository");
const supportTicketRepository = require("../repositories/supportTicketRepository");
const billingRepository = require("../repositories/billingRepository");
const AppError = require("../utils/appError");

function toPositiveInt(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }
  if (typeof max === "number") {
    return Math.min(parsed, max);
  }
  return parsed;
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function latestValue(items, keys) {
  let latest = null;

  for (const item of items) {
    for (const key of keys) {
      const value = item && item[key];
      if (!value) {
        continue;
      }

      if (!latest || new Date(value).getTime() > new Date(latest).getTime()) {
        latest = value;
      }
    }
  }

  return latest;
}

function countByStatus(items, key, statuses) {
  const normalizedStatuses = new Set(statuses.map((status) => String(status).toLowerCase()));
  return items.filter((item) => normalizedStatuses.has(String(item && item[key]).toLowerCase())).length;
}

function paginateCollection(items, query = {}) {
  const limit = toPositiveInt(query.limit, 25, 100);
  const offset = toPositiveInt(query.offset, 0);
  const pageItems = items.slice(offset, offset + limit);

  return {
    items: pageItems,
    pagination: {
      total: items.length,
      limit,
      offset,
    },
  };
}

function mapSubscriptionWithPlan(subscription, plan) {
  const resolvedPlanCode = subscription.plan_code || subscription.planCode;
  const resolvedPlanName = (plan && (plan.plan_name || plan.planName)) || resolvedPlanCode;
  const resolvedAmount = Number((plan && (plan.amount ?? plan.plan_amount ?? plan.planAmount)) || 0);
  const resolvedCurrency = (plan && (plan.currency || plan.plan_currency || plan.planCurrency)) || "INR";
  const resolvedIntervalUnit = (plan && (plan.interval_unit || plan.intervalUnit)) || null;
  const resolvedIntervalCount = Number((plan && (plan.interval_count ?? plan.intervalCount)) || 0);
  const resolvedReminderDaysBefore = Number((plan && (plan.reminder_days_before ?? plan.reminderDaysBefore)) || 0);

  return {
    id: subscription.id,
    clientId: subscription.client_id,
    client_id: subscription.client_id,
    planCode: resolvedPlanCode,
    plan_code: resolvedPlanCode,
    planName: resolvedPlanName,
    plan_name: resolvedPlanName,
    planAmount: resolvedAmount,
    plan_amount: resolvedAmount,
    planCurrency: resolvedCurrency,
    plan_currency: resolvedCurrency,
    intervalUnit: resolvedIntervalUnit,
    interval_unit: resolvedIntervalUnit,
    intervalCount: resolvedIntervalCount,
    interval_count: resolvedIntervalCount,
    reminderDaysBefore: resolvedReminderDaysBefore,
    reminder_days_before: resolvedReminderDaysBefore,
    status: subscription.status,
    currentPeriodStart: subscription.current_period_start,
    current_period_start: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
    current_period_end: subscription.current_period_end,
    lastRenewedAt: subscription.last_renewed_at,
    last_renewed_at: subscription.last_renewed_at,
    nextRenewalAt: subscription.next_renewal_at,
    next_renewal_at: subscription.next_renewal_at,
    createdAt: subscription.created_at,
    created_at: subscription.created_at,
    updatedAt: subscription.updated_at,
    updated_at: subscription.updated_at,
  };
}

function mapConsultationRow(row) {
  return {
    id: row.id,
    requestCode: row.request_code,
    request_code: row.request_code,
    name: row.name,
    phone: row.phone,
    email: row.email,
    consultationType: row.consultation_type,
    consultation_type: row.consultation_type,
    service: row.service,
    preferredDate: row.preferred_date,
    preferred_date: row.preferred_date,
    preferredSlot: row.preferred_slot,
    preferred_slot: row.preferred_slot,
    mode: row.mode,
    notes: row.notes,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
}

function mapTicketRow(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    client_id: row.client_id,
    subject: row.subject,
    category: row.category,
    priority: row.priority,
    message: row.message,
    status: row.status,
    resolvedAt: row.resolved_at,
    resolved_at: row.resolved_at,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
}

function summarizeSubscriptions(items) {
  return {
    total: items.length,
    active: countByStatus(items, "status", ["active"]),
    paused: countByStatus(items, "status", ["paused"]),
    cancelled: countByStatus(items, "status", ["cancelled"]),
    renewingSoon: items.filter((item) => {
      if (!item.nextRenewalAt) {
        return false;
      }

      const renewalTime = new Date(item.nextRenewalAt).getTime();
      if (Number.isNaN(renewalTime)) {
        return false;
      }

      return renewalTime <= Date.now() + (14 * 24 * 60 * 60 * 1000);
    }).length,
    latestAt: latestValue(items, ["updatedAt", "updated_at", "createdAt", "created_at"]),
    nextRenewalAt: latestValue(items, ["nextRenewalAt", "next_renewal_at"]),
  };
}

function summarizeConsultations(items) {
  return {
    total: items.length,
    new: countByStatus(items, "status", ["new"]),
    scheduled: countByStatus(items, "status", ["scheduled"]),
    confirmed: countByStatus(items, "status", ["confirmed"]),
    completed: countByStatus(items, "status", ["completed"]),
    cancelled: countByStatus(items, "status", ["cancelled"]),
    latestAt: latestValue(items, ["updatedAt", "updated_at", "createdAt", "created_at"]),
  };
}

function summarizeTickets(items) {
  return {
    total: items.length,
    open: countByStatus(items, "status", ["open"]),
    inProgress: countByStatus(items, "status", ["in_progress"]),
    resolved: countByStatus(items, "status", ["resolved"]),
    closed: countByStatus(items, "status", ["closed"]),
    latestAt: latestValue(items, ["updatedAt", "updated_at", "createdAt", "created_at"]),
  };
}

async function loadPayments(clientId) {
  return paymentRepository.listByClientId(clientId);
}

async function loadServices(clientId) {
  return serviceRepository.listByClientId(clientId);
}

async function loadDocuments(clientId) {
  return documentRepository.listByClientId(clientId);
}

async function loadSubscriptions(clientId) {
  const subscriptions = await billingRepository.listSubscriptions({ clientId: Number(clientId) });
  const uniquePlanCodes = [...new Set(subscriptions.map((subscription) => subscription.plan_code).filter(Boolean))];
  const plans = await Promise.all(uniquePlanCodes.map((planCode) => billingRepository.findPlanByCode(planCode)));
  const plansByCode = new Map(plans.filter(Boolean).map((plan) => [plan.plan_code, plan]));

  return subscriptions
    .map((subscription) => mapSubscriptionWithPlan(subscription, plansByCode.get(subscription.plan_code)))
    .sort((left, right) => {
      const leftTime = new Date(left.updated_at || left.created_at || 0).getTime();
      const rightTime = new Date(right.updated_at || right.created_at || 0).getTime();
      if (leftTime !== rightTime) {
        return rightTime - leftTime;
      }
      return Number(right.id || 0) - Number(left.id || 0);
    });
}

async function loadConsultations(client) {
  const rows = await consultationRepository.listByContact({
    phone: client && client.phone ? client.phone : "",
    email: client && client.email ? client.email : "",
  });
  return rows.map(mapConsultationRow);
}

async function loadTickets(clientId) {
  const rows = await supportTicketRepository.listByClientId(clientId);
  return rows.map(mapTicketRow);
}

async function getDashboard(client) {
  const [payments, services, documents, subscriptions, consultations, tickets] = await Promise.all([
    loadPayments(client.id),
    loadServices(client.id),
    loadDocuments(client.id),
    loadSubscriptions(client.id),
    loadConsultations(client),
    loadTickets(client.id),
  ]);

  const totalRevenue = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0) / 100;

  const subscriptionSummary = summarizeSubscriptions(subscriptions);
  const consultationSummary = summarizeConsultations(consultations);
  const ticketSummary = summarizeTickets(tickets);

  return {
    client: {
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
    },
    metrics: {
      totalPayments: payments.length,
      totalRevenue,
      activeServices: services.filter((service) => ["active", "pending", "in_progress"].includes(service.status)).length,
      totalDocuments: documents.length,
      totalSubscriptions: subscriptionSummary.total,
      activeSubscriptions: subscriptionSummary.active,
      totalConsultations: consultationSummary.total,
      openTickets: ticketSummary.open,
    },
    latest: {
      lastPaymentAt: latestValue(payments, ["updated_at", "updatedAt"]),
      lastDocumentUploadedAt: latestValue(documents, ["uploaded_at", "uploadedAt"]),
      lastSubscriptionAt: subscriptionSummary.latestAt,
      lastConsultationAt: consultationSummary.latestAt,
      lastTicketAt: ticketSummary.latestAt,
    },
    subscriptions: {
      items: subscriptions.slice(0, 5),
      summary: subscriptionSummary,
    },
    consultations: {
      items: consultations.slice(0, 5),
      summary: consultationSummary,
    },
    tickets: {
      items: tickets.slice(0, 5),
      summary: ticketSummary,
    },
  };
}

async function getPayments(client) {
  return loadPayments(client.id);
}

async function getServices(client) {
  return loadServices(client.id);
}

async function getDocuments(client) {
  return loadDocuments(client.id);
}

async function getSubscriptions(client, query = {}) {
  const items = await loadSubscriptions(client.id);
  const summary = summarizeSubscriptions(items);
  const page = paginateCollection(items, query);

  return {
    items: page.items,
    summary,
    pagination: page.pagination,
  };
}

async function getConsultations(client, query = {}) {
  const items = await loadConsultations(client);
  const summary = summarizeConsultations(items);
  const page = paginateCollection(items, query);

  return {
    items: page.items,
    summary,
    pagination: page.pagination,
  };
}

async function getTickets(client, query = {}) {
  const items = await loadTickets(client.id);
  const summary = summarizeTickets(items);
  const page = paginateCollection(items, query);

  return {
    items: page.items,
    summary,
    pagination: page.pagination,
  };
}

function normalizeTicketPayload(payload = {}) {
  const subject = String(payload.subject || "").trim();
  const category = String(payload.category || "general").trim().toLowerCase() || "general";
  const priority = String(payload.priority || "normal").trim().toLowerCase() || "normal";
  const message = String(payload.message || "").trim();

  if (subject.length < 3) {
    throw new AppError("Please enter a subject for the ticket.", 400, "VALIDATION_ERROR");
  }

  if (message.length < 10) {
    throw new AppError("Please enter at least 10 characters in the ticket message.", 400, "VALIDATION_ERROR");
  }

  const allowedPriorities = new Set(["low", "normal", "high", "urgent"]);
  const allowedCategories = new Set(["general", "billing", "consultation", "compliance", "document", "service", "support"]);

  return {
    subject,
    category: allowedCategories.has(category) ? category : "general",
    priority: allowedPriorities.has(priority) ? priority : "normal",
    message,
  };
}

async function createTicket(client, payload = {}) {
  const ticketPayload = normalizeTicketPayload(payload);
  const created = await supportTicketRepository.create({
    clientId: client.id,
    subject: ticketPayload.subject,
    category: ticketPayload.category,
    priority: ticketPayload.priority,
    message: ticketPayload.message,
    status: "open",
    resolvedAt: null,
  });

  return mapTicketRow(created);
}

module.exports = {
  getDashboard,
  getPayments,
  getServices,
  getDocuments,
  getSubscriptions,
  getConsultations,
  getTickets,
  createTicket,
};

