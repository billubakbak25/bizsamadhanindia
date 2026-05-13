const AppError = require("../utils/appError");
const clientRepository = require("../repositories/clientRepository");
const serviceRepository = require("../repositories/serviceRepository");
const documentRepository = require("../repositories/documentRepository");
const taskRepository = require("../repositories/taskRepository");
const workflowRepository = require("../repositories/workflowRepository");
const logRepository = require("../repositories/logRepository");
const followUpRepository = require("../repositories/followUpRepository");
const { saveClientDocument } = require("./fileService");
const { findServiceDefinition, listServiceCategories, normalizeKey } = require("../config/serviceExecutionCatalog");
const workflowEngine = require("./workflowEngineService");

const SERVICE_STATUS_FLOW = ["pending", "in_progress", "submitted", "completed"];

function now() {
  return new Date().toISOString();
}

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function normalizeStatus(value, fallback = "pending") {
  const normalized = String(value || "").trim().toLowerCase().replace(/\s+/g, "_");

  if (!normalized) {
    return fallback;
  }

  if (normalized === "active") {
    return "in_progress";
  }

  return SERVICE_STATUS_FLOW.includes(normalized) ? normalized : fallback;
}

function buildServiceRequestId(serviceId) {
  return `service:${serviceId}`;
}

function buildServiceName(payload, definition) {
  return String(payload.serviceName || payload.name || definition.serviceName || payload.serviceCode || "Service").trim();
}

function buildServiceCode(payload, definition) {
  return normalizeKey(payload.serviceCode || payload.serviceName || payload.name || definition.serviceCode);
}

function buildWorkflowContext(service, definition, metadata) {
  return {
    serviceId: service.id,
    clientId: service.clientId,
    serviceCode: definition.serviceCode,
    serviceName: service.name,
    categoryKey: definition.categoryKey,
    categoryLabel: definition.categoryLabel,
    metadata,
  };
}

function mergeMetadata(currentMetadata, updates = {}) {
  return {
    ...currentMetadata,
    ...updates,
  };
}

function getCurrentStep(definition, status) {
  return definition.steps.find((step) => step.status === status) || definition.steps[0];
}

function getNextAllowedStatus(currentStatus, desiredStatus) {
  const currentIndex = SERVICE_STATUS_FLOW.indexOf(normalizeStatus(currentStatus));
  const desiredIndex = SERVICE_STATUS_FLOW.indexOf(normalizeStatus(desiredStatus));

  if (desiredIndex === -1) {
    return null;
  }

  if (desiredIndex < currentIndex) {
    return null;
  }

  if (desiredIndex > currentIndex + 1) {
    return null;
  }

  return SERVICE_STATUS_FLOW[desiredIndex];
}

async function resolveAssignment(definition) {
  const mapping = await taskRepository.findActiveMappingByServiceCode(definition.serviceCode);

  if (mapping) {
    return {
      staffId: mapping.staffId || null,
      staffName: mapping.staffName || `${definition.categoryLabel} Team`,
    };
  }

  return {
    staffId: null,
    staffName: `${definition.categoryLabel} Team`,
  };
}

async function ensureWorkflowDefinition(definition, timestamp) {
  const existing = await workflowRepository.findDefinitionByServiceCode(definition.serviceCode);
  const stepsJson = JSON.stringify(definition.steps);

  if (existing && existing.stepsJson === stepsJson) {
    return existing;
  }

  return workflowRepository.saveDefinition({
    serviceCode: definition.serviceCode,
    serviceName: definition.serviceName,
    stepsJson,
    timestamp,
  });
}

async function ensureWorkflowInstance(service, definition, metadata, timestamp) {
  const serviceRequestId = buildServiceRequestId(service.id);
  const existing = await workflowRepository.findInstanceByServiceRequestId(serviceRequestId);

  if (existing) {
    return existing;
  }

  const currentStep = getCurrentStep(definition, normalizeStatus(service.status));

  return workflowRepository.createInstance({
    serviceRequestId,
    serviceCode: definition.serviceCode,
    serviceName: definition.serviceName,
    status: normalizeStatus(service.status),
    currentStepCode: currentStep.code,
    contextJson: JSON.stringify(buildWorkflowContext(service, definition, metadata)),
    stepsJson: JSON.stringify(definition.steps),
    timestamp,
  });
}

