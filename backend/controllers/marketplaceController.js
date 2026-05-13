const asyncHandler = require("../utils/asyncHandler");
const marketplaceService = require("../services/marketplaceService");

exports.getPartnerDashboard = asyncHandler(async (req, res) => {
  const data = await marketplaceService.getPartnerDashboard(req.query.code);
  res.json({ success: true, data });
});

exports.applyPartner = asyncHandler(async (req, res) => {
  const data = await marketplaceService.applyPartner(req.body);
  res.status(201).json({ success: true, message: data.message, data });
});

exports.listPackages = asyncHandler(async (req, res) => {
  const data = await marketplaceService.listPackages();
  res.json({ success: true, data });
});

exports.getToolDefaults = asyncHandler(async (req, res) => {
  const data = await marketplaceService.getToolDefaults();
  res.json({ success: true, data });
});
