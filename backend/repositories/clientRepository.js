const { prisma } = require("../lib/prisma");
const { mapRecord, buildFieldMap } = require("./prismaMapper");

const CLIENT_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["phone", "phone"],
  ["name", "name"],
  ["email", "email"],
  ["role", "role"],
  ["referralCode", "referral_code"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

function normalizePhone(phone) {
  const normalized = String(phone || "").replace(/\D/g, "");
  return normalized || null;
}

function normalizeEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  return normalized || null;
}

async function findById(id) {
  const record = await prisma.client.findUnique({
    where: { id: Number(id) },
  });

  return mapRecord(record, CLIENT_FIELD_MAP);
}

async function findByPhone(phone) {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return null;
  }

  const record = await prisma.client.findFirst({
    where: { phone: normalizedPhone },
  });

  return mapRecord(record, CLIENT_FIELD_MAP);
}

async function findByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  const record = await prisma.client.findFirst({
    where: { email: normalizedEmail },
  });

  return mapRecord(record, CLIENT_FIELD_MAP);
}

async function create({ phone = null, name, email = null, role = "client" }) {
  const now = new Date().toISOString();
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email);

  const record = await prisma.client.create({
    data: {
      ...(normalizedPhone ? { phone: normalizedPhone } : {}),
      name: String(name),
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      role,
      createdAt: now,
      updatedAt: now,
    },
  });

  return mapRecord(record, CLIENT_FIELD_MAP);
}

async function updateById(id, { phone, name, email, role, referralCode, updatedAt }) {
  const normalizedPhone = phone !== undefined ? normalizePhone(phone) : undefined;
  const normalizedEmail = email !== undefined ? normalizeEmail(email) : undefined;

  await prisma.client.updateMany({
    where: { id: Number(id) },
    data: {
      ...(phone !== undefined ? { phone: normalizedPhone } : {}),
      ...(name !== undefined ? { name: String(name) } : {}),
      ...(email !== undefined ? { email: normalizedEmail } : {}),
      ...(role !== undefined ? { role } : {}),
      ...(referralCode !== undefined ? { referralCode } : {}),
      updatedAt: updatedAt || new Date().toISOString(),
    },
  });

  return findById(id);
}

async function countAll() {
  return prisma.client.count();
}

module.exports = {
  findById,
  findByPhone,
  findByEmail,
  create,
  updateById,
  countAll,
};
