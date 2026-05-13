const asyncHandler = require("../utils/asyncHandler");
const pricingService = require("../services/pricingService");

exports.listPricing = asyncHandler(async (req, res) => {
  const data = await pricingService.listServicePricing(req.query || {});
  res.json({ success: true, data });
});

exports.getPricing = asyncHandler(async (req, res) => {
  const data = await pricingService.getServicePricing(req.params.serviceCode, req.query || {});
  res.json({ success: true, data });
});

exports.listAdminPricingServices = asyncHandler(async (req, res) => {
  const data = await pricingService.listServicePricing(req.query || {});
  res.json({ success: true, data });
});

exports.saveAdminPricingService = asyncHandler(async (req, res) => {
  const data = await pricingService.saveServicePricing({
    ...req.body,
    code: req.body.code || req.params.code,
    serviceCode: req.body.serviceCode || req.params.code,
  });
  res.status(201).json({ success: true, data });
});

exports.listAdminPricingRules = asyncHandler(async (req, res) => {
  const items = await pricingService.listPricingRules(req.query || {});
  res.json({ success: true, data: { items } });
});

exports.createAdminPricingRule = asyncHandler(async (req, res) => {
  const data = await pricingService.createPricingRule(req.body || {});
  res.status(201).json({ success: true, data });
});

exports.updateAdminPricingRule = asyncHandler(async (req, res) => {
  const data = await pricingService.updatePricingRule(req.params.id, req.body || {});
  res.json({ success: true, data });
});