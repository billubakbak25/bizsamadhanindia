const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const LEAD_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["name", "name"],
  ["phone", "phone"],
  ["email", "email"],
  ["service", "service"],
  ["message", "message"],
  ["status", "status"],
  ["notes", "notes"],
  ["leadScore", "lead_score"],
  ["leadTemperature", "lead_temperature"],
  ["source", "source"],
  ["submittedAt", "timestamp"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

function buildUtcDateRange(date) {
  const start = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

async function create({ name, phone, email, service, message, status, notes, leadScore, leadTemperature, source, timestamp }) {
  const record = await prisma.lead.create({
    data: {
      name,
      phone,
      email,
      service,
      message,
      status,
      notes,
      leadScore: Number(leadScore) || 0,
      leadTemperature,
      source,
      submittedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  });

  return mapRecord(record, LEAD_FIELD_MAP);
}

async function findById(id) {
  const record = await prisma.lead.findUnique({
    where: { id: Number(id) },
  });

  return mapRecord(record, LEAD_FIELD_MAP);
}

async function updateById(id, { name, phone, email, service, message, status, notes, updatedAt }) {
  await prisma.lead.updateMany({
    where: { id: Number(id) },
    data: {
      name,
      phone,
      email,
      service,
      message,
      status,
      notes,
      updatedAt,
    },
  });

  return findById(id);
}

async function listFiltered({ status = "", service = "", date = "", search = "" }) {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (service) {
    where.service = service;
  }

  if (date) {
    const range = buildUtcDateRange(date);
    if (range) {
      where.submittedAt = {
        gte: range.start,
        lt: range.end,
      };
    }
  }

  if (search) {
    const wildcard = search.trim();
    where.OR = [
      { name: { contains: wildcard, mode: "insensitive" } },
      { phone: { contains: wildcard, mode: "insensitive" } },
      { message: { contains: wildcard, mode: "insensitive" } },
    ];
  }

  const records = await prisma.lead.findMany({
    where,
    orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
  });

  return mapRecords(records, LEAD_FIELD_MAP);
}

async function removeById(id) {
  const result = await prisma.lead.deleteMany({
    where: { id: Number(id) },
  });

  return { changes: result.count };
}

async function countAll() {
  return prisma.lead.count();
}

async function countByStatus(status) {
  return prisma.lead.count({ where: { status } });
}

module.exports = {
  create,
  findById,
  updateById,
  listFiltered,
  removeById,
  countAll,
  countByStatus,
};
