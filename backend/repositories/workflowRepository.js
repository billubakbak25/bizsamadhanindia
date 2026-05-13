const { prisma } = require("../lib/prisma");
const { mapRecord, buildFieldMap } = require("./prismaMapper");

const WORKFLOW_DEFINITION_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["serviceCode", "service_code"],
  ["serviceName", "service_name"],
  ["stepsJson", "steps_json"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

const WORKFLOW_INSTANCE_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["serviceRequestId", "service_request_id"],
  ["serviceCode", "service_code"],
  ["serviceName", "service_name"],
  ["status", "status"],
  ["currentStepCode", "current_step_code"],
  ["contextJson", "context_json"],
  ["stepsJson", "steps_json"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

async function findDefinitionByServiceCode(serviceCode) {
  const record = await prisma.workflowDefinition.findUnique({
    where: { serviceCode },
  });

  return mapRecord(record, WORKFLOW_DEFINITION_FIELD_MAP);
}

async function saveDefinition({ serviceCode, serviceName, stepsJson, timestamp }) {
  const record = await prisma.workflowDefinition.upsert({
    where: { serviceCode },
    create: {
      serviceCode,
      serviceName,
      stepsJson,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    update: {
      serviceName,
      stepsJson,
      updatedAt: timestamp,
    },
  });

  return mapRecord(record, WORKFLOW_DEFINITION_FIELD_MAP);
}

async function findInstanceByServiceRequestId(serviceRequestId) {
  const record = await prisma.workflowInstance.findUnique({
    where: { serviceRequestId },
  });

  return mapRecord(record, WORKFLOW_INSTANCE_FIELD_MAP);
}

async function createInstance({ serviceRequestId, serviceCode, serviceName, status, currentStepCode, contextJson, stepsJson, timestamp }) {
  const record = await prisma.workflowInstance.create({
    data: {
      serviceRequestId,
      serviceCode,
      serviceName,
      status,
      currentStepCode,
      contextJson,
      stepsJson,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  });

  return mapRecord(record, WORKFLOW_INSTANCE_FIELD_MAP);
}

async function updateInstance({ id, status, currentStepCode, stepsJson, updatedAt }) {
  await prisma.workflowInstance.updateMany({
    where: { id: Number(id) },
    data: {
      status,
      currentStepCode,
      stepsJson,
      updatedAt,
    },
  });

  const record = await prisma.workflowInstance.findUnique({ where: { id: Number(id) } });
  return mapRecord(record, WORKFLOW_INSTANCE_FIELD_MAP);
}

module.exports = {
  findDefinitionByServiceCode,
  saveDefinition,
  findInstanceByServiceRequestId,
  createInstance,
  updateInstance,
};
