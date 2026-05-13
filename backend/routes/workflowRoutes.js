const express = require("express");
const { workflowService } = require("../services/platform/platformService");
const asyncHandler = require("../utils/asyncHandler");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAdmin);

router.post("/definitions", asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await workflowService.define(req.body) });
}));
router.post("/start", asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await workflowService.start(req.body) });
}));
router.get("/:serviceRequestId", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await workflowService.get(req.params.serviceRequestId) });
}));
router.patch("/:serviceRequestId/step", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await workflowService.updateStep({ serviceRequestId: req.params.serviceRequestId, ...req.body }) });
}));
router.post("/:serviceRequestId/auto-progress", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await workflowService.autoProgress(req.params.serviceRequestId) });
}));

module.exports = router;
