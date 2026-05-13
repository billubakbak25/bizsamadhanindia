const env = require("../config/env");

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

function normalizeProviderError(message) {
  const providerMessage = String(message || "").trim();

  if (!providerMessage) {
    return "WhatsApp confirmation could not be sent right now.";
  }

  if (/access token/i.test(providerMessage)) {
    return "WhatsApp account connection has expired. Update WHATSAPP_API_TOKEN and retry delivery.";
  }

  if (/template name does not exist/i.test(providerMessage)) {
    return "WhatsApp template is not configured. Set WHATSAPP_TEMPLATE_NAME to an approved Meta template and retry delivery.";
  }

  if (/phone number id/i.test(providerMessage) || /unsupported post request/i.test(providerMessage)) {
    return "WhatsApp phone configuration needs attention before confirmations can be sent.";
  }

  return providerMessage;
}

function buildTemplatePayload({ customerName, amountFormatted }) {
  const templateName = env.whatsappTemplateName || "hello_world";
  const languageCode = env.whatsappTemplateLanguageCode || "en_US";
  const template = {
    name: templateName,
    language: {
      code: languageCode,
    },
  };

  if (templateName !== "hello_world") {
    template.components = [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: String(customerName || "Customer"),
          },
          {
            type: "text",
            text: String(amountFormatted || ""),
          },
        ],
      },
    ];
  }

  return template;
}

function buildTextPayload(message) {
  return {
    messaging_product: "whatsapp",
    type: "text",
    text: {
      preview_url: false,
      body: String(message || "").slice(0, 4096),
    },
  };
}

async function sendPaymentConfirmation({ phone, customerName, amountFormatted }) {
  if (!env.whatsappApiToken || !env.whatsappPhoneNumberId) {
    return {
      sent: false,
      status: "skipped",
      reason: "WhatsApp is not configured.",
    };
  }

  const to = normalizePhone(phone);

  if (!to) {
    return {
      sent: false,
      status: "failed",
      reason: "Invalid customer phone number.",
    };
  }

  const requestBody = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: buildTemplatePayload({ customerName, amountFormatted }),
  };

  try {
    const response = await fetch(`https://graph.facebook.com/${env.whatsappGraphApiVersion}/${env.whatsappPhoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.whatsappApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        sent: false,
        status: "failed",
        reason: normalizeProviderError(result?.error?.message),
        providerResponse: result,
      };
    }

    return {
      sent: true,
      status: "sent",
      providerResponse: result,
    };
  } catch (error) {
    return {
      sent: false,
      status: "failed",
      reason: normalizeProviderError(error.message || "WhatsApp request failed unexpectedly."),
    };
  }
}

async function sendLeadNotification({ name, phone, service }) {
  if (!env.whatsappApiToken || !env.whatsappPhoneNumberId) {
    return {
      sent: false,
      status: "skipped",
      reason: "WhatsApp is not configured.",
    };
  }

  if (!env.whatsappLeadNotifyTo) {
    return {
      sent: false,
      status: "skipped",
      reason: "WhatsApp lead notifications are not configured.",
    };
  }

  const to = normalizePhone(env.whatsappLeadNotifyTo);
  if (!to) {
    return {
      sent: false,
      status: "failed",
      reason: "Invalid WHATSAPP_LEAD_NOTIFY_TO phone number.",
    };
  }

  const message = `New lead received: ${String(name || "").trim()}, ${String(phone || "").trim()}, ${String(service || "").trim()}`;
  const requestBody = {
    to,
    ...buildTextPayload(message),
  };

  try {
    const response = await fetch(`https://graph.facebook.com/${env.whatsappGraphApiVersion}/${env.whatsappPhoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.whatsappApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        sent: false,
        status: "failed",
        reason: normalizeProviderError(result?.error?.message),
        providerResponse: result,
      };
    }

    return {
      sent: true,
      status: "sent",
      providerResponse: result,
    };
  } catch (error) {
    return {
      sent: false,
      status: "failed",
      reason: normalizeProviderError(error.message || "WhatsApp request failed unexpectedly."),
    };
  }
}

async function sendTextMessage({ phone, message }) {
  if (!env.whatsappApiToken || !env.whatsappPhoneNumberId) {
    return {
      sent: false,
      status: "skipped",
      reason: "WhatsApp is not configured.",
    };
  }

  const to = normalizePhone(phone);

  if (!to) {
    return {
      sent: false,
      status: "failed",
      reason: "Invalid phone number.",
    };
  }

  const requestBody = {
    to,
    ...buildTextPayload(message),
  };

  try {
    const response = await fetch(`https://graph.facebook.com/${env.whatsappGraphApiVersion}/${env.whatsappPhoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.whatsappApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        sent: false,
        status: "failed",
        reason: normalizeProviderError(result?.error?.message),
        providerResponse: result,
      };
    }

    return {
      sent: true,
      status: "sent",
      providerResponse: result,
    };
  } catch (error) {
    return {
      sent: false,
      status: "failed",
      reason: normalizeProviderError(error.message || "WhatsApp request failed unexpectedly."),
    };
  }
}

module.exports = {
  normalizePhone,
  sendPaymentConfirmation,
  sendLeadNotification,
  sendTextMessage,
};
