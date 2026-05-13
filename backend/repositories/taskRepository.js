const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const TASK_MAPPING_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["serviceCode", "service_code"],
  ["serviceName", "service_name"],
  ["staffId", "staff_id"],
  ["staffName", "staff_name"],
  ["isActive", "is_active"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

const TASK_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["clientId", "client_id"],
  ["serviceCode", "service_code"],
  ["serviceName", "service_name"],
  ["assignedStaffId", "assigned_staff_id"],
  ["assignedStaffName", "assigned_staff_name"],
  ["title", "title"],
  ["description", "description"],
  ["status", "status"],
  ["priority", "priority"],
  ["slaDueAt", "sla_due_at"],
  ["completedAt", "completed_at"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

function buildSlaStatus(task, referenceTime) {
  if (task.status === "completed") {
    return "met";
  }

  if (task.slaDueAt && new Date(task.slaDueAt).getTime() < new Date(referenceTime).getTime()) {
    return "breached";
  }

  return "active";
}

async function findMappingByServiceCode(serviceCode) {
  const record = await prisma.taskMapping.findUnique({
    where: { serviceCode },
  });

  return mapRecord(record, TASK_MAPPING_FIELD_MAP);
}

async function upsertMapping({ serviceCode, serviceName, staffId, staffName, isActive, timestamp }) {
  const record = await prisma.taskMapping.upsert({
    where: { serviceCode },
    create: {
      serviceCode,
      serviceName,
      staffId,
      staffName,
      isActive: Number(isActive),
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    update: {
      serviceName,
      staffId,
      staffName,
      isActive: Number(isActive),
      updatedAt: timestamp,
    },
  });

  return mapRecord(record, TASK_MAPPING_FIELD_MAP);
}

async function findActiveMappingByServiceCode(serviceCode) {
  const record = await prisma.taskMapping.findFirst({
    where: { serviceCode, isActive: 1 },
  });

  return mapRecord(record, TASK_MAPPING_FIELD_MAP);
}

async function createTask({ clientId, serviceCode, serviceName, assignedStaffId, assignedStaffName, title, description, priority, slaDueAt, timestamp }) {
  const record = await prisma.task.create({
    data: {
      clientId: clientId === null || clientId === undefined || clientId === "" ? null : String(clientId),
      serviceCode,
      serviceName,
      assignedStaffId,
      assignedStaffName,
      title,
      description,
      status: "assigned",
      priority,
      slaDueAt,
      completedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  });

  const mapped = mapRecord(record, TASK_FIELD_MAP);
  return mapped ? { ...mapped, sla_status: buildSlaStatus(mapped, new Date().toISOString()) } : null;
}

async function updateTaskStatus(id, status, completedAt, updatedAt) {
  await prisma.task.updateMany({
    where: { id: Number(id) },
    data: {
      status,
      completedAt: status === "completed" ? completedAt : undefined,
      updatedAt,
    },
  });

  const record = await prisma.task.findUnique({ where: { id: Number(id) } });
  const mapped = mapRecord(record, TASK_FIELD_MAP);
  return mapped ? { ...mapped, sla_status: buildSlaStatus(mapped, new Date().toISOString()) } : null;
}

async function listTasks(filters = {}) {
  const where = {};

  if (filters.serviceCode) {
    where.serviceCode = filters.serviceCode;
  }

  if (filters.assignedStaffId) {
    where.assignedStaffId = filters.assignedStaffId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.clientId) {
    where.clientId = String(filters.clientId);
  }

  const referenceTime = new Date().toISOString();
  const records = await prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return mapRecords(records, TASK_FIELD_MAP).map((task) => ({
    ...task,
    sla_status: buildSlaStatus(task, referenceTime),
  }));
}

async function listOverdueTasks() {
  const referenceTime = new Date().toISOString();
  const records = await prisma.task.findMany({
    where: {
      status: { not: "completed" },
      slaDueAt: { lt: referenceTime },
    },
    orderBy: { slaDueAt: "asc" },
  });

  return mapRecords(records, TASK_FIELD_MAP).map((task) => ({
    ...task,
    sla_status: "breached",
  }));
}

async function countAll() {
  return prisma.task.count();
}

async function countByStatus(status) {
  return prisma.task.count({ where: { status } });
}

module.exports = {
  findMappingByServiceCode,
  upsertMapping,
  findActiveMappingByServiceCode,
  createTask,
  updateTaskStatus,
  listTasks,
  listOverdueTasks,
  countAll,
  countByStatus,
};
