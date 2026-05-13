const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const SERVICE_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["code", "code"],
  ["name", "name"],
  ["basePrice", "base_price"],
  ["isActive", "is_active"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

const RULE_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["serviceCode", "service_code"],
  ["type", "type"],
  ["value", "value"],
  ["condition", "condition"],
  ["isActive", "is_active"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

function mapService(record) {
  return mapRecord(record, SERVICE_FIELD_MAP);
}

function mapServices(records) {
  return mapRecords(records, SERVICE_FIELD_MAP);
}

function mapRule(record) {
  return mapRecord(record, RULE_FIELD_MAP);
}

function mapRules(records) {
  return mapRecords(records, RULE_FIELD_MAP);
}

async function listServices({ includeInactive = true } = {}) {
  const records = await prisma.serviceCatalog.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return mapServices(records);
}

async function findServiceByCode(code) {
  const record = await prisma.serviceCatalog.findUnique({
    where: { code },
  });

  return mapService(record);
}

async function upsertService({ code, name, basePrice, isActive = true }) {
  const record = await prisma.serviceCatalog.upsert({
    where: { code },
    update: {
      name,
      basePrice: Number(basePrice || 0),
      isActive: Boolean(isActive),
    },
    create: {
      code,
      name,
      basePrice: Number(basePrice || 0),
      isActive: Boolean(isActive),
    },
  });

  return mapService(record);
}

async function listRules({ serviceCode, includeInactive = true } = {}) {
  const records = await prisma.pricingRule.findMany({
    where: {
      ...(serviceCode ? { serviceCode } : {}),
      ...(includeInactive ? {} : { isActive: true }),
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return mapRules(records);
}

async function createRule({ serviceCode, type, value, condition = null, isActive = true }) {
  const record = await prisma.pricingRule.create({
    data: {
      serviceCode,
      type,
      value: Number(value || 0),
      condition,
      isActive: Boolean(isActive),
    },
  });

  return mapRule(record);
}

async function updateRule({ id, data }) {
  await prisma.pricingRule.updateMany({
    where: { id },
    data: {
      ...(data.serviceCode !== undefined ? { serviceCode: data.serviceCode } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.value !== undefined ? { value: Number(data.value || 0) } : {}),
      ...(data.condition !== undefined ? { condition: data.condition } : {}),
      ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {}),
    },
  });

  const record = await prisma.pricingRule.findUnique({ where: { id } });
  return mapRule(record);
}

module.exports = {
  listServices,
  findServiceByCode,
  upsertService,
  listRules,
  createRule,
  updateRule,
};