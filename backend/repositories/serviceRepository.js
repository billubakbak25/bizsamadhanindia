const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const SERVICE_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["clientId", "client_id"],
  ["orderId", "order_id"],
  ["paymentId", "payment_id"],
  ["name", "name"],
  ["status", "status"],
  ["metadata", "metadata"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

function serializeMetadata(metadata) {
  if (metadata === undefined) {
    return undefined;
  }

  if (metadata === null) {
    return null;
  }

  if (typeof metadata === "string") {
    return metadata;
  }

  return JSON.stringify(metadata);
}

async function findByOrderId(orderId) {
  const record = await prisma.service.findFirst({
    where: { orderId: String(orderId) },
  });

  return mapRecord(record, SERVICE_FIELD_MAP);
}

async function findById(id) {
  const record = await prisma.service.findUnique({
    where: { id: Number(id) },
  });

  return mapRecord(record, SERVICE_FIELD_MAP);
}

async function findMany(filters = {}) {
  const where = {};

  if (filters.clientId !== undefined && filters.clientId !== null && filters.clientId !== "") {
    where.clientId = Number(filters.clientId);
  }

  if (filters.status) {
    where.status = String(filters.status);
  }

  if (filters.orderId) {
    where.orderId = String(filters.orderId);
  }

  if (filters.paymentId) {
    where.paymentId = String(filters.paymentId);
  }

  const records = await prisma.service.findMany({
    where,
    orderBy: filters.orderBy || { updatedAt: "desc" },
  });

  return mapRecords(records, SERVICE_FIELD_MAP);
}

async function create({ clientId, orderId, paymentId, name, status, metadata, createdAt, updatedAt }) {
  const record = await prisma.service.create({
    data: {
      clientId: Number(clientId),
      orderId,
      paymentId,
      name,
      status,
      metadata: serializeMetadata(metadata),
      createdAt,
      updatedAt,
    },
  });

  return mapRecord(record, SERVICE_FIELD_MAP);
}

async function updateById(id, { clientId, orderId, paymentId, name, status, metadata, updatedAt }) {
  const data = {};

  if (clientId !== undefined) {
    data.clientId = Number(clientId);
  }

  if (orderId !== undefined) {
    data.orderId = orderId;
  }

  if (paymentId !== undefined) {
    data.paymentId = paymentId;
  }

  if (name !== undefined) {
    data.name = name;
  }

  if (status !== undefined) {
    data.status = status;
  }

  if (metadata !== undefined) {
    data.metadata = serializeMetadata(metadata);
  }

  if (updatedAt !== undefined) {
    data.updatedAt = updatedAt;
  }

  if (Object.keys(data).length > 0) {
    await prisma.service.updateMany({
      where: { id: Number(id) },
      data,
    });
  }

  const record = await prisma.service.findUnique({ where: { id: Number(id) } });
  return mapRecord(record, SERVICE_FIELD_MAP);
}

async function listByClientId(clientId) {
  return findMany({ clientId });
}

async function countAll() {
  return prisma.service.count();
}

async function countByStatus(status) {
  return prisma.service.count({ where: { status } });
}

module.exports = {
  findByOrderId,
  findById,
  findMany,
  create,
  updateById,
  listByClientId,
  countAll,
  countByStatus,
};
