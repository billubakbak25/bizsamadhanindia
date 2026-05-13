const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAdmin } = require("../middleware/auth");
const followUpService = require("../services/followUpService");

const router = express.Router();
router.use(requireAdmin);

router.post("/:leadId/schedule", asyncHandler(async (req, res) => {
  const data = await followUpService.scheduleForLead(Number(req.params.leadId), req.body.baseTime);
  res.status(201).json({ success: true, data });
}));

router.post("/:leadId/stop", asyncHandler(async (req, res) => {
  const data = await followUpService.stopOnConversion(Number(req.params.leadId));
  res.json({ success: true, data });
}));

router.get("/:leadId", asyncHandler(async (req, res) => {
  const data = await followUpService.listByLead(Number(req.params.leadId));
  res.json({ success: true, data });
}));

router.post("/process/due", asyncHandler(async (req, res) => {
  const data = await followUpService.processDue(req.body.referenceTime);
  res.json({ success: true, data });
}));

module.exports = router;
