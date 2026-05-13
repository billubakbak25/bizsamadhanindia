const crypto = require("crypto");

const env = require("../config/env");
const logger = require("../utils/logger");
const AppError = require("../utils/appError");
const chatbotService = require("./chatbot/chatbotService");
const { sendTextMessage } = require("./whatsappService");
const { enqueue } = require("../infrastructure/queue");

function safeString(value) {
  return String(value || "").trim();
}

function getRawBodyBuffer(rawBody) {
  if (!rawBody) {
    return Buffer.alloc(0);
  }

  return Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody));
}

function verifySignature(rawBody, signatureHeader) {
  if (!env.whatsappAppSecret) {
    return true;
  }

  const signature = safeString(signatureHeader);
  if (!signature.startsWith("sha256=")) {
    return false;
  }

  const expected = `sha256=${crypto
    .createHmac("sha256", env.whatsappAppSecret)
    .update(getRawBodyBuffer(rawBody))
    .digest("hex")}`;

  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return receivedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

function getTextFromMessage(message) {
  if (!message || typeof message !== "object") {
    return "";
  }

  if (message.type === "text") {
    return safeString(message.text && message.text.body);
  }

  if (message.type === "button") {
    return safeString(message.button && message.button.text);
  }

  if (message.type === "interactive") {
    const interactive = message.interactive || {};
    return safeString(
      (interactive.button_reply && (interactive.button_reply.title || interactive.button_reply.id)) ||
        (interactive.list_reply && (interactive.list_reply.title || interactive.list_reply.id))
    );
  }

  return "";
}

function extractIncomingMessages(payload) {
  const entries = Array.isArray(payload && payload.entry) ? payload.entry : [];
  const incoming = [];

  for (const entry of entries) {
    const changes = Array.isArray(entry && entry.changes) ? entry.changes : [];

    for (const change of changes) {
      const value = change && change.value ? change.value : {};
      const messages = Array.isArray(value.messages) ? value.messages : [];
      const contactsByWaId = new Map(
        (Array.isArray(value.contacts) ? value.contacts : []).map((contact) => [
          safeString(contact && contact.wa_id),
          contact,
        ])
      );

      for (const message of messages) {
        const from = safeString(message && message.from);
        const contact = contactsByWaId.get(from) || {};
        incoming.push({
          id: safeString(message && message.id),
          from,
          type: safeString(message && message.type),
          text: getTextFromMessage(message),
          timestamp: safeString(message && message.timestamp),
          contactName: safeString(contact.profile && contact.profile.name),
        });
      }
    }
  }

  return incoming;
}

function wantsHuman(message) {
  const normalized = safeString(message).toLowerCase();
  return /\b(human|agent|call|callback|expert|lawyer|ca|team|support|phone|baat|bat|baat kar|connect)\b/.test(normalized);
}

function buildHumanHandoffReply() {
  const phone = safeString(env.businessPhone);
  const consultationLink = `${env.siteUrl || env.appUrl}/consultation`;

  return [
    "Sure, I can connect you with the BizSamadhan India team.",
    phone ? `Call/WhatsApp: ${phone}` : "",
    `Book a consultation: ${consultationLink}`,
    "Please share your name, city, and the service you need so our team can follow up quickly.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildReply(chatResult) {
  const parts = [safeString(chatResult && chatResult.reply)];
  const service = chatResult && chatResult.service ? chatResult.service : null;

  if (service) {
    parts.push(`Service: ${service.name}`);
    parts.push(`Fee: ${service.amountFormatted}`);
    parts.push(`Details: ${service.serviceLink}`);
    parts.push(`Book consultation: ${service.consultationLink}`);
  }

  parts.push("Aap apna naam, city aur requirement bhej dijiye, main next step guide kar dunga.");

  return parts.filter(Boolean).join("\n");
}

async function buildBotReply(message) {
  if (wantsHuman(message)) {
    return buildHumanHandoffReply();
  }

  if (!safeString(message)) {
    return "Main abhi text messages handle karta hoon. Kripya apni requirement type karke bhejiye, jaise GST registration, ITR filing, company registration, trademark, ya compliance.";
  }

  const result = await chatbotService.chat(message);
  return buildReply(result);
}

class WhatsAppBotService {
  verifySignature(rawBody, signature) {
    return verifySignature(rawBody, signature);
  }

  extractIncomingMessages(payload) {
    return extractIncomingMessages(payload);
  }

  async processIncomingMessage(message) {
    if (!env.whatsappBotEnabled) {
      return {
        status: "disabled",
        sent: false,
      };
    }

    if (!message || !message.from) {
      return {
        id: message && message.id,
        status: "skipped",
        sent: false,
        reason: "Missing sender phone number.",
      };
    }

    const reply = await buildBotReply(message.text);
    const delivery = await sendTextMessage({
      phone: message.from,
      message: reply,
    });

    logger.info("whatsapp_bot_reply_processed", {
      messageId: message.id,
      from: message.from,
      incomingType: message.type,
      deliveryStatus: delivery.status,
      deliveryReason: delivery.reason,
    });

    return {
      id: message.id,
      from: message.from,
      status: delivery.status,
      sent: delivery.sent,
      reason: delivery.reason || null,
    };
  }

  async processIncomingMessages(messages) {
    const results = [];

    for (const message of messages) {
      results.push(await this.processIncomingMessage(message));
    }

    return {
      receivedMessages: messages.length,
      repliesSent: results.filter((item) => item.sent).length,
      results,
    };
  }

  async enqueueIncomingMessages(messages) {
    const jobs = [];

    for (const message of messages) {
      const job = await enqueue(
        env.whatsappQueueName,
        "whatsapp.inbound_message",
        { message },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 1000 },
          jobId: message.id || `${message.from || "unknown"}-${message.timestamp || Date.now()}`,
        }
      );

      if (!job) {
        return null;
      }

      jobs.push(job);
    }

    return jobs;
  }

  async handleWebhook({ payload, rawBody, signature }) {
    if (!this.verifySignature(rawBody, signature)) {
      throw new AppError("Invalid WhatsApp webhook signature.", 403, "WHATSAPP_WEBHOOK_INVALID_SIGNATURE");
    }

    const messages = this.extractIncomingMessages(payload);

    if (!env.whatsappBotEnabled) {
      logger.info("whatsapp_bot_disabled", { receivedMessages: messages.length });
      return {
        receivedMessages: messages.length,
        repliesSent: 0,
        status: "disabled",
      };
    }

    if (messages.length === 0) {
      return {
        receivedMessages: 0,
        repliesSent: 0,
        status: "ignored",
      };
    }

    const queuedJobs = await this.enqueueIncomingMessages(messages);
    if (queuedJobs) {
      return {
        receivedMessages: messages.length,
        repliesSent: 0,
        status: "queued",
        queuedJobs: queuedJobs.length,
      };
    }

    return this.processIncomingMessages(messages);
  }
}

module.exports = new WhatsAppBotService();
