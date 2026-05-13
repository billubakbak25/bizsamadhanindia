const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const SUPPORT_TICKET_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["clientId", "client_id"],
  ["subject", "subject"],
  ["category", "category"],
  ["priority", "priority"],
  ["message", "message"],
  ["status", "status"],
  ["resolvedAt", "resolved_at"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

function now() {
  return new Date().toISOString();
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizePriority(value) {
  const normalized = normalizeText(value).toLowerCase();
  return ["low", "normal", "high", "urgent"].includes(normalized) ? normalized : "normal";
}

function normalizeStatus(value) {
  const normalized = normalizeText(value).toLowerCase();
  return ["open", "in_progress", "resolved", "closed"].includes(normalized) ? normalized : "open";
}

async function create({
  clientId,
  subject,
  category,
  priority = "normal",
  message,
  status = "open",
  resolvedAt = null,
  createdAt,
  updatedAt,
}) {
  const timestamp = createdAt || now();
  const record = await prisma.supportTicket.create({
    data: {
      clientId: Number(clientId),
      subject: normalizeText(subject),
      category: normalizeText(category),
      priority: normalizePriority(priority),
      message: normalizeText(message),
      status: normalizeStatus(status),
      resolvedAt: resolvedAt || null,
      createdAt: timestamp,
      updatedAt: updatedAt || timestamp,
    },
  });

  return mapRecord(record, SUPPORT_TICKET_FIELD_MAP);
}

async function findById(id) {
  const record = await prisma.supportTicket.findUnique({
    where: { id: Number(id) },
  });

  return mapRecord(record, SUPPORT_TICKET_FIELD_MAP);
}

async function updateStatus(id, status) {
  const normalizedStatus = normalizeStatus(status);
  const timestamp = now();
  const resolvedAt = ["resolved", "closed"].includes(normalizedStatus) ? timestamp : null;

  await prisma.supportTicket.updateMany({
    where: { id: Number(id) },
    data: {
      status: normalizedStatus,
      resolvedAt,
      updatedAt: timestamp,
    },
  });

  return findById(id);
}

async function listByClientId(clientId) {
  const records = await prisma.supportTicket.findMany({
    where: { clientId: Number(clientId) },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });

  return mapRecords(records, SUPPORT_TICKET_FIELD_MAP);
}

module.exports = {
  create,
  findById,
  updateStatus,
  listByClientId,
};
