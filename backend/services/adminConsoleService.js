const adminConsoleRepository = require("../repositories/adminConsoleRepository");
const consultationRepository = require("../repositories/consultationRepository");
const supportTicketRepository = require("../repositories/supportTicketRepository");
const AppError = require("../utils/appError");

function now() {
  return new Date().toISOString();
}

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

function normalizeSearch(value) {
  return String(value || "").trim().toLowerCase();
}

function readValue(record, camelKey, snakeKey = camelKey) {
  if (!record) {
    return null;
  }

  if (record[camelKey] !== undefined) {
    return record[camelKey];
  }

  return record[snakeKey];
}

function safeJsonParse(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toNullableDate(value) {
  return value || null;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function latestValue(items, keys) {
  let latest = null;

  items.forEach((item) => {
    keys.forEach((key) => {
      const value = item && item[key];
      if (!value) {
        return;
      }

      if (!latest || new Date(value).getTime() > new Date(latest).getTime()) {
        latest = value;
      }
    });
  });

  return latest;
}

function paginate(items, query = {}, fallbackLimit = 20, maxLimit = 100) {
  const limit = toPositiveInt(query.limit, fallbackLimit, maxLimit);
  const offset = toPositiveInt(query.offset, 0);

  return {
    items: items.slice(offset, offset + limit),
    pagination: {
      total: items.length,
      limit,
      offset,
    },
  };
}

function matchesSearch(values, search) {
  if (!search) {
    return true;
  }

  return values.some((value) => String(value || "").toLowerCase().includes(search));
}

function mapClientRecord(client) {
  const payments = toArray(client.payments);
  const services = toArray(client.services);
  const documents = toArray(client.documents);
  const subscriptions = toArray(client.subscriptions);

  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email,
    role: client.role,
    referralCode: client.referralCode,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
    summary: {
      payments: {
        total: payments.length,
        paid: payments.filter((payment) => payment.status === "paid").length,
        pending: payments.filter((payment) => payment.status === "pending").length,
        failed: payments.filter((payment) => ["failed", "signature_failed"].includes(payment.status)).length,
        revenue: payments.reduce((sum, payment) => sum + (payment.status === "paid" ? toNumber(payment.amount) : 0), 0),
        latestAt: toNullableDate(latestValue(payments, ["updatedAt", "createdAt"])),
      },
      services: {
        total: services.length,
        pending: services.filter((service) => service.status === "pending").length,
        inProgress: services.filter((service) => service.status === "in_progress").length,
        active: services.filter((service) => ["active", "pending", "in_progress"].includes(service.status)).length,
        completed: services.filter((service) => service.status === "completed").length,
        latestAt: toNullableDate(latestValue(services, ["updatedAt", "createdAt"])),
      },
      documents: {
        total: documents.length,
        folders: new Set(documents.map((document) => document.folderName)).size,
        latestAt: toNullableDate(latestValue(documents, ["uploadedAt", "createdAt"])),
      },
      subscriptions: {
        total: subscriptions.length,
        active: subscriptions.filter((subscription) => subscription.status === "active").length,
        paused: subscriptions.filter((subscription) => subscription.status === "paused").length,
        cancelled: subscriptions.filter((subscription) => subscription.status === "cancelled").length,
        nextRenewalAt: toNullableDate(latestValue(subscriptions, ["nextRenewalAt"])),
        latestAt: toNullableDate(latestValue(subscriptions, ["updatedAt", "createdAt"])),
      },
    },
  };
}

function mapWorkflowRecord(record) {
  return {
    id: record.id,
    serviceRequestId: readValue(record, "serviceRequestId", "service_request_id"),
    serviceCode: readValue(record, "serviceCode", "service_code"),
    serviceName: readValue(record, "serviceName", "service_name"),
    status: record.status,
    currentStepCode: readValue(record, "currentStepCode", "current_step_code"),
    context: safeJsonParse(readValue(record, "contextJson", "context_json"), {}),
    steps: safeJsonParse(readValue(record, "stepsJson", "steps_json"), []),
    createdAt: readValue(record, "createdAt", "created_at"),
    updatedAt: readValue(record, "updatedAt", "updated_at"),
  };
}

function mapFollowUpRecord(record) {
  const lead = record.lead || {};

  return {
    id: record.id,
    leadId: readValue(record, "leadId", "lead_id"),
    lead: {
      id: lead.id || readValue(record, "leadId", "lead_id"),
      name: lead.name || null,
      phone: lead.phone || null,
      service: lead.service || null,
      status: lead.status || null,
    },
    stepKey: readValue(record, "stepKey", "step_key"),
    scheduledFor: readValue(record, "scheduledFor", "scheduled_for"),
    status: record.status,
    channel: record.channel,
    message: record.message,
    sentAt: readValue(record, "sentAt", "sent_at"),
    cancelledReason: readValue(record, "cancelledReason", "cancelled_reason"),
    createdAt: readValue(record, "createdAt", "created_at"),
    updatedAt: readValue(record, "updatedAt", "updated_at"),
  };
}

function mapConsultationRow(record) {
  return {
    id: record.id,
    requestCode: readValue(record, "requestCode", "request_code"),
    name: record.name,
    phone: record.phone,
    email: record.email,
    consultationType: readValue(record, "consultationType", "consultation_type"),
    service: record.service,
    preferredDate: readValue(record, "preferredDate", "preferred_date"),
    preferredSlot: readValue(record, "preferredSlot", "preferred_slot"),
    mode: record.mode,
    notes: record.notes,
    status: record.status,
    source: record.source,
    createdAt: readValue(record, "createdAt", "created_at"),
    updatedAt: readValue(record, "updatedAt", "updated_at"),
  };
}
function mapSupportTicketRecord(record) {
  const client = record.client || {};

  return {
    id: record.id,
    clientId: readValue(record, "clientId", "client_id"),
    subject: record.subject,
    category: record.category,
    priority: record.priority,
    message: record.message,
    status: record.status,
    resolvedAt: toNullableDate(readValue(record, "resolvedAt", "resolved_at")),
    createdAt: readValue(record, "createdAt", "created_at"),
    updatedAt: readValue(record, "updatedAt", "updated_at"),
    client: {
      id: client.id || null,
      name: client.name || null,
      phone: client.phone || null,
      email: client.email || null,
    },
  };
}

function mapReferralRecord(record, referralCode) {
  return {
    id: record.id,
    referrerUserId: readValue(record, "referrerUserId", "referrer_user_id"),
    referredUserId: readValue(record, "referredUserId", "referred_user_id"),
    referralCode: readValue(record, "referralCode", "referral_code"),
    status: record.status,
    rewardAmount: toNumber(readValue(record, "rewardAmount", "reward_amount")),
    rewardStatus: readValue(record, "rewardStatus", "reward_status"),
    rewardedAt: toNullableDate(readValue(record, "rewardedAt", "rewarded_at")),
    createdAt: readValue(record, "createdAt", "created_at"),
    updatedAt: readValue(record, "updatedAt", "updated_at"),
    referrer: {
      id: record.referrer ? record.referrer.id : null,
      name: record.referrer ? record.referrer.name : null,
      phone: record.referrer ? record.referrer.phone : null,
      email: record.referrer ? record.referrer.email : null,
    },
    referred: {
      id: record.referred ? record.referred.id : null,
      name: record.referred ? record.referred.name : null,
      phone: record.referred ? record.referred.phone : null,
      email: record.referred ? record.referred.email : null,
    },
    code: {
      id: referralCode ? referralCode.id : null,
      code: referralCode ? referralCode.referralCode : null,
      active: referralCode ? Boolean(Number(referralCode.isActive || 0)) : false,
    },
  };
}

function mapAddonCatalogRecord(record, suggestionSummary) {
  return {
    id: record.id,
    serviceCode: readValue(record, "serviceCode", "service_code"),
    addonCode: readValue(record, "addonCode", "addon_code"),
    addonName: readValue(record, "addonName", "addon_name"),
    description: record.description,
    basePrice: toNumber(readValue(record, "basePrice", "base_price")),
    pricingType: readValue(record, "pricingType", "pricing_type"),
    pricingMetadata: safeJsonParse(readValue(record, "pricingMetadata", "pricing_metadata"), {}),
    isActive: Boolean(Number(readValue(record, "isActive", "is_active") || 0)),
    createdAt: readValue(record, "createdAt", "created_at"),
    updatedAt: readValue(record, "updatedAt", "updated_at"),
    summary: {
      suggestions: {
        total: suggestionSummary.total,
        suggested: suggestionSummary.suggested,
        accepted: suggestionSummary.accepted,
        rejected: suggestionSummary.rejected,
        lastSuggestedAt: suggestionSummary.lastSuggestedAt,
      },
    },
  };
}

function mapAddonSuggestionRecord(record, paymentMap) {
  const payment = paymentMap.get(String(readValue(record, "paymentId", "payment_id"))) || null;
  const client = record.client || {};

  return {
    id: record.id,
    paymentId: readValue(record, "paymentId", "payment_id"),
    clientId: readValue(record, "clientId", "client_id"),
    serviceCode: readValue(record, "serviceCode", "service_code"),
    addonCode: readValue(record, "addonCode", "addon_code"),
    addonName: readValue(record, "addonName", "addon_name"),
    suggestedPrice: toNumber(readValue(record, "suggestedPrice", "suggested_price")),
    pricingReason: readValue(record, "pricingReason", "pricing_reason"),
    status: record.status,
    acceptedAt: toNullableDate(readValue(record, "acceptedAt", "accepted_at")),
    rejectedAt: toNullableDate(readValue(record, "rejectedAt", "rejected_at")),
    createdAt: readValue(record, "createdAt", "created_at"),
    updatedAt: readValue(record, "updatedAt", "updated_at"),
    payment: {
      service: payment ? payment.service : null,
      customerName: payment ? payment.customerName : null,
      customerPhone: payment ? payment.customerPhone : null,
    },
    client: {
      id: client.id || null,
      name: client.name || null,
      phone: client.phone || null,
      email: client.email || null,
    },
  };
}

function mapVaultDocumentRecord(record) {
  const client = record.client || {};

  return {
    id: record.id,
    clientId: readValue(record, "clientId", "client_id"),
    client: {
      id: client.id || null,
      name: client.name || null,
      phone: client.phone || null,
      email: client.email || null,
    },
    folderName: readValue(record, "folderName", "folder_name"),
    documentType: readValue(record, "documentType", "document_type"),
    fileName: readValue(record, "fileName", "file_name"),
    originalName: readValue(record, "originalName", "original_name"),
    filePath: readValue(record, "filePath", "file_path"),
    fileUrl: readValue(record, "fileUrl", "file_url"),
    mimeType: readValue(record, "mimeType", "mime_type"),
    size: toNumber(record.size),
    uploadedByUserId: readValue(record, "uploadedByUserId", "uploaded_by_user_id"),
    uploadedByRole: readValue(record, "uploadedByRole", "uploaded_by_role"),
    uploadedAt: readValue(record, "uploadedAt", "uploaded_at"),
    reviewStatus: readValue(record, "reviewStatus", "review_status") || "pending_review",
    reviewedAt: readValue(record, "reviewedAt", "reviewed_at"),
    reviewedByUserId: readValue(record, "reviewedByUserId", "reviewed_by_user_id"),
    reviewedByRole: readValue(record, "reviewedByRole", "reviewed_by_role"),
    createdAt: readValue(record, "createdAt", "created_at"),
    updatedAt: readValue(record, "updatedAt", "updated_at"),
  };
}

function mapVaultFolderEntries(records) {
  const grouped = new Map();

  records.forEach((record) => {
    const folderName = readValue(record, "folderName", "folder_name");
    const current = grouped.get(folderName) || {
      folderName,
      totalDocuments: 0,
      totalClients: new Set(),
      latestUploadedAt: null,
    };
    current.totalDocuments += 1;
    current.totalClients.add(readValue(record, "clientId", "client_id"));
    const uploadedAt = readValue(record, "uploadedAt", "uploaded_at");
    if (!current.latestUploadedAt || new Date(uploadedAt).getTime() > new Date(current.latestUploadedAt).getTime()) {
      current.latestUploadedAt = uploadedAt;
    }
    grouped.set(folderName, current);
  });

  return Array.from(grouped.values())
    .map((entry) => ({
      folderName: entry.folderName,
      totalDocuments: entry.totalDocuments,
      totalClients: entry.totalClients.size,
      latestUploadedAt: toNullableDate(entry.latestUploadedAt),
    }))
    .sort((left, right) => right.totalDocuments - left.totalDocuments || left.folderName.localeCompare(right.folderName));
}

async function getOverviewCounts() {
  const referenceTime = now();
  const [
    totalLeads,
    newLeads,
    convertedLeads,
    contactedLeads,
    qualifiedLeads,
    totalPayments,
    paidPayments,
    pendingPayments,
    failedPayments,
    revenueAggregate,
    totalClients,
    totalServices,
    pendingServices,
    inProgressServices,
    activeServices,
    completedServices,
    totalDocuments,
    totalSubscriptions,
    activeSubscriptions,
    pausedSubscriptions,
    cancelledSubscriptions,
    subscriptionAggregate,
    totalTasks,
    assignedTasks,
    inProgressTasks,
    blockedTasks,
    overdueTasks,
    totalWorkflows,
    activeWorkflows,
    completedWorkflows,
    totalFollowUps,
    scheduledFollowUps,
    sentFollowUps,
    cancelledFollowUps,
    dueFollowUps,
    activePlans,
  ] = await Promise.all([
    adminConsoleRepository.lead.count(),
    adminConsoleRepository.lead.count({ where: { status: "new" } }),
    adminConsoleRepository.lead.count({ where: { status: "converted" } }),
    adminConsoleRepository.lead.count({ where: { status: "contacted" } }),
    adminConsoleRepository.lead.count({ where: { status: "qualified" } }),
    adminConsoleRepository.payment.count(),
    adminConsoleRepository.payment.count({ where: { status: "paid" } }),
    adminConsoleRepository.payment.count({ where: { status: "pending" } }),
    adminConsoleRepository.payment.count({ where: { status: { in: ["failed", "signature_failed"] } } }),
    adminConsoleRepository.payment.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
    adminConsoleRepository.client.count(),
    adminConsoleRepository.service.count(),
    adminConsoleRepository.service.count({ where: { status: "pending" } }),
    adminConsoleRepository.service.count({ where: { status: "in_progress" } }),
    adminConsoleRepository.service.count({ where: { status: { in: ["active", "pending", "in_progress"] } } }),
    adminConsoleRepository.service.count({ where: { status: "completed" } }),
    adminConsoleRepository.document.count(),
    adminConsoleRepository.subscription.count(),
    adminConsoleRepository.subscription.count({ where: { status: "active" } }),
    adminConsoleRepository.subscription.count({ where: { status: "paused" } }),
    adminConsoleRepository.subscription.count({ where: { status: "cancelled" } }),
    adminConsoleRepository.subscription.aggregate({ _max: { nextRenewalAt: true } }),
    adminConsoleRepository.task.count(),
    adminConsoleRepository.task.count({ where: { status: "assigned" } }),
    adminConsoleRepository.task.count({ where: { status: "in_progress" } }),
    adminConsoleRepository.task.count({ where: { status: "blocked" } }),
    adminConsoleRepository.task.count({ where: { status: { not: "completed" }, slaDueAt: { lt: referenceTime } } }),
    adminConsoleRepository.workflowInstance.count(),
    adminConsoleRepository.workflowInstance.count({ where: { status: { in: ["pending", "in_progress", "blocked"] } } }),
    adminConsoleRepository.workflowInstance.count({ where: { status: "completed" } }),
    adminConsoleRepository.followUp.count(),
    adminConsoleRepository.followUp.count({ where: { status: "scheduled" } }),
    adminConsoleRepository.followUp.count({ where: { status: "sent" } }),
    adminConsoleRepository.followUp.count({ where: { status: "cancelled" } }),
    adminConsoleRepository.followUp.count({ where: { status: "scheduled", scheduledFor: { lte: referenceTime } } }),
    adminConsoleRepository.billingPlan.count({ where: { isActive: 1 } })
  ]);

  return {
    leads: { total: totalLeads, new: newLeads, contacted: contactedLeads, qualified: qualifiedLeads, converted: convertedLeads },
    payments: { total: totalPayments, paid: paidPayments, pending: pendingPayments, failed: failedPayments, revenue: toNumber(revenueAggregate._sum.amount) },
    clients: { total: totalClients },
    services: { total: totalServices, pending: pendingServices, inProgress: inProgressServices, active: activeServices, completed: completedServices },
    documents: { total: totalDocuments },
    subscriptions: { total: totalSubscriptions, active: activeSubscriptions, paused: pausedSubscriptions, cancelled: cancelledSubscriptions, nextRenewalAt: toNullableDate(subscriptionAggregate._max.nextRenewalAt) },
    tasks: { total: totalTasks, assigned: assignedTasks, inProgress: inProgressTasks, blocked: blockedTasks, overdue: overdueTasks },
    workflows: { total: totalWorkflows, active: activeWorkflows, completed: completedWorkflows },
    followUps: { total: totalFollowUps, scheduled: scheduledFollowUps, sent: sentFollowUps, cancelled: cancelledFollowUps, due: dueFollowUps },
    billing: { activePlans: activePlans },
  };
}

async function listClients(query = {}) {
  const limit = toPositiveInt(query.limit, 20, 100);
  const offset = toPositiveInt(query.offset, 0);
  const search = normalizeSearch(query.search);
  const where = search ? { OR: [
    { name: { contains: search, mode: "insensitive" } },
    { phone: { contains: search, mode: "insensitive" } },
    { email: { contains: search, mode: "insensitive" } },
    { referralCode: { contains: search, mode: "insensitive" } }
  ] } : {};

  const [total, clients] = await Promise.all([
    adminConsoleRepository.client.count({ where }),
    adminConsoleRepository.client.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: limit,
      skip: offset,
      include: {
        payments: { select: { status: true, amount: true, createdAt: true, updatedAt: true } },
        services: { select: { status: true, createdAt: true, updatedAt: true } },
        documents: { select: { folderName: true, uploadedAt: true, createdAt: true } },
        subscriptions: { select: { status: true, nextRenewalAt: true, createdAt: true, updatedAt: true } },
      },
    })
  ]);

  return { items: clients.map(mapClientRecord), pagination: { total, limit, offset } };
}
async function listWorkflowInstances(query = {}) {
  const limit = toPositiveInt(query.limit, 20, 100);
  const offset = toPositiveInt(query.offset, 0);
  const search = normalizeSearch(query.search);
  const status = normalizeSearch(query.status);
  const serviceCode = normalizeSearch(query.serviceCode);
  const where = {
    ...(status ? { status } : {}),
    ...(serviceCode ? { serviceCode: { equals: serviceCode, mode: "insensitive" } } : {}),
    ...(search ? { OR: [
      { serviceRequestId: { contains: search, mode: "insensitive" } },
      { serviceCode: { contains: search, mode: "insensitive" } },
      { serviceName: { contains: search, mode: "insensitive" } },
      { currentStepCode: { contains: search, mode: "insensitive" } }
    ] } : {}),
  };

  const [total, items] = await Promise.all([
    adminConsoleRepository.workflowInstance.count({ where }),
    adminConsoleRepository.workflowInstance.findMany({ where, orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }], take: limit, skip: offset })
  ]);

  return { items: items.map(mapWorkflowRecord), pagination: { total, limit, offset } };
}

