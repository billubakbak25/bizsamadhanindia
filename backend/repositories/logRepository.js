const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const LOG_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["level", "level"],
  ["event", "event"],
  ["message", "message"],
  ["entityType", "entity_type"],
  ["entityId", "entity_id"],
  ["metadata", "metadata"],
  ["createdAt", "created_at"],
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

async function create({ level, event, message = "", entityType = null, entityId = null, metadata = {}, createdAt }) {
  const record = await prisma.log.create({
    data: {
      level,
      event,
      message,
      entityType,
      entityId,
      metadata: serializeMetadata(metadata),
      createdAt,
    },
  });

  return mapRecord(record, LOG_FIELD_MAP);
}

async function findMany(args = {}) {
  const records = await prisma.log.findMany(args);
  return mapRecords(records, LOG_FIELD_MAP);
}

async function findByEntity(entityType, entityId) {
  return findMany({
    where: {
      entityType,
      entityId: String(entityId),
    },
    orderBy: { createdAt: "asc" },
  });
}

module.exports = {
  create,
  findMany,
  findByEntity,
};
