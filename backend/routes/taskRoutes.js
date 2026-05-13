const express = require("express");
const { taskService } = require("../services/platform/platformService");
const asyncHandler = require("../utils/asyncHandler");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAdmin);

router.post("/mappings", asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await taskService.saveMapping(req.body) });
}));
router.post("/auto-assign", asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await taskService.autoAssign(req.body) });
}));
router.patch("/:id/status", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await taskService.updateStatus(Number(req.params.id), req.body.status) });
}));
router.get("/", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await taskService.list(req.query) });
}));
router.get("/overdue", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await taskService.overdue() });
}));

module.exports = router;
