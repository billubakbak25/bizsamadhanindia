const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const FOLLOW_UP_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["leadId", "lead_id"],
  ["stepKey", "step_key"],
  ["scheduledFor", "scheduled_for"],
  ["status", "status"],
  ["channel", "channel"],
  ["message", "message"],
  ["sentAt", "sent_at"],
  ["cancelledReason", "cancelled_reason"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

async function create(data) {
  const record = await prisma.followUp.create({ data });
  return mapRecord(record, FOLLOW_UP_FIELD_MAP);
}

async function updateMany(where, data) {
  return prisma.followUp.updateMany({ where, data });
}

async function findMany(args = {}) {
  const records = await prisma.followUp.findMany(args);
  return mapRecords(records, FOLLOW_UP_FIELD_MAP);
}

async function findUnique(args = {}) {
  const record = await prisma.followUp.findUnique(args);
  return mapRecord(record, FOLLOW_UP_FIELD_MAP);
}

async function count(where) {
  return prisma.followUp.count({ where });
}

async function countAll() {
  return prisma.followUp.count();
}

async function countByStatus(status) {
  return prisma.followUp.count({ where: { status } });
}

module.exports = {
  create,
  updateMany,
  findMany,
  findUnique,
  count,
  countAll,
  countByStatus,
};
