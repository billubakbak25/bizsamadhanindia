const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const clientRepository = require("../repositories/clientRepository");
const serviceRepository = require("../repositories/serviceRepository");
const taskRepository = require("../repositories/taskRepository");
const workflowRepository = require("../repositories/workflowRepository");
const followUpRepository = require("../repositories/followUpRepository");
const logRepository = require("../repositories/logRepository");
const { findServiceDefinition, normalizeKey } = require("../config/serviceExecutionCatalog");
const { sendTextMessage } = require("./whatsappService");
const { EVENT_TYPES, publishWorkflowEvent, registerWorkflowHandler } = require("./workflowEngineService");

const SERVICE_STATUS_FLOW = ["pending", "in_progress", "submitted", "completed"];
let initialized = false;

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

function mergeMetadata(currentMetadata, updates = {}) {
  return {
    ...currentMetadata,
    ...updates,
  };
}

function buildServiceRequestId(serviceId) {
  return `service:${serviceId}`;
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

async function auditEvent(level, event, message, entityType, entityId, metadata = {}) {
  return logRepository.create({
    level,
    event,
    message,
    entityType,
    entityId: entityId === null || entityId === undefined ? null : String(entityId),
    metadata,
    createdAt: now(),
  });
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

async function createTasksForStep(service, definition, metadata, step, timestamp, source = "workflow_engine") {
  const generatedSteps = Array.isArray(metadata.generatedSteps) ? metadata.generatedSteps : [];

  if (generatedSteps.includes(step.code)) {
    return [];
  }

  const assignment = await resolveAssignment(definition);
  const created = [];

  for (const template of step.tasks) {
    const dueAt = new Date(
      Date.parse(timestamp) + Number(template.slaDays || step.slaDays || 1) * 24 * 60 * 60 * 1000
    ).toISOString();

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

    await publishWorkflowEvent(
      EVENT_TYPES.TASK_CREATED,
      {
        serviceId: service.id,
        clientId: service.clientId,
        serviceCode: definition.serviceCode,
        serviceName: service.name,
        stepCode: step.code,
        task,
      },
      { source, metadata: { generatedBy: "workflow_engine", stepCode: step.code } }
    );
  }

  return created;
}

async function loadServiceContext(serviceId) {
  const service = await serviceRepository.findById(serviceId);

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

async function findServiceForTask(task) {
  const services = await serviceRepository.findMany({
    clientId: task.clientId,
    orderBy: { createdAt: "desc" },
  });

  for (const service of services) {
    const metadata = parseJson(service.metadata, {});
    if (normalizeKey(metadata.serviceCode || service.name) === normalizeKey(task.serviceCode)) {
      return {
        service,
        metadata,
        definition: findServiceDefinition(metadata.serviceCode || service.name),
      };
    }
  }

  return null;
}

async function scheduleServiceFollowUp(service, definition, metadata, status, note) {
  if (!metadata.sourceLeadId) {
    return null;
  }

  const leadId = Number(metadata.sourceLeadId);
  const stepKey = `service_${definition.serviceCode}_${status}`;
  const existing = await followUpRepository.findMany({
    where: {
      leadId,
      stepKey,
    },
    orderBy: { scheduledFor: "asc" },
  });

  if (existing.length) {
    return existing[0];
  }

  const timestamp = now();
  return followUpRepository.create({
    leadId,
    stepKey,
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    channel: "whatsapp",
    message: note || `Follow up on ${definition.serviceName} service status: ${status}.`,
    sentAt: null,
    cancelledReason: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

async function cancelServiceFollowUps(metadata) {
  if (!metadata.sourceLeadId) {
    return null;
  }

  const timestamp = now();
  await followUpRepository.updateMany(
    {
      leadId: Number(metadata.sourceLeadId),
      status: "scheduled",
    },
    {
      status: "cancelled",
      cancelledReason: "service_completed",
      updatedAt: timestamp,
    }
  );

  return followUpRepository.findMany({
    where: {
      leadId: Number(metadata.sourceLeadId),
    },
    orderBy: { scheduledFor: "asc" },
  });
}

async function notifyClient(service, definition, message) {
  const client = await clientRepository.findById(service.clientId);

  if (!client || !client.phone) {
    return {
      sent: false,
      status: "skipped",
      reason: "Client phone number is not available.",
    };
  }

  return sendTextMessage({
    phone: client.phone,
    message,
  });
}

async function handleServiceCreated(event) {
  const { serviceId, generatedTaskCount = 0, source = "system" } = event.payload || {};
  const context = await loadServiceContext(serviceId);
  const timestamp = now();

  await ensureWorkflowDefinition(context.definition, timestamp);
  await ensureWorkflowInstance(context.service, context.definition, context.metadata, timestamp);
  await auditEvent("info", "workflow.service_created", `${context.service.name} created.`, "service", context.service.id, {
    eventId: event.id,
    source,
    serviceCode: context.definition.serviceCode,
    generatedTaskCount,
  });

  await scheduleServiceFollowUp(context.service, context.definition, context.metadata, "created", `Kickoff follow-up for ${context.definition.serviceName}.`).catch(
    (error) => {
      logger.warn("workflow_followup_schedule_failed", {
        eventId: event.id,
        serviceId: context.service.id,
        message: error.message,
      });
    }
  );

  await notifyClient(
    context.service,
    context.definition,
    `Your ${context.definition.serviceName} service has been created and is now ${normalizeStatus(context.service.status)}.`
  ).catch((error) => {
    logger.warn("workflow_client_notification_failed", {
      eventId: event.id,
      serviceId: context.service.id,
      message: error.message,
    });
  });

  return { handled: true, serviceId: context.service.id };
}

async function handleTaskCreated(event) {
  const { serviceId, task, stepCode } = event.payload || {};

  if (!task) {
    throw new AppError("Task payload is required.", 400, "VALIDATION_ERROR");
  }

  await auditEvent("info", "workflow.task_created", `Task ${task.title} created.`, "task", task.id, {
    eventId: event.id,
    serviceId: serviceId || null,
    stepCode: stepCode || null,
    assignedStaffId: task.assignedStaffId || null,
    assignedStaffName: task.assignedStaffName || null,
    slaDueAt: task.slaDueAt || null,
  });

  return { handled: true, taskId: task.id };
}

async function autoAdvanceServiceFromTasks(task) {
  const context = await findServiceForTask(task);

  if (!context || !context.definition) {
    return null;
  }

  const { service, metadata, definition } = context;
  const currentStatus = normalizeStatus(service.status);
  const workflowStatusIndex = SERVICE_STATUS_FLOW.indexOf(currentStatus);
  const tasks = await taskRepository.listTasks({ clientId: service.clientId, serviceCode: definition.serviceCode });
  const allTasksCompleted = tasks.length > 0 && tasks.every((row) => row.status === "completed");

  if (!allTasksCompleted) {
    return null;
  }

  const nextStatus = SERVICE_STATUS_FLOW[Math.min(workflowStatusIndex + 1, SERVICE_STATUS_FLOW.length - 1)];
  if (!nextStatus || nextStatus === currentStatus) {
    return null;
  }

  const timestamp = now();
  const currentStep = getCurrentStep(definition, nextStatus);
  const workflowInstance = await ensureWorkflowInstance(service, definition, metadata, timestamp);
  const generatedTasks = nextStatus === "completed" ? [] : await createTasksForStep(service, definition, metadata, currentStep, timestamp, "workflow_engine");

  const nextMetadata = mergeMetadata(metadata, {
    workflow: {
      status: nextStatus,
      currentStepCode: currentStep.code,
      lastStatusChangedAt: timestamp,
    },
    generatedSteps: Array.from(
      new Set([...(Array.isArray(metadata.generatedSteps) ? metadata.generatedSteps : []), currentStep.code])
    ),
    generatedTaskCount: Number(metadata.generatedTaskCount || 0) + generatedTasks.length,
    completedAt: nextStatus === "completed" ? timestamp : metadata.completedAt || null,
  });

  await serviceRepository.updateById(service.id, {
    status: nextStatus,
    metadata: nextMetadata,
    updatedAt: timestamp,
  });

  await workflowRepository.updateInstance({
    id: workflowInstance.id,
    status: nextStatus,
    currentStepCode: currentStep.code,
    stepsJson: JSON.stringify(definition.steps),
    updatedAt: timestamp,
  });

  await auditEvent("info", "service.status_changed", `${service.name} moved to ${nextStatus}.`, "service", service.id, {
    eventId: task.id || null,
    from: currentStatus,
    to: nextStatus,
    stepCode: currentStep.code,
    autoProgressed: true,
  });

  await publishWorkflowEvent(
    EVENT_TYPES.STATUS_UPDATED,
    {
      serviceId: service.id,
      clientId: service.clientId,
      serviceCode: definition.serviceCode,
      from: currentStatus,
      to: nextStatus,
      autoProgressed: true,
      note: `Service advanced automatically after task completion.`,
    },
    { source: "workflow_engine", metadata: { autoProgressed: true, serviceId: service.id } }
  );

  if (nextStatus === "completed") {
    await cancelServiceFollowUps(nextMetadata).catch((error) => {
      logger.warn("workflow_followup_cancel_failed", {
        serviceId: service.id,
        message: error.message,
      });
    });
  }

  return {
    serviceId: service.id,
    status: nextStatus,
    generatedTaskCount: generatedTasks.length,
  };
}

async function handleTaskCompleted(event) {
  const { task } = event.payload || {};

  if (!task) {
    throw new AppError("Task payload is required.", 400, "VALIDATION_ERROR");
  }

  await auditEvent("info", "workflow.task_completed", `Task ${task.title} completed.`, "task", task.id, {
    eventId: event.id,
    serviceCode: task.serviceCode || null,
    clientId: task.clientId || null,
    assignedStaffId: task.assignedStaffId || null,
    slaDueAt: task.slaDueAt || null,
  });

  const advanceResult = await autoAdvanceServiceFromTasks(task);

  return {
    handled: true,
    taskId: task.id,
    advanceResult,
  };
}

async function handleStatusUpdated(event) {
  const { serviceId, from, to, note, autoProgressed = false, task } = event.payload || {};

  if (!serviceId) {
    await auditEvent("info", "workflow.status_updated", `Task status updated to ${to || event.payload.status || task?.status || "unknown"}.`, "task", task ? task.id : null, {
      eventId: event.id,
      status: to || event.payload.status || task?.status || null,
      taskId: task ? task.id : null,
    });

    return {
      handled: true,
      taskId: task ? task.id : null,
    };
  }

  const context = await loadServiceContext(serviceId);
  const timestamp = now();

  await auditEvent("info", "workflow.status_updated", `${context.service.name} status updated to ${to}.`, "service", context.service.id, {
    eventId: event.id,
    from,
    to,
    note: note || null,
    autoProgressed,
  });

  if (to === "submitted") {
    await scheduleServiceFollowUp(context.service, context.definition, context.metadata, "submitted", `${context.definition.serviceName} has been submitted.`).catch(
      (error) => {
        logger.warn("workflow_followup_schedule_failed", {
          eventId: event.id,
          serviceId: context.service.id,
          message: error.message,
        });
      }
    );
  }

  if (to === "completed") {
    await cancelServiceFollowUps(context.metadata).catch((error) => {
      logger.warn("workflow_followup_cancel_failed", {
        eventId: event.id,
        serviceId: context.service.id,
        message: error.message,
      });
    });
  }

  await notifyClient(
    context.service,
    context.definition,
    `Your ${context.definition.serviceName} service moved to ${String(to || "").replace(/_/g, " ")}.`
  ).catch((error) => {
    logger.warn("workflow_client_notification_failed", {
      eventId: event.id,
      serviceId: context.service.id,
      message: error.message,
    });
  });

  await auditEvent("info", "workflow.audit", "Workflow status notification processed.", "service", context.service.id, {
    eventId: event.id,
    timestamp,
  });

  return { handled: true, serviceId: context.service.id, status: to };
}

async function handleDocumentUploaded(event) {
  const { serviceId, documentType, fileName, uploadedBy } = event.payload || {};
  const context = await loadServiceContext(serviceId);

  await auditEvent("info", "workflow.document_uploaded", `${context.service.name} document uploaded.`, "service", context.service.id, {
    eventId: event.id,
    documentType: documentType || null,
    fileName: fileName || null,
    uploadedBy: uploadedBy || null,
  });

  await notifyClient(
    context.service,
    context.definition,
    `We received your ${documentType || "document"} for ${context.definition.serviceName}.`
  ).catch((error) => {
    logger.warn("workflow_client_notification_failed", {
      eventId: event.id,
      serviceId: context.service.id,
      message: error.message,
    });
  });

  return { handled: true, serviceId: context.service.id };
}

function initializeWorkflowHandlers() {
  if (initialized) {
    return true;
  }

  registerWorkflowHandler(EVENT_TYPES.SERVICE_CREATED, handleServiceCreated);
  registerWorkflowHandler(EVENT_TYPES.TASK_CREATED, handleTaskCreated);
  registerWorkflowHandler(EVENT_TYPES.TASK_COMPLETED, handleTaskCompleted);
  registerWorkflowHandler(EVENT_TYPES.STATUS_UPDATED, handleStatusUpdated);
  registerWorkflowHandler(EVENT_TYPES.DOCUMENT_UPLOADED, handleDocumentUploaded);

  initialized = true;
  return true;
}

initializeWorkflowHandlers();

module.exports = {
  initializeWorkflowHandlers,
  EVENT_TYPES,
  publishWorkflowEvent,
};
