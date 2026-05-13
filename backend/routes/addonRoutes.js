const express = require("express");
const { addonService } = require("../services/platform/platformService");
const asyncHandler = require("../utils/asyncHandler");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAdmin);

router.post("/catalog", asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await addonService.createCatalogItem(req.body) });
}));
router.post("/suggest", asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await addonService.suggest(req.body) });
}));
router.get("/suggestions/:paymentId", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await addonService.listSuggestions(req.params.paymentId) });
}));
router.patch("/suggestions/:id", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await addonService.updateSuggestionStatus(Number(req.params.id), req.body.status) });
}));

module.exports = router;
