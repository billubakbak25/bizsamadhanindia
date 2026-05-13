const express = require("express");
const { billingService } = require("../services/platform/platformService");
const asyncHandler = require("../utils/asyncHandler");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAdmin);

router.post("/plans", asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await billingService.createPlan(req.body) });
}));
router.get("/plans", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await billingService.listPlans() });
}));
router.post("/subscriptions", asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await billingService.createSubscription(req.body) });
}));
router.get("/subscriptions", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await billingService.listSubscriptions(req.query) });
}));
router.post("/subscriptions/:id/renew", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await billingService.renew(Number(req.params.id)) });
}));
router.post("/reminders/process", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await billingService.processReminders(req.body.referenceTime) });
}));

module.exports = router;
