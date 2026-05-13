const express = require("express");
const { metricsService } = require("../services/platform/platformService");
const asyncHandler = require("../utils/asyncHandler");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAdmin);

router.get("/revenue", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await metricsService.getRevenue(req.query) });
}));
router.get("/conversions", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await metricsService.getConversions() });
}));
router.get("/pending-work", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await metricsService.getPendingWork() });
}));
router.get("/top-services", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await metricsService.getTopServices(req.query.limit || 5) });
}));
router.get("/dashboard", asyncHandler(async (req, res) => {
  const [revenue, conversions, pendingWork, topServices] = await Promise.all([
    metricsService.getRevenue(req.query),
    metricsService.getConversions(),
    metricsService.getPendingWork(),
    metricsService.getTopServices(req.query.limit || 5),
  ]);
  res.json({ success: true, data: { revenue, conversions, pendingWork, topServices } });
}));

module.exports = router;
