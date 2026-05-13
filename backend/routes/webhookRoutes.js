const express = require("express");
const { webhookService } = require("../services/platform/platformService");
const whatsappWebhookController = require("../controllers/whatsappWebhookController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

function captureRawBody(req, res, buffer) {
  req.rawBody = Buffer.from(buffer);
}

router.post("/razorpay", express.raw({ type: "application/json", limit: "1mb" }), asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.body;
  const payload = JSON.parse(Buffer.from(rawBody).toString("utf8"));
  const result = await webhookService.handle(payload, rawBody, signature);
  res.json({ success: true, data: result });
}));

router.get("/whatsapp", whatsappWebhookController.verify);
router.post(
  "/whatsapp",
  express.json({ type: "application/json", limit: "1mb", verify: captureRawBody }),
  whatsappWebhookController.receive
);

module.exports = router;