async function createTasksForStep(service, definition, metadata, step, timestamp) {
  const generatedSteps = Array.isArray(metadata.generatedSteps) ? metadata.generatedSteps : [];

  if (generatedSteps.includes(step.code)) {
    return [];
  }

  const assignment = await resolveAssignment(definition);
  const created = [];

  for (const template of step.tasks) {
    const dueAt = new Date(Date.parse(timestamp) + Number(template.slaDays || step.slaDays || 1) * 24 * 60 * 60 * 1000).toISOString();
    const task = await taskRepository.createTask({
      clientId: service.clientId,
      serviceCode: definition.serviceCode,
      serviceName: service.name,
      assignedStaffId: assignment.staffId,
      assignedStaffName: assignment.staffName,
      title: template.title,
      description: template.description,
      priority: template.priority || "normal",
      slaDueAt: dueAt,
      timestamp,
    });

    created.push(task);

    await workflowEngine.publishWorkflowEvent(
      workflowEngine.EVENT_TYPES.TASK_CREATED,
      {
        serviceId: service.id,
        clientId: service.clientId,
        serviceCode: definition.serviceCode,
        serviceName: service.name,
        stepCode: step.code,
        task,
      },
      { source: "service_service", metadata: { generatedBy: "service_service", stepCode: step.code } }
    );
  }

  return created;
}

async function logEvent(level, event, message, entityId, metadata = {}) {
  return logRepository.create({
    level,
    event,
    message,
    entityType: "service",
    entityId: String(entityId),
    metadata,
    createdAt: now(),
  });
}

async function getServiceBase(id) {
  const service = await serviceRepository.findById(id);

  if (!service) {
    throw new AppError("Service not found.", 404, "SERVICE_NOT_FOUND");
  }

  const metadata = parseJson(service.metadata, {});
  const definition = findServiceDefinition(metadata.serviceCode || service.name);

  if (!definition) {
    throw new AppError("Service definition not found.", 404, "SERVICE_DEFINITION_NOT_FOUND");
  }

  return { service, metadata, definition };
}

function mapTaskSummary(tasks) {
  const summary = {
    total: tasks.length,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  };

  const referenceTime = Date.now();

  for (const task of tasks) {
    if (task.status === "assigned") {
      summary.assigned += 1;
    } else if (task.status === "in_progress") {
      summary.inProgress += 1;
    } else if (task.status === "completed") {
      summary.completed += 1;
    }

    if (task.slaDueAt && task.status !== "completed" && Date.parse(task.slaDueAt) < referenceTime) {
      summary.overdue += 1;
    }
  }

  return summary;
}

function buildTimelineItems({ logs, tasks, documents, followUps }) {
  const items = [];

  for (const log of logs) {
    items.push({
      type: "log",
      title: log.event,
      message: log.message,
      at: log.createdAt,
      data: parseJson(log.metadata, {}),
    });
  }

  for (const task of tasks) {
    items.push({
      type: "task",
      title: task.title,
      message: task.description || task.status,
      at: task.updatedAt || task.createdAt,
      status: task.status,
      data: task,
    });
  }

  for (const document of documents) {
    items.push({
      type: "document",
      title: document.documentType || document.fileName,
      message: document.originalName || document.fileName,
      at: document.uploadedAt,
      status: document.reviewStatus,
      data: document,
    });
  }

  for (const followUp of followUps) {
    items.push({
      type: "follow_up",
      title: followUp.stepKey,
      message: followUp.message || followUp.status,
      at: followUp.updatedAt || followUp.scheduledFor,
      status: followUp.status,
      data: followUp,
    });
  }

  return items.sort((left, right) => Date.parse(right.at || 0) - Date.parse(left.at || 0));
}

