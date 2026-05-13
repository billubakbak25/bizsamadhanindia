const AppError = require("../utils/appError");
const defaultServicePricing = require("../config/defaultServicePricing");
const { listServiceDefinitions, normalizeKey } = require("../config/serviceExecutionCatalog");
const pricingRepository = require("../repositories/pricingRepository");

const SUPPORTED_RULE_TYPES = new Set(["discount", "offer", "flat", "dynamic"]);

function normalizeServiceCode(value) {
  return normalizeKey(value);
}

function normalizeRuleType(value) {
  const normalized = String(value || "discount").trim().toLowerCase();
  if (normalized === "offer") {
    return "discount";
  }
  return SUPPORTED_RULE_TYPES.has(normalized) ? normalized : "discount";
}

function normalizePositiveInteger(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.round(parsed));
}

function normalizeBoolean(value, fallback = true) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return ["true", "1", "yes", "on"].includes(String(value).trim().toLowerCase());
}

function normalizeCondition(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function listSeedServices() {
  return listServiceDefinitions().map((definition) => ({
    code: definition.serviceCode,
    name: definition.serviceName,
    basePrice: normalizePositiveInteger(defaultServicePricing[definition.serviceCode], 0),
    isActive: true,
  }));
}

async function ensurePricingCatalogSeeded() {
  const seedEntries = listSeedServices();
  const existingServices = await pricingRepository.listServices({ includeInactive: true });
  const existingCodes = new Set(existingServices.map((service) => service.code));

  for (const seedEntry of seedEntries) {
    if (existingCodes.has(seedEntry.code)) {
      continue;
    }

    await pricingRepository.upsertService(seedEntry);
  }
}

function matchesRuleCondition(condition, context = {}) {
  const normalizedCondition = normalizeCondition(condition);
  if (!normalizedCondition) {
    return true;
  }

  const separators = ["=", ":"];
  for (const separator of separators) {
    if (!normalizedCondition.includes(separator)) {
      continue;
    }

    const [rawKey, rawValue] = normalizedCondition.split(separator);
    const key = String(rawKey || "").trim();
    const expectedValue = String(rawValue || "").trim().toLowerCase();
    const actualValue = String(context[key] ?? "").trim().toLowerCase();
    return Boolean(actualValue) && actualValue === expectedValue;
  }

  return Boolean(context[normalizedCondition]);
}

function applyRule(price, rule) {
  const ruleType = normalizeRuleType(rule.type);
  const ruleValue = normalizePositiveInteger(rule.value, 0);

  if (ruleValue <= 0) {
    return price;
  }

  if (ruleType === "discount") {
    return price - (price * ruleValue) / 100;
  }

  if (ruleType === "flat" || ruleType === "dynamic") {
    return price - ruleValue;
  }

  return price;
}

function buildPricingResponse(service, rules, finalPrice) {
  return {
    code: service.code,
    name: service.name,
    basePrice: Number(service.base_price || 0),
    finalPrice,
    currency: "INR",
    isActive: Boolean(service.is_active),
    activeRuleCount: rules.filter((rule) => rule.is_active).length,
    rules,
  };
}

async function getServiceOrThrow(serviceCode) {
  await ensurePricingCatalogSeeded();
  const normalizedCode = normalizeServiceCode(serviceCode);

  if (!normalizedCode) {
    throw new AppError("Service code is required.", 400, "VALIDATION_ERROR");
  }

  const service = await pricingRepository.findServiceByCode(normalizedCode);
  if (!service || !service.is_active) {
    throw new AppError("Service not found", 404, "SERVICE_NOT_FOUND", { received: serviceCode });
  }

  return service;
}

async function getFinalPrice(serviceCode, context = {}) {
  const service = await getServiceOrThrow(serviceCode);
  const rules = await pricingRepository.listRules({ serviceCode: service.code, includeInactive: false });

  let price = Number(service.base_price || 0);
  if (price <= 0) {
    throw new AppError("Service price is not configured.", 400, "SERVICE_PRICE_NOT_CONFIGURED", {
      received: serviceCode,
    });
  }

  for (const rule of rules) {
    if (!matchesRuleCondition(rule.condition, context)) {
      continue;
    }

    price = applyRule(price, rule);
  }

  return Math.max(Math.round(price), 1);
}

async function getServicePricing(serviceCode, context = {}) {
  const service = await getServiceOrThrow(serviceCode);
  const rules = await pricingRepository.listRules({ serviceCode: service.code, includeInactive: true });

  let finalPrice = null;
  if (Number(service.base_price || 0) > 0) {
    finalPrice = await getFinalPrice(service.code, context);
  }

  return buildPricingResponse(service, rules, finalPrice);
}

async function listServicePricing(context = {}) {
  await ensurePricingCatalogSeeded();
  const services = await pricingRepository.listServices({ includeInactive: true });
  const allRules = await pricingRepository.listRules({ includeInactive: true });
  const rulesByServiceCode = allRules.reduce((accumulator, rule) => {
    const key = String(rule.service_code || "");
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(rule);
    return accumulator;
  }, {});

  const items = [];
  for (const service of services) {
    const rules = rulesByServiceCode[service.code] || [];
    let finalPrice = null;

    if (service.is_active && Number(service.base_price || 0) > 0) {
      const activeRules = rules.filter((rule) => rule.is_active);
      let computedPrice = Number(service.base_price || 0);
      for (const rule of activeRules) {
        if (!matchesRuleCondition(rule.condition, context)) {
          continue;
        }
        computedPrice = applyRule(computedPrice, rule);
      }
      finalPrice = Math.max(Math.round(computedPrice), 1);
    }

    items.push(buildPricingResponse(service, rules, finalPrice));
  }

  return {
    items,
    summary: {
      total: items.length,
      active: items.filter((item) => item.isActive).length,
      configured: items.filter((item) => Number(item.basePrice || 0) > 0).length,
    },
  };
}

async function saveServicePricing(payload = {}) {
  await ensurePricingCatalogSeeded();
  const code = normalizeServiceCode(payload.code || payload.serviceCode);
  const name = String(payload.name || payload.serviceName || "").trim();

  if (!code || !name) {
    throw new AppError("Service code and name are required.", 400, "VALIDATION_ERROR");
  }

  const service = await pricingRepository.upsertService({
    code,
    name,
    basePrice: normalizePositiveInteger(payload.basePrice, 0),
    isActive: normalizeBoolean(payload.isActive, true),
  });

  return getServicePricing(service.code);
}

async function createPricingRule(payload = {}) {
  const service = await getServiceOrThrow(payload.serviceCode);
  const type = normalizeRuleType(payload.type);
  const value = normalizePositiveInteger(payload.value, 0);

  if (value <= 0) {
    throw new AppError("Rule value must be greater than zero.", 400, "VALIDATION_ERROR");
  }

  return pricingRepository.createRule({
    serviceCode: service.code,
    type,
    value,
    condition: normalizeCondition(payload.condition),
    isActive: normalizeBoolean(payload.isActive, true),
  });
}

async function updatePricingRule(ruleId, payload = {}) {
  const id = String(ruleId || "").trim();
  if (!id) {
    throw new AppError("Rule id is required.", 400, "VALIDATION_ERROR");
  }

  const nextServiceCode = payload.serviceCode ? normalizeServiceCode(payload.serviceCode) : undefined;
  if (nextServiceCode) {
    await getServiceOrThrow(nextServiceCode);
  }

  const rule = await pricingRepository.updateRule({
    id,
    data: {
      ...(nextServiceCode ? { serviceCode: nextServiceCode } : {}),
      ...(payload.type !== undefined ? { type: normalizeRuleType(payload.type) } : {}),
      ...(payload.value !== undefined ? { value: normalizePositiveInteger(payload.value, 0) } : {}),
      ...(payload.condition !== undefined ? { condition: normalizeCondition(payload.condition) } : {}),
      ...(payload.isActive !== undefined ? { isActive: normalizeBoolean(payload.isActive, true) } : {}),
    },
  });

  if (!rule) {
    throw new AppError("Pricing rule not found.", 404, "PRICING_RULE_NOT_FOUND");
  }

  return rule;
}

async function listPricingRules(filters = {}) {
  await ensurePricingCatalogSeeded();
  return pricingRepository.listRules({
    serviceCode: filters.serviceCode ? normalizeServiceCode(filters.serviceCode) : undefined,
    includeInactive: normalizeBoolean(filters.includeInactive, true),
  });
}

module.exports = {
  getFinalPrice,
  getServicePricing,
  listServicePricing,
  saveServicePricing,
  createPricingRule,
  updatePricingRule,
  listPricingRules,
  ensurePricingCatalogSeeded,
};