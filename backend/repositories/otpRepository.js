const { prisma } = require("../lib/prisma");
const { mapRecord, buildFieldMap } = require("./prismaMapper");

const OTP_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["email", "email"],
  ["otpHash", "otp_hash"],
  ["expiresAt", "expires_at"],
  ["attempts", "attempts"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function deleteByEmail(email) {
  const result = await prisma.otp.deleteMany({
    where: { email: normalizeEmail(email) },
  });

  return { changes: result.count };
}

async function deleteById(id) {
  const result = await prisma.otp.deleteMany({
    where: { id: String(id) },
  });

  return { changes: result.count };
}

async function create({ email, otpHash, expiresAt, attempts = 0 }) {
  const record = await prisma.otp.create({
    data: {
      email: normalizeEmail(email),
      otpHash,
      expiresAt,
      attempts: Number(attempts) || 0,
    },
  });

  return mapRecord(record, OTP_FIELD_MAP);
}

async function findLatestByEmail(email) {
  const record = await prisma.otp.findFirst({
    where: { email: normalizeEmail(email) },
    orderBy: [{ createdAt: "desc" }],
  });

  return mapRecord(record, OTP_FIELD_MAP);
}

async function updateAttempts(id, attempts) {
  const result = await prisma.otp.updateMany({
    where: { id: String(id) },
    data: {
      attempts: Number(attempts) || 0,
    },
  });

  return { changes: result.count };
}

module.exports = {
  deleteByEmail,
  deleteById,
  create,
  findLatestByEmail,
  updateAttempts,
};
