const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const { scoreLead } = require("./leadScoringService");
const followUpService = require("./followUpService");
const { sendLeadNotification } = require("./whatsappService");
const leadRepository = require("../repositories/leadRepository");
const clientRepository = require("../repositories/clientRepository");
const serviceRepository = require("../repositories/serviceRepository");
const taskRepository = require("../repositories/taskRepository");
const followUpRepository = require("../repositories/followUpRepository");
const serviceExecutionService = require("./serviceService");
const { findServiceDefinition } = require("../config/serviceExecutionCatalog");

function now() {
  return new Date().toISOString();
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeServiceName(value) {
  return normalizeText(value).toLowerCase();
}

function resolveLeadServiceConfig(payload = {}) {
  const candidates = [
    payload.serviceCode,
    payload.service_code,
    payload.serviceId,
    payload.service,
    payload.serviceName,
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  for (const candidate of candidates) {
    const definition = findServiceDefinition(candidate);
    if (definition) {
      return definition;
    }
  }

  return null;
}

function buildPaymentLeadMessage(payment = {}) {
  return normalizeText(payment.customer_message) || `Payment completed for ${normalizeText(payment.service || "the selected service")}.`;
}

function appendLeadNote(existingNotes, note) {
  return [normalizeText(existingNotes), normalizeText(note)]
    .filter(Boolean)
    .join(" | ");
}

async function findMatchingLeadForPayment(payment = {}) {
  const normalizedPhone = normalizePhone(payment.customer_phone);
  const normalizedService = normalizeServiceName(payment.service);
  const searchValue = normalizedPhone || normalizeText(payment.customer_name || "");

  if (!searchValue) {
    return null;
  }

  const leads = await leadRepository.listFiltered({ search: searchValue });

  return leads.find((lead) => {
    const phoneMatches = !normalizedPhone || normalizePhone(lead.phone) === normalizedPhone;
    const serviceMatches = !normalizedService || normalizeServiceName(lead.service) === normalizedService;
    return phoneMatches && serviceMatches;
  }) || leads.find((lead) => normalizedPhone && normalizePhone(lead.phone) === normalizedPhone) || null;
}

function normalizeStatus(value, fallback = "new") {
  const normalized = normalizeText(value || fallback).toLowerCase();
  return normalized || fallback;
}

function slugifyServiceCode(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "crm_service";
}

function validateLeadPayload({ name, phone, message, website }, serviceConfig) {
  if (website) {
    throw new AppError("Spam detected.", 400, "SPAM_DETECTED");
  }

  if (!normalizeText(name) || normalizeText(name).length < 2) {
    throw new AppError("Please enter a valid name.", 400, "VALIDATION_ERROR");
  }

  if (!normalizeText(phone)) {
    throw new AppError("Please enter a valid phone number.", 400, "VALIDATION_ERROR");
  }

  if (!serviceConfig) {
    throw new AppError("Please select a valid service.", 400, "VALIDATION_ERROR");
  }

  if (!normalizeText(message) || normalizeText(message).length < 5) {
    throw new AppError("Please enter at least 5 characters in the message.", 400, "VALIDATION_ERROR");
  }
}

function countByStatus(items, statusKey = "status", statusValue) {
  return items.filter((item) => String(item && item[statusKey]).toLowerCase() === String(statusValue).toLowerCase()).length;
}

async function createLead(payload) {
  const serviceConfig = resolveLeadServiceConfig(payload);
  validateLeadPayload(payload, serviceConfig);

  const normalizedServiceName = serviceConfig.serviceName;
  const normalizedServiceCode = serviceConfig.serviceCode;
  const timestamp = now();
  const leadScore = scoreLead({
    name: payload.name,
    phone: payload.phone,
    email: payload.email || "",
    service: normalizedServiceName,
    message: payload.message,
    source: payload.source || "website",
    hasFollowUpRequest: true,
  });

  const result = await leadRepository.create({
    name: normalizeText(payload.name),
    phone: normalizeText(payload.phone),
    email: normalizeText(payload.email || "") || null,
    service: normalizedServiceName,
    message: normalizeText(payload.message),
    status: "new",
    notes: null,
    leadScore: leadScore.score,
    leadTemperature: leadScore.category,
    source: normalizeText(payload.source || "website"),
    timestamp,
  });

  await sendLeadNotification({
    name: normalizeText(payload.name),
    phone: normalizeText(payload.phone),
    service: normalizedServiceName,
  })
    .then((notificationResult) => {
      if (!notificationResult || notificationResult.sent) {
        return;
      }

      logger.warn("lead_whatsapp_notification_not_sent", {
        leadId: result.id,
        status: notificationResult.status,
        reason: notificationResult.reason,
      });
    })
    .catch((error) => {
      logger.error("lead_whatsapp_notification_failed", {
        leadId: result.id,
        message: error.message,
      });
    });

  await followUpService.scheduleForLead(result.id).catch((error) => {
    logger.error("lead_followup_schedule_failed", {
      leadId: result.id,
      message: error.message,
    });
  });

  return {
    message: "Lead submitted successfully.",
    id: result.id,
    serviceCode: normalizedServiceCode,
    serviceName: normalizedServiceName,
    lead_score: leadScore.score,
    lead_temperature: leadScore.category,
  };
}

async function listLeads(filters = {}) {
  return leadRepository.listFiltered({
    status: normalizeStatus(filters.status, ""),
    service: normalizeText(filters.service || ""),
    date: normalizeText(filters.date || ""),
    search: normalizeText(filters.search || ""),
  });
}

async function getLead(id) {
  const lead = await leadRepository.findById(id);
  if (!lead) {
    throw new AppError("Lead not found.", 404, "LEAD_NOT_FOUND");
  }
  return lead;
}

async function updateLead(id, payload = {}) {
  const lead = await getLead(id);
  const timestamp = now();

  const updatedLead = await leadRepository.updateById(id, {
    name: payload.name !== undefined ? normalizeText(payload.name) : lead.name,
    phone: payload.phone !== undefined ? normalizeText(payload.phone) : lead.phone,
    email: payload.email !== undefined ? normalizeText(payload.email) : lead.email,
    service: payload.service !== undefined ? normalizeText(payload.service) : lead.service,
    message: payload.message !== undefined ? normalizeText(payload.message) : lead.message,
    status: payload.status !== undefined ? normalizeStatus(payload.status, lead.status) : lead.status,
    notes: payload.notes !== undefined ? normalizeText(payload.notes) : lead.notes,
    updatedAt: timestamp,
  });

  if (String(updatedLead.status).toLowerCase() === "converted") {
    await followUpService.stopOnConversion(updatedLead.id).catch((error) => {
      logger.error("lead_followup_cancel_failed", {
        leadId: updatedLead.id,
        message: error.message,
      });
    });
  }

  return updatedLead;
}

async function qualifyLead(id, payload = {}) {
  return updateLead(id, {
    ...payload,
    status: "qualified",
  });
}

async function ensureClientFromLead(lead, payload = {}) {
  const normalizedPhone = normalizePhone(lead.phone);
  let client = await clientRepository.findByPhone(normalizedPhone);

  if (!client) {
    client = await clientRepository.findByPhone(lead.phone);
  }

  const clientData = {
    phone: normalizedPhone || normalizeText(lead.phone),
    name: normalizeText(payload.name || lead.name),
    email: payload.email !== undefined ? normalizeText(payload.email) || null : lead.email,
    role: "client",
  };

  if (client) {
    client = await clientRepository.updateById(client.id, {
      phone: clientData.phone,
      name: clientData.name,
      email: clientData.email,
      role: client.role || "client",
      referralCode: client.referralCode,
      updatedAt: now(),
    });
  } else {
    client = await clientRepository.create(clientData);
  }

  return client;
}

async function ensureClientService(client, lead, payload = {}) {
  return serviceExecutionService.createServiceForClient(client.id, {
    serviceCode: payload.serviceCode || lead.service,
    serviceName: payload.serviceName || lead.service,
    orderId: payload.orderId || `CRM-LEAD-${lead.id}`,
    paymentId: payload.paymentId || null,
    status: payload.serviceStatus || "pending",
    source: "crm",
    metadata: {
      sourceLeadId: lead.id,
      leadStatus: lead.status,
      leadScore: lead.leadScore,
      leadSource: lead.source,
      notes: lead.notes,
    },
  });
}

async function createServiceForClient(clientId, payload = {}) {
  const client = await clientRepository.findById(clientId);

  if (!client) {
    throw new AppError("Client not found.", 404, "CLIENT_NOT_FOUND");
  }

  return serviceExecutionService.createServiceForClient(client.id, {
    serviceCode: payload.serviceCode || payload.service_code || payload.serviceName || payload.name,
    serviceName: payload.serviceName || payload.name || payload.serviceCode,
    orderId: payload.orderId,
    paymentId: payload.paymentId,
    status: payload.serviceStatus || payload.status || "pending",
    source: payload.source || "crm",
    metadata: {
      ...(payload.metadata || {}),
      source: "crm",
      clientId: client.id,
    },
  });
}

async function convertLeadToClient(id, payload = {}) {
  const lead = await getLead(id);
  const timestamp = now();
  const updatedLead = await leadRepository.updateById(lead.id, {
    name: payload.name !== undefined ? normalizeText(payload.name) : lead.name,
    phone: payload.phone !== undefined ? normalizeText(payload.phone) : lead.phone,
    email: payload.email !== undefined ? normalizeText(payload.email) : lead.email,
    service: payload.service !== undefined ? normalizeText(payload.service) : lead.service,
    message: payload.message !== undefined ? normalizeText(payload.message) : lead.message,
    status: payload.status && normalizeStatus(payload.status) === "qualified" ? "qualified" : lead.status,
    notes: payload.notes !== undefined ? normalizeText(payload.notes) : lead.notes,
    updatedAt: timestamp,
  });

  const client = await ensureClientFromLead(updatedLead, payload);
  const service = payload.createService === false
    ? null
    : await ensureClientService(client, updatedLead, payload);

  await followUpService.stopOnConversion(updatedLead.id).catch((error) => {
    logger.error("lead_followup_cancel_failed", {
      leadId: updatedLead.id,
      message: error.message,
    });
  });

  const convertedLead = await leadRepository.findById(updatedLead.id);

  return {
    lead: convertedLead,
    client,
    service,
  };
}

async function assignTask(payload = {}) {
  const clientId = payload.clientId;
  if (!clientId) {
    throw new AppError("clientId is required.", 400, "VALIDATION_ERROR");
  }

  const serviceCode = slugifyServiceCode(payload.serviceCode || payload.serviceName || payload.title);
  const serviceName = normalizeText(payload.serviceName || payload.serviceCode || "CRM Service");
  let assignedStaffId = normalizeText(payload.assignedStaffId || "");
  let assignedStaffName = normalizeText(payload.assignedStaffName || "");

  if (!assignedStaffId || !assignedStaffName) {
    const mapping = await taskRepository.findActiveMappingByServiceCode(serviceCode);
    if (!mapping) {
      throw new AppError("No active staff mapping found for service.", 404, "SERVICE_MAPPING_NOT_FOUND");
    }

    assignedStaffId = mapping.staff_id;
    assignedStaffName = mapping.staff_name;
  }

  const slaMinutes = Number(payload.slaMinutes || 60);
  const slaDueAt = payload.slaDueAt ? new Date(payload.slaDueAt).toISOString() : new Date(Date.now() + slaMinutes * 60 * 1000).toISOString();

  return taskRepository.createTask({
    clientId,
    serviceCode,
    serviceName,
    assignedStaffId,
    assignedStaffName,
    title: normalizeText(payload.title || `${serviceName} task`),
    description: normalizeText(payload.description || "") || null,
    priority: normalizeText(payload.priority || "normal"),
    slaDueAt,
    timestamp: now(),
  });
}

async function updateTaskStatus(taskId, status) {
  const timestamp = now();
  return taskRepository.updateTaskStatus(taskId, normalizeStatus(status, "assigned"), timestamp, timestamp);
}

async function listTasks(filters = {}) {
  return taskRepository.listTasks(filters);
}

async function scheduleFollowUps(leadId, baseTime) {
  return followUpService.scheduleForLead(leadId, baseTime);
}

async function listFollowUps(leadId) {
  return followUpService.listByLead(leadId);
}

async function getLeadStatus(id) {
  const lead = await getLead(id);
  const client =
    (await clientRepository.findByPhone(normalizePhone(lead.phone)).catch(() => null)) ||
    (await clientRepository.findByPhone(lead.phone).catch(() => null));
  const services = client ? await serviceRepository.listByClientId(client.id) : [];
  const tasks = client ? await taskRepository.listTasks({ clientId: client.id }) : [];
  const followUps = await followUpService.listByLead(lead.id);

  return {
    lead,
    client,
    services,
    tasks,
    followUps,
    summary: {
      leadStatus: lead.status,
      serviceStatus: services.length ? services[0].status : null,
      taskStatus: {
        total: tasks.length,
        assigned: countByStatus(tasks, "status", "assigned"),
        inProgress: countByStatus(tasks, "status", "in_progress"),
        blocked: countByStatus(tasks, "status", "blocked"),
        completed: countByStatus(tasks, "status", "completed"),
      },
      followUpStatus: {
        total: followUps.length,
        scheduled: countByStatus(followUps, "status", "scheduled"),
        sent: countByStatus(followUps, "status", "sent"),
        cancelled: countByStatus(followUps, "status", "cancelled"),
      },
    },
  };
}

async function getClientStatus(clientId) {
  const client = await clientRepository.findById(clientId);
  if (!client) {
    throw new AppError("Client not found.", 404, "CLIENT_NOT_FOUND");
  }

  const services = await serviceRepository.listByClientId(client.id);
  const tasks = await taskRepository.listTasks({ clientId: client.id });
  const lead = await leadRepository.listFiltered({ search: client.phone }).then((records) => records.find((record) => record.phone === client.phone) || null);
  const followUps = lead ? await followUpService.listByLead(lead.id) : [];

  return {
    client,
    lead,
    services,
    tasks,
    followUps,
    summary: {
      services: {
        total: services.length,
        pending: countByStatus(services, "status", "pending"),
        inProgress: countByStatus(services, "status", "in_progress"),
        completed: countByStatus(services, "status", "completed"),
      },
      tasks: {
        total: tasks.length,
        assigned: countByStatus(tasks, "status", "assigned"),
        inProgress: countByStatus(tasks, "status", "in_progress"),
        blocked: countByStatus(tasks, "status", "blocked"),
        completed: countByStatus(tasks, "status", "completed"),
      },
      followUps: {
        total: followUps.length,
        scheduled: countByStatus(followUps, "status", "scheduled"),
        sent: countByStatus(followUps, "status", "sent"),
        cancelled: countByStatus(followUps, "status", "cancelled"),
      },
    },
  };
}

async function getPipelineOverview() {
  const [
    totalLeads,
    newLeads,
    contactedLeads,
    qualifiedLeads,
    convertedLeads,
    totalClients,
    totalServices,
    pendingServices,
    inProgressServices,
    completedServices,
    totalTasks,
    assignedTasks,
    inProgressTasks,
    blockedTasks,
    completedTasks,
    totalFollowUps,
    scheduledFollowUps,
    sentFollowUps,
    cancelledFollowUps,
  ] = await Promise.all([
    leadRepository.countAll(),
    leadRepository.countByStatus("new"),
    leadRepository.countByStatus("contacted"),
    leadRepository.countByStatus("qualified"),
    leadRepository.countByStatus("converted"),
    clientRepository.countAll(),
    serviceRepository.countAll(),
    serviceRepository.countByStatus("pending"),
    serviceRepository.countByStatus("in_progress"),
    serviceRepository.countByStatus("completed"),
    taskRepository.countAll(),
    taskRepository.countByStatus("assigned"),
    taskRepository.countByStatus("in_progress"),
    taskRepository.countByStatus("blocked"),
    taskRepository.countByStatus("completed"),
    followUpRepository.countAll(),
    followUpRepository.countByStatus("scheduled"),
    followUpRepository.countByStatus("sent"),
    followUpRepository.countByStatus("cancelled"),
  ]);

  return {
    leads: {
      total: totalLeads,
      new: newLeads,
      contacted: contactedLeads,
      qualified: qualifiedLeads,
      converted: convertedLeads,
    },
    clients: {
      total: totalClients,
    },
    services: {
      total: totalServices,
      pending: pendingServices,
      inProgress: inProgressServices,
      completed: completedServices,
    },
    tasks: {
      total: totalTasks,
      assigned: assignedTasks,
      inProgress: inProgressTasks,
      blocked: blockedTasks,
      completed: completedTasks,
    },
    followUps: {
      total: totalFollowUps,
      scheduled: scheduledFollowUps,
      sent: sentFollowUps,
      cancelled: cancelledFollowUps,
    },
  };
}

async function reconcileSuccessfulPayment({ payment, client, orderId, paymentId, paidAt }) {
  const timestamp = paidAt || now();
  const desiredName = normalizeText(payment.customer_name || client.name || "Paid customer");
  const desiredPhone = normalizeText(payment.customer_phone || client.phone || "");
  const desiredEmail = normalizeText(client.email || "") || null;
  const desiredMessage = buildPaymentLeadMessage(payment);
  const paymentNote = `Razorpay payment captured for order ${orderId} and payment ${paymentId} on ${timestamp}.`;

  const syncedClient = await clientRepository.updateById(client.id, {
    ...(desiredPhone ? { phone: desiredPhone } : {}),
    ...(desiredEmail ? { email: desiredEmail } : {}),
    name: desiredName || client.name,
    updatedAt: timestamp,
  });

  const matchedLead = await findMatchingLeadForPayment(payment);

  if (!matchedLead) {
    const createdLead = await leadRepository.create({
      name: desiredName || syncedClient.name,
      phone: desiredPhone || syncedClient.phone || "",
      email: desiredEmail,
      service: normalizeText(payment.service),
      message: desiredMessage,
      status: "converted",
      notes: paymentNote,
      leadScore: Number(payment.amount || 0) > 0 ? 100 : 0,
      leadTemperature: "hot",
      source: "payment",
      timestamp,
    });

    return {
      client: syncedClient,
      lead: createdLead,
      createdLead: true,
      updatedLead: false,
    };
  }

  const updatedLead = await leadRepository.updateById(matchedLead.id, {
    name: desiredName || matchedLead.name,
    phone: desiredPhone || matchedLead.phone,
    email: desiredEmail !== null ? desiredEmail : matchedLead.email,
    service: normalizeText(payment.service || matchedLead.service),
    message: desiredMessage || matchedLead.message,
    status: "converted",
    notes: appendLeadNote(matchedLead.notes, paymentNote),
    updatedAt: timestamp,
  });

  await followUpService.stopOnConversion(updatedLead.id).catch((error) => {
    logger.error("payment_followup_cancel_failed", {
      leadId: updatedLead.id,
      message: error.message,
    });
  });

  return {
    client: syncedClient,
    lead: updatedLead,
    createdLead: false,
    updatedLead: true,
  };
}

module.exports = {
  createLead,
  listLeads,
  getLead,
  updateLead,
  qualifyLead,
  convertLeadToClient,
  createServiceForClient,
  assignTask,
  updateTaskStatus,
  listTasks,
  scheduleFollowUps,
  listFollowUps,
  getLeadStatus,
  getClientStatus,
  getPipelineOverview,
  reconcileSuccessfulPayment,
};