async function loadServiceDetails(id) {
  const { service, metadata, definition } = await getServiceBase(id);
  const serviceRequestId = buildServiceRequestId(service.id);
  const [workflowInstance, tasks, documents, logs, followUps] = await Promise.all([
    workflowRepository.findInstanceByServiceRequestId(serviceRequestId),
    taskRepository.listTasks({ clientId: service.clientId, serviceCode: definition.serviceCode }),
    documentRepository.listByClientIdAndFolder(service.clientId, definition.serviceCode),
    logRepository.findByEntity("service", service.id),
    metadata.sourceLeadId
      ? followUpRepository.findMany({
          where: { leadId: Number(metadata.sourceLeadId) },
          orderBy: { scheduledFor: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const currentStep = definition.steps.find((step) => step.status === normalizeStatus(service.status)) || definition.steps[0];

  return {
    service,
    metadata,
    definition,
    workflowInstance,
    tasks,
    documents,
    logs,
    followUps,
    currentStep,
    taskSummary: mapTaskSummary(tasks),
    timeline: buildTimelineItems({ logs, tasks, documents, followUps }),
  };
}

async function createServiceRecord({ clientId, serviceCode, serviceName, orderId, paymentId, status, metadata = {}, source = "manual" }) {
  const client = await clientRepository.findById(clientId);

  if (!client) {
    throw new AppError("Client not found.", 404, "CLIENT_NOT_FOUND");
  }

  const timestamp = now();
  const definition = findServiceDefinition(serviceCode || serviceName || metadata.serviceCode || metadata.serviceName);

  if (!definition) {
    throw new AppError("Service definition not found.", 404, "SERVICE_DEFINITION_NOT_FOUND");
  }

  const normalizedStatus = normalizeStatus(status, "pending");
  const resolvedServiceName = String(serviceName || definition.serviceName).trim();
  const resolvedOrderId = String(orderId || `SRV-${client.id}-${Date.now()}`);
  const mergedMetadata = mergeMetadata(parseJson(metadata, {}), {
    source,
    serviceCode: definition.serviceCode,
    serviceName: resolvedServiceName,
    categoryKey: definition.categoryKey,
    categoryLabel: definition.categoryLabel,
    documentRequirements: [...definition.documentRequirements],
    generatedSteps: Array.isArray(metadata.generatedSteps) ? [...metadata.generatedSteps] : [],
    workflow: {
      status: normalizedStatus,
      currentStepCode: getCurrentStep(definition, normalizedStatus).code,
      lastStatusChangedAt: timestamp,
    },
  });

  const existing = await serviceRepository.findByOrderId(resolvedOrderId);

  if (existing) {
    await serviceRepository.updateById(existing.id, {
      clientId: client.id,
      orderId: resolvedOrderId,
      paymentId,
      name: resolvedServiceName,
      status: normalizedStatus,
      metadata: mergeMetadata(parseJson(existing.metadata, {}), mergedMetadata),
      updatedAt: timestamp,
    });

    await logEvent("info", "service.updated", `${resolvedServiceName} updated.`, existing.id, {
      serviceCode: definition.serviceCode,
      orderId: resolvedOrderId,
      source,
    });

    return loadServiceDetails(existing.id);
  }

  const service = await serviceRepository.create({
    clientId: client.id,
    orderId: resolvedOrderId,
    paymentId: paymentId || null,
    name: resolvedServiceName,
    status: normalizedStatus,
    metadata: mergedMetadata,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const savedDefinition = await ensureWorkflowDefinition(definition, timestamp);
  const workflowInstance = await ensureWorkflowInstance(service, definition, mergedMetadata, timestamp);
  const currentStep = getCurrentStep(definition, normalizedStatus);
  const generatedTasks = await createTasksForStep(service, definition, mergedMetadata, currentStep, timestamp);

  const nextMetadata = mergeMetadata(mergedMetadata, {
    workflowDefinitionId: savedDefinition ? savedDefinition.id : null,
    workflowInstanceId: workflowInstance ? workflowInstance.id : null,
    workflow: {
      status: normalizedStatus,
      currentStepCode: currentStep.code,
      lastStatusChangedAt: timestamp,
    },
    generatedSteps: [currentStep.code],
    generatedTaskCount: generatedTasks.length,
  });

  await serviceRepository.updateById(service.id, {
    metadata: nextMetadata,
    updatedAt: timestamp,
  });

  await logEvent("info", "service.created", `${resolvedServiceName} created.`, service.id, {
    serviceCode: definition.serviceCode,
    orderId: resolvedOrderId,
    source,
    generatedTaskCount: generatedTasks.length,
  });

  await workflowEngine.publishWorkflowEvent(
    workflowEngine.EVENT_TYPES.SERVICE_CREATED,
    {
      serviceId: service.id,
      clientId: service.clientId,
      serviceCode: definition.serviceCode,
      serviceName: resolvedServiceName,
      status: normalizedStatus,
      generatedTaskCount: generatedTasks.length,
      source,
      orderId: resolvedOrderId,
    },
    { source: "service_service", metadata: { source, orderId: resolvedOrderId } }
  );

  return loadServiceDetails(service.id);
}

async function createServiceForClient(clientId, payload = {}) {
  return createServiceRecord({
    clientId,
    serviceCode: payload.serviceCode || payload.service_code || payload.serviceName || payload.name,
    serviceName: payload.serviceName || payload.name || payload.serviceCode,
    orderId: payload.orderId,
    paymentId: payload.paymentId,
    status: payload.status || payload.serviceStatus || "pending",
    metadata: payload.metadata || {},
    source: payload.source || "crm",
  });
}

async function upsertServiceFromPayment({ client, payment, orderId, paymentId, paidAt, crmLead = null }) {
  return createServiceRecord({
    clientId: client.id,
    serviceCode: payment.service,
    serviceName: payment.service,
    orderId,
    paymentId,
    status: "in_progress",
    metadata: {
      source: "payment_verification",
      paidAt,
      paymentId,
      amount: payment.amount,
      currency: payment.currency,
      sourceLeadId: crmLead ? crmLead.id : undefined,
      crmLeadStatus: crmLead ? crmLead.status : undefined,
    },
    source: "payment_verification",
  });
}

async function listServices(filters = {}) {
  const records = await serviceRepository.findMany({
    clientId: filters.clientId,
    status: filters.status,
    orderId: filters.orderId,
    paymentId: filters.paymentId,
    orderBy: filters.orderBy || { updatedAt: "desc" },
  });

  const items = [];

  for (const service of records) {
    const metadata = parseJson(service.metadata, {});
    const definition = findServiceDefinition(metadata.serviceCode || service.name);

    if (!definition) {
      continue;
    }

    if (filters.category && normalizeKey(definition.categoryKey) !== normalizeKey(filters.category)) {
      continue;
    }

    const tasks = await taskRepository.listTasks({ clientId: service.clientId, serviceCode: definition.serviceCode });
    const documents = await documentRepository.listByClientIdAndFolder(service.clientId, definition.serviceCode);
    const currentStep = definition.steps.find((step) => step.status === normalizeStatus(service.status)) || definition.steps[0];

    items.push({
      ...service,
      metadata,
      serviceCode: definition.serviceCode,
      serviceName: service.name,
      categoryKey: definition.categoryKey,
      categoryLabel: definition.categoryLabel,
      currentStepCode: currentStep.code,
      statusFlow: [...definition.statusFlow],
      taskSummary: mapTaskSummary(tasks),
      documentCount: documents.length,
    });
  }

  return {
    total: items.length,
    items,
  };
}

async function getService(id) {
  return loadServiceDetails(id);
}

async function updateServiceStatus(id, nextStatus, payload = {}) {
  const { service, metadata, definition } = await getServiceBase(id);
  const currentStatus = normalizeStatus(service.status);
  const resolvedNextStatus = getNextAllowedStatus(currentStatus, nextStatus);

  if (!resolvedNextStatus) {
    throw new AppError("Invalid service status transition.", 400, "INVALID_STATUS_TRANSITION");
  }

  const timestamp = now();
  const currentStep = getCurrentStep(definition, resolvedNextStatus);
  const workflowInstance = await ensureWorkflowInstance(service, definition, metadata, timestamp);
  const generatedTasks = await createTasksForStep(service, definition, metadata, currentStep, timestamp);
  const nextMetadata = mergeMetadata(metadata, {
    workflow: {
      status: resolvedNextStatus,
      currentStepCode: currentStep.code,
      lastStatusChangedAt: timestamp,
      notes: payload.notes || metadata.workflow?.notes || null,
    },
    generatedSteps: Array.from(new Set([...(Array.isArray(metadata.generatedSteps) ? metadata.generatedSteps : []), currentStep.code])),
    generatedTaskCount: Number(metadata.generatedTaskCount || 0) + generatedTasks.length,
    completedAt: resolvedNextStatus === "completed" ? timestamp : metadata.completedAt || null,
  });

  await serviceRepository.updateById(service.id, {
    status: resolvedNextStatus,
    metadata: nextMetadata,
    updatedAt: timestamp,
  });

  await workflowRepository.updateInstance({
    id: workflowInstance.id,
    status: resolvedNextStatus,
    currentStepCode: currentStep.code,
    stepsJson: JSON.stringify(definition.steps),
    updatedAt: timestamp,
  });

  await logEvent("info", "service.status_changed", `${service.name} moved to ${resolvedNextStatus}.`, service.id, {
    from: currentStatus,
    to: resolvedNextStatus,
    stepCode: currentStep.code,
    generatedTaskCount: generatedTasks.length,
    notes: payload.notes || null,
  });

  await workflowEngine.publishWorkflowEvent(
    workflowEngine.EVENT_TYPES.STATUS_UPDATED,
    {
      serviceId: service.id,
      clientId: service.clientId,
      serviceCode: definition.serviceCode,
      from: currentStatus,
      to: resolvedNextStatus,
      stepCode: currentStep.code,
      generatedTaskCount: generatedTasks.length,
      notes: payload.notes || null,
      manualUpdate: true,
    },
    { source: "service_service", metadata: { manualUpdate: true, serviceId: service.id } }
  );

  return loadServiceDetails(service.id);
}

async function uploadServiceDocument(id, payload = {}, file, actor = {}) {
  const { service, metadata, definition } = await getServiceBase(id);
  const documentType = String(payload.documentType || payload.document_type || "general").trim();

  const uploadResult = await saveClientDocument({
    clientId: service.clientId,
    file,
    documentType,
    serviceCode: definition.serviceCode,
    folderName: definition.serviceCode,
  });

  await logEvent("info", "service.document_uploaded", `${service.name} document uploaded.`, service.id, {
    documentType,
    uploadedBy: actor.userId || actor.role || "system",
    fileName: uploadResult.fileName,
  });

  await workflowEngine.publishWorkflowEvent(
    workflowEngine.EVENT_TYPES.DOCUMENT_UPLOADED,
    {
      serviceId: service.id,
      clientId: service.clientId,
      serviceCode: definition.serviceCode,
      documentType,
      fileName: uploadResult.fileName,
      uploadedBy: actor.userId || actor.role || "system",
    },
    { source: "service_service", metadata: { serviceId: service.id, documentType } }
  );

  const updatedMetadata = mergeMetadata(metadata, {
    lastDocumentUploadAt: now(),
    lastDocumentType: documentType,
  });

  await serviceRepository.updateById(service.id, {
    metadata: updatedMetadata,
    updatedAt: now(),
  });

  return {
    upload: uploadResult,
    service: await loadServiceDetails(service.id),
  };
}

async function getServiceTimeline(id) {
  return loadServiceDetails(id);
}

function getServiceCategories() {
  return listServiceCategories();
}

module.exports = {
  createServiceForClient,
  upsertServiceFromPayment,
  listServices,
  getService,
  updateServiceStatus,
  uploadServiceDocument,
  getServiceTimeline,
  getServiceCategories,
};
