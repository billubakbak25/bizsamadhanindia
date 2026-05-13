const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const env = require("../config/env");
const whatsappBotService = require("../services/whatsappBotService");

exports.verify = asyncHandler(async (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (!env.whatsappWebhookVerifyToken) {
    throw new AppError("WHATSAPP_WEBHOOK_VERIFY_TOKEN is not configured.", 500, "WHATSAPP_WEBHOOK_NOT_CONFIGURED");
  }

  if (mode === "subscribe" && token === env.whatsappWebhookVerifyToken) {
    res.status(200).send(challenge);
    return;
  }

  throw new AppError("WhatsApp webhook verification failed.", 403, "WHATSAPP_WEBHOOK_FORBIDDEN");
});

exports.receive = asyncHandler(async (req, res) => {
  const result = await whatsappBotService.handleWebhook({
    payload: req.body,
    rawBody: req.rawBody,
    signature: req.headers["x-hub-signature-256"],
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});
