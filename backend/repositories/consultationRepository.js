const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const CONSULTATION_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["requestCode", "request_code"],
  ["name", "name"],
  ["phone", "phone"],
  ["email", "email"],
  ["consultationType", "consultation_type"],
  ["service", "service"],
  ["preferredDate", "preferred_date"],
  ["preferredSlot", "preferred_slot"],
  ["mode", "mode"],
  ["notes", "notes"],
  ["status", "status"],
  ["source", "source"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

function now() {
  return new Date().toISOString();
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeMode(value) {
  const mode = normalizeText(value).toLowerCase();
  return mode === "video" ? "video" : "call";
}

function toRequestCode() {
  return `CONS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function buildWhereClause(filters = {}) {
  const where = {};

  if (filters.status) {
    where.status = normalizeText(filters.status).toLowerCase();
  }

  if (filters.mode) {
    where.mode = normalizeMode(filters.mode);
  }

  if (filters.service) {
    where.service = {
      equals: normalizeText(filters.service),
      mode: "insensitive",
    };
  }

  if (filters.consultationType) {
    where.consultationType = {
      equals: normalizeText(filters.consultationType),
      mode: "insensitive",
    };
  }

  if (filters.search) {
    const search = normalizeText(filters.search);
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { service: { contains: search, mode: "insensitive" } },
      { consultationType: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
}

async function createRequest({
  name,
  phone,
  email = null,
  consultationType,
  service,
  preferredDate,
  preferredSlot = null,
  mode = "call",
  notes = null,
  status = "new",
  source = "website",
}) {
  const timestamp = now();
  const record = await prisma.consultationRequest.create({
    data: {
      requestCode: toRequestCode(),
      name: normalizeText(name),
      phone: normalizePhone(phone),
      email: normalizeEmail(email) || null,
      consultationType: normalizeText(consultationType),
      service: normalizeText(service),
      preferredDate: normalizeText(preferredDate),
      preferredSlot: preferredSlot ? normalizeText(preferredSlot) : null,
      mode: normalizeMode(mode),
      notes: notes ? normalizeText(notes) : null,
      status: normalizeText(status || "new").toLowerCase(),
      source: normalizeText(source || "website"),
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  });

  return mapRecord(record, CONSULTATION_FIELD_MAP);
}

async function findById(id) {
  const record = await prisma.consultationRequest.findUnique({
    where: { id: Number(id) },
  });

  return mapRecord(record, CONSULTATION_FIELD_MAP);
}

async function listRequests(filters = {}) {
  const where = buildWhereClause(filters);
  const limit = Number.parseInt(filters.limit, 10);
  const offset = Number.parseInt(filters.offset, 10);
  const safeLimit = Number.isFinite(limit) && limit >= 0 ? Math.min(limit, 100) : 20;
  const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;

  const [total, newCount, scheduledCount, confirmedCount, completedCount, cancelledCount, items] = await Promise.all([
    prisma.consultationRequest.count({ where }),
    prisma.consultationRequest.count({ where: { ...where, status: "new" } }),
    prisma.consultationRequest.count({ where: { ...where, status: "scheduled" } }),
    prisma.consultationRequest.count({ where: { ...where, status: "confirmed" } }),
    prisma.consultationRequest.count({ where: { ...where, status: "completed" } }),
    prisma.consultationRequest.count({ where: { ...where, status: "cancelled" } }),
    prisma.consultationRequest.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: safeLimit,
      skip: safeOffset,
    }),
  ]);

  return {
    items: mapRecords(items, CONSULTATION_FIELD_MAP),
    summary: {
      total,
      new: newCount,
      scheduled: scheduledCount,
      confirmed: confirmedCount,
      completed: completedCount,
      cancelled: cancelledCount,
    },
    pagination: {
      total,
      limit: safeLimit,
      offset: safeOffset,
    },
  };
}

async function listByPhone(phone) {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return [];
  }

  const records = await prisma.consultationRequest.findMany({
    where: {
      phone: normalizedPhone,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  return mapRecords(records, CONSULTATION_FIELD_MAP);
}

async function listByContact({ phone, email }) {
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email);
  const filters = [];

  if (normalizedPhone) {
    filters.push({ phone: normalizedPhone });
  }

  if (normalizedEmail) {
    filters.push({ email: normalizedEmail });
  }

  if (!filters.length) {
    return [];
  }

  const records = await prisma.consultationRequest.findMany({
    where: filters.length === 1 ? filters[0] : { OR: filters },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  return mapRecords(records, CONSULTATION_FIELD_MAP);
}

async function listRecentRequests(limit = 10) {
  const records = await prisma.consultationRequest.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: Math.min(Number(limit) || 10, 50),
  });

  return mapRecords(records, CONSULTATION_FIELD_MAP);
}

module.exports = {
  createRequest,
  findById,
  listRequests,
  listByPhone,
  listByContact,
  listRecentRequests,
};