async function listConsultations(query = {}) {
  const result = await consultationRepository.listRequests(query);
  return {
    items: toArray(result.items).map(mapConsultationRow),
    summary: result.summary || { total: 0, new: 0, scheduled: 0, confirmed: 0, completed: 0, cancelled: 0 },
    pagination: result.pagination || { total: 0, limit: 20, offset: 0 },
  };
}

async function listReferrals(query = {}) {
  const search = normalizeSearch(query.search);
  const status = normalizeSearch(query.status);
  const rewardStatus = normalizeSearch(query.rewardStatus);
  const records = await adminConsoleRepository.referral.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(rewardStatus ? { rewardStatus } : {}),
    },
    include: { referrer: true, referred: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  const filtered = search
    ? records.filter((record) => matchesSearch([
        record.referralCode,
        record.status,
        record.rewardStatus,
        record.referrer && record.referrer.name,
        record.referrer && record.referrer.phone,
        record.referred && record.referred.name,
        record.referred && record.referred.phone,
      ], search))
    : records;
  const page = paginate(filtered, query);
  const referralCodes = await adminConsoleRepository.referralCode.findMany({
    where: { userId: { in: page.items.map((record) => record.referrerUserId) } },
  });
  const referralCodeByUserId = new Map(referralCodes.map((record) => [record.userId, record]));

  return {
    items: page.items.map((record) => mapReferralRecord(record, referralCodeByUserId.get(record.referrerUserId))),
    summary: {
      total: filtered.length,
      pending: filtered.filter((record) => record.status === "pending").length,
      converted: filtered.filter((record) => record.status === "converted").length,
      rewarded: filtered.filter((record) => record.rewardStatus === "rewarded").length,
      totalRewardAmount: filtered.reduce((sum, record) => sum + toNumber(record.rewardAmount), 0),
      latestUpdatedAt: toNullableDate(latestValue(filtered, ["updatedAt"])),
    },
    pagination: page.pagination,
  };
}

