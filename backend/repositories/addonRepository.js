const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const ADDON_CATALOG_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["serviceCode", "service_code"],
  ["addonCode", "addon_code"],
  ["addonName", "addon_name"],
  ["description", "description"],
  ["basePrice", "base_price"],
  ["pricingType", "pricing_type"],
  ["pricingMetadata", "pricing_metadata"],
  ["isActive", "is_active"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

const ADDON_SUGGESTION_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["paymentId", "payment_id"],
  ["clientId", "client_id"],
  ["serviceCode", "service_code"],
  ["addonCode", "addon_code"],
  ["addonName", "addon_name"],
  ["suggestedPrice", "suggested_price"],
  ["pricingReason", "pricing_reason"],
  ["status", "status"],
  ["acceptedAt", "accepted_at"],
  ["rejectedAt", "rejected_at"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

async function createCatalogItem({ serviceCode, addonCode, addonName, description, basePrice, pricingType, pricingMetadata, isActive = 1, createdAt, updatedAt }) {
  const record = await prisma.addonCatalog.create({
    data: {
      serviceCode,
      addonCode,
      addonName,
      description,
      basePrice: Number(basePrice),
      pricingType,
      pricingMetadata,
      isActive: Number(isActive) || 0,
      createdAt,
      updatedAt,
    },
  });

  return mapRecord(record, ADDON_CATALOG_FIELD_MAP);
}

async function listCatalogByServiceCode(serviceCode) {
  const records = await prisma.addonCatalog.findMany({
    where: {
      serviceCode,
      isActive: 1,
    },
    orderBy: { addonName: "asc" },
  });

  return mapRecords(records, ADDON_CATALOG_FIELD_MAP);
}

async function createSuggestion({ paymentId, clientId, serviceCode, addonCode, addonName, suggestedPrice, pricingReason, status = "suggested", createdAt, updatedAt }) {
  const record = await prisma.addonSuggestion.create({
    data: {
      paymentId,
      clientId: String(clientId),
      serviceCode,
      addonCode,
      addonName,
      suggestedPrice: Number(suggestedPrice),
      pricingReason,
      status,
      createdAt,
      updatedAt,
    },
  });

  return mapRecord(record, ADDON_SUGGESTION_FIELD_MAP);
}

async function listSuggestionsByPaymentId(paymentId) {
  const records = await prisma.addonSuggestion.findMany({
    where: { paymentId: String(paymentId) },
    orderBy: { createdAt: "desc" },
  });

  return mapRecords(records, ADDON_SUGGESTION_FIELD_MAP);
}

async function updateSuggestionStatus(id, status, acceptedAt, rejectedAt, updatedAt) {
  await prisma.addonSuggestion.updateMany({
    where: { id: Number(id) },
    data: {
      status,
      acceptedAt: status === "accepted" ? acceptedAt : undefined,
      rejectedAt: status === "rejected" ? rejectedAt : undefined,
      updatedAt,
    },
  });

  const record = await prisma.addonSuggestion.findUnique({ where: { id: Number(id) } });
  return mapRecord(record, ADDON_SUGGESTION_FIELD_MAP);
}

module.exports = {
  createCatalogItem,
  listCatalogByServiceCode,
  createSuggestion,
  listSuggestionsByPaymentId,
  updateSuggestionStatus,
};
