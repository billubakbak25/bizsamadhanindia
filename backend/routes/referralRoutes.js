const express = require("express");
const { referralService } = require("../services/platform/platformService");
const asyncHandler = require("../utils/asyncHandler");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAdmin);

router.get("/code/:userId", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await referralService.getOrCreateCode(req.params.userId) });
}));
router.post("/", asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await referralService.createReferral(req.body.referralCode, req.body.referredUserId) });
}));
router.post("/reward", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await referralService.reward(req.body.referredUserId, req.body.rewardAmount) });
}));
router.get("/:userId", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await referralService.list(req.params.userId) });
}));

module.exports = router;