function summarizeAddonSuggestions(records) {
  return {
    total: records.length,
    suggested: records.filter((record) => record.status === "suggested").length,
    accepted: records.filter((record) => record.status === "accepted").length,
    rejected: records.filter((record) => record.status === "rejected").length,
    lastSuggestedAt: toNullableDate(latestValue(records, ["createdAt"])),
  };
}

async function listAddons(query = {}) {
  const search = normalizeSearch(query.search);
  const serviceCode = normalizeSearch(query.serviceCode);
  const active = query.active === undefined || query.active === null || query.active === "" ? null : String(query.active).toLowerCase();
  const where = {
    ...(serviceCode ? { serviceCode: { equals: serviceCode, mode: "insensitive" } } : {}),
    ...(search ? { OR: [
      { addonCode: { contains: search, mode: "insensitive" } },
      { addonName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { serviceCode: { contains: search, mode: "insensitive" } }
    ] } : {}),
    ...((active === "true" || active === "1") ? { isActive: 1 } : {}),
    ...((active === "false" || active === "0") ? { isActive: 0 } : {}),
  };

  const [allCatalogItems, totalSuggestions, suggestedCount, acceptedCount, rejectedCount, suggestionAggregate, recentSuggestionRows] = await Promise.all([
    adminConsoleRepository.addonCatalog.findMany({ where, orderBy: [{ updatedAt: "desc" }, { id: "desc" }] }),
    adminConsoleRepository.addonSuggestion.count(),
    adminConsoleRepository.addonSuggestion.count({ where: { status: "suggested" } }),
    adminConsoleRepository.addonSuggestion.count({ where: { status: "accepted" } }),
    adminConsoleRepository.addonSuggestion.count({ where: { status: "rejected" } }),
    adminConsoleRepository.addonSuggestion.aggregate({ _sum: { suggestedPrice: true }, _max: { createdAt: true } }),
    adminConsoleRepository.addonSuggestion.findMany({ include: { client: true }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 10 })
  ]);
  const page = paginate(allCatalogItems, query);
  const pageAddonCodes = page.items.map((record) => record.addonCode);
  const pageSuggestions = pageAddonCodes.length ? await adminConsoleRepository.addonSuggestion.findMany({ where: { addonCode: { in: pageAddonCodes } } }) : [];
  const suggestionsByAddonCode = new Map();
  pageSuggestions.forEach((record) => {
    const current = suggestionsByAddonCode.get(record.addonCode) || [];
    current.push(record);
    suggestionsByAddonCode.set(record.addonCode, current);
  });
  const payments = recentSuggestionRows.length
    ? await adminConsoleRepository.payment.findMany({
        where: { orderId: { in: recentSuggestionRows.map((record) => record.paymentId) } },
        select: { orderId: true, service: true, customerName: true, customerPhone: true },
      })
    : [];
  const paymentMap = new Map(payments.map((payment) => [payment.orderId, payment]));

  return {
    items: page.items.map((record) => mapAddonCatalogRecord(record, summarizeAddonSuggestions(suggestionsByAddonCode.get(record.addonCode) || []))),
    recentSuggestions: recentSuggestionRows.map((record) => mapAddonSuggestionRecord(record, paymentMap)),
    summary: {
      total: allCatalogItems.length,
      active: allCatalogItems.filter((record) => Number(record.isActive) === 1).length,
      inactive: allCatalogItems.filter((record) => Number(record.isActive) !== 1).length,
      suggestions: {
        total: totalSuggestions,
        suggested: suggestedCount,
        accepted: acceptedCount,
        rejected: rejectedCount,
        totalSuggestedPrice: toNumber(suggestionAggregate._sum.suggestedPrice),
        latestSuggestedAt: toNullableDate(suggestionAggregate._max.createdAt),
      },
    },
    pagination: page.pagination,
  };
}

async function getFilteredVaultDocuments(query = {}) {
  const search = normalizeSearch(query.search);
  const folderName = normalizeSearch(query.folderName);
  const clientId = query.clientId === undefined || query.clientId === null || query.clientId === "" ? null : toPositiveInt(query.clientId, null);
  const records = await adminConsoleRepository.document.findMany({
    where: {
      ...(clientId !== null ? { clientId } : {}),
      ...(folderName ? { folderName: { equals: folderName, mode: "insensitive" } } : {}),
    },
    include: { client: true },
    orderBy: [{ uploadedAt: "desc" }, { id: "desc" }],
  });

  return search
    ? records.filter((record) => matchesSearch([
        record.originalName,
        record.fileName,
        record.documentType,
        record.folderName,
        record.client && record.client.name,
        record.client && record.client.phone,
      ], search))
    : records;
}
async function listVaultDocuments(query = {}) {
  const records = await getFilteredVaultDocuments(query);
  const page = paginate(records, query);
  const folders = mapVaultFolderEntries(records);

  return {
    items: page.items.map(mapVaultDocumentRecord),
    folders,
    summary: {
      totalDocuments: records.length,
      totalClients: new Set(records.map((record) => record.clientId)).size,
      totalFolders: folders.length,
      latestUploadedAt: toNullableDate(latestValue(records, ["uploadedAt"])),
    },
    pagination: page.pagination,
  };
}

async function listVaultFolders(query = {}) {
  const records = await getFilteredVaultDocuments(query);
  return { items: mapVaultFolderEntries(records) };
}

async function listFollowUps(query = {}) {
  const search = normalizeSearch(query.search);
  const status = normalizeSearch(query.status);
  const stepKey = normalizeSearch(query.stepKey);
  const leadId = query.leadId === undefined || query.leadId === null || query.leadId === "" ? null : toPositiveInt(query.leadId, null);
  const referenceTime = query.referenceTime ? String(query.referenceTime) : now();
  const records = await adminConsoleRepository.followUp.findMany({
    where: {
      ...(leadId !== null ? { leadId } : {}),
      ...(status ? { status } : {}),
      ...(stepKey ? { stepKey: { equals: stepKey, mode: "insensitive" } } : {}),
    },
    include: { lead: true },
    orderBy: [{ scheduledFor: "asc" }, { id: "asc" }],
  });
  const filtered = search
    ? records.filter((record) => matchesSearch([
        record.lead && record.lead.name,
        record.lead && record.lead.phone,
        record.lead && record.lead.service,
        record.message,
      ], search))
    : records;
  const page = paginate(filtered, query);

  return {
    items: page.items.map(mapFollowUpRecord),
    summary: {
      total: filtered.length,
      scheduled: filtered.filter((record) => record.status === "scheduled").length,
      sent: filtered.filter((record) => record.status === "sent").length,
      cancelled: filtered.filter((record) => record.status === "cancelled").length,
      due: filtered.filter((record) => record.status === "scheduled" && String(record.scheduledFor) <= referenceTime).length,
    },
    pagination: page.pagination,
  };
}

async function listSupportTickets(query = {}) {
  const search = normalizeSearch(query.search);
  const status = normalizeSearch(query.status);
  const priority = normalizeSearch(query.priority);
  const records = await adminConsoleRepository.supportTicket.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    },
    include: { client: true },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });
  const filtered = search
    ? records.filter((record) => matchesSearch([
        record.subject,
        record.message,
        record.category,
        record.client && record.client.name,
        record.client && record.client.phone,
        record.client && record.client.email,
      ], search))
    : records;
  const page = paginate(filtered, query);

  return {
    items: page.items.map(mapSupportTicketRecord),
    summary: {
      total: filtered.length,
      open: filtered.filter((record) => record.status === "open").length,
      inProgress: filtered.filter((record) => record.status === "in_progress").length,
      resolved: filtered.filter((record) => record.status === "resolved").length,
      closed: filtered.filter((record) => record.status === "closed").length,
      urgent: filtered.filter((record) => record.priority === "urgent").length,
      latestUpdatedAt: toNullableDate(latestValue(filtered, ["updatedAt"])),
    },
    pagination: page.pagination,
  };
}

async function updateSupportTicketStatus(ticketId, payload = {}) {
  const id = toPositiveInt(ticketId, null);
  if (!id) {
    throw new AppError("Support ticket not found.", 404, "TICKET_NOT_FOUND");
  }

  const nextStatus = normalizeSearch(payload.status || payload.nextStatus);
  const allowedStatuses = new Set(["open", "in_progress", "resolved", "closed"]);
  if (!allowedStatuses.has(nextStatus)) {
    throw new AppError("Please choose a valid support ticket status.", 400, "VALIDATION_ERROR");
  }

  const existing = await supportTicketRepository.findById(id);
  if (!existing) {
    throw new AppError("Support ticket not found.", 404, "TICKET_NOT_FOUND");
  }

  await supportTicketRepository.updateStatus(id, nextStatus);
  const record = await adminConsoleRepository.supportTicket.findUnique({ where: { id }, include: { client: true } });
  return record ? mapSupportTicketRecord(record) : null;
}

module.exports = {
  getOverviewCounts,
  listReferrals,
  listAddons,
  listVaultDocuments,
  listVaultFolders,
  listClients,
  listSupportTickets,
  updateSupportTicketStatus,
  listWorkflowInstances,
  listFollowUps,
  listConsultations,
};

