const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const { findServiceDefinition } = require("../config/serviceExecutionCatalog");
const paymentRepository = require("../repositories/paymentRepository");
const serviceRepository = require("../repositories/serviceRepository");
const serviceExecutionService = require("./serviceService");
const crmService = require("./crmService");
const { createOrder, fetchSupportedMethods, verifyPaymentSignature, razorpayKeyId } = require("./razorpayService");
const { ensureInvoiceDirectory, buildInvoiceNumber, formatAmount } = require("./invoiceService");
const { upsertClientIdentity } = require("./clientIdentityService");
const postPaymentService = require("./postPaymentService");
const pricingService = require("./pricingService");
const env = require("../config/env");

ensureInvoiceDirectory();

function normalizeText(value) {
  return String(value || "").trim();
}

function isValidPhone(phone) {
  return /^[0-9+\-\s]{10,15}$/.test(String(phone || "").trim());
}

function normalizePaymentMessage(message) {
  const normalizedMessage = normalizeText(message);
  return normalizedMessage.length >= 5 ? normalizedMessage : "Payment initiated";
}

function validateCreateOrderPayload({ name, phone, service, website }) {
  if (website) {
    throw new AppError("Spam detected.", 400, "SPAM_DETECTED");
  }

  if (!normalizeText(name) || normalizeText(name).length < 2) {
    throw new AppError("Please enter a valid name.", 400, "VALIDATION_ERROR");
  }

  if (!isValidPhone(phone)) {
    throw new AppError("Please enter a valid phone number.", 400, "VALIDATION_ERROR");
  }

  if (!normalizeText(service)) {
    throw new AppError("Please select a service.", 400, "VALIDATION_ERROR");
  }
}

function getPaymentServiceConfig(payload) {
  const candidates = [payload.serviceCode, payload.serviceId, payload.service, payload.serviceName]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  for (const candidate of candidates) {
    const serviceConfig = findServiceDefinition(candidate);
    if (serviceConfig) {
      return serviceConfig;
    }
  }

  return null;
}

function ensurePayableServiceConfig(serviceConfig, receivedService) {
  console.log("SERVICE MATCH:", serviceConfig ? {
    code: serviceConfig.serviceCode,
    name: serviceConfig.serviceName,
    category: serviceConfig.categoryKey,
  } : null);

  if (!serviceConfig) {
    throw new AppError("Invalid service", 400, "INVALID_SERVICE", {
      received: receivedService,
    });
  }

  return serviceConfig;
}

function buildCheckoutDescription(serviceConfig) {
  return serviceConfig.paymentDescription || `${serviceConfig.serviceName} service package`;
}

function buildCheckoutDisplayConfig() {
  return {
    display: {
      sequence: ["upi", "card", "netbanking", "wallet", "emi", "cardless_emi", "paylater", "app"],
      preferences: {
        show_default_blocks: true,
      },
    },
  };
}

async function createPaymentRecord({ order, payload, serviceConfig, amount }) {
  return paymentRepository.create({
    orderId: order.id,
    paymentId: null,
    service: serviceConfig.serviceName,
    amount: Number(amount),
    currency: order.currency,
    status: "created",
    customerName: normalizeText(payload.name),
    customerPhone: normalizeText(payload.phone),
    customerMessage: normalizeText(payload.message),
    invoiceNumber: buildInvoiceNumber(order.id),
    whatsappStatus: "pending",
    clientId: null,
  });
}

async function createOrderForPayment(payload) {
  const message = normalizePaymentMessage(payload.message);
  const receivedService = normalizeText(payload.serviceCode || payload.serviceId || payload.service || payload.serviceName);

  validateCreateOrderPayload({
    name: payload.name,
    phone: payload.phone,
    service: receivedService,
    website: payload.website || "",
  });

  const serviceConfig = ensurePayableServiceConfig(getPaymentServiceConfig(payload), receivedService);
  const finalPrice = await pricingService.getFinalPrice(serviceConfig.serviceCode, {
    category: serviceConfig.categoryKey,
    source: normalizeText(payload.source || "website") || "website",
  });
  const amount = finalPrice * 100;

  console.log("SERVICE:", serviceConfig.serviceCode);
  console.log("PRICE:", finalPrice);
  console.log("RAZORPAY AMOUNT:", amount);

  logger.info("create_order_started", {
    name: payload.name,
    phone: payload.phone,
    service: receivedService,
    matchedServiceCode: serviceConfig.serviceCode,
    matchedServiceName: serviceConfig.serviceName,
    categoryKey: serviceConfig.categoryKey,
    price: finalPrice,
    amount,
  });

  const order = await createOrder({
    amount,
    currency: serviceConfig.currency,
    receipt: `receipt_${Date.now()}`,
    notes: {
      service: serviceConfig.serviceName,
      service_name: serviceConfig.serviceName,
      service_category: serviceConfig.categoryKey,
      customer_name: normalizeText(payload.name),
      customer_phone: normalizeText(payload.phone),
      source: normalizeText(payload.source || "website") || "website",
    },
  });

  await createPaymentRecord({
    order,
    payload: {
      ...payload,
      message,
    },
    serviceConfig,
    amount,
  });

  logger.info("create_order_completed", {
    orderId: order.id,
    matchedServiceCode: serviceConfig.serviceCode,
  });

  return {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: razorpayKeyId,
    service: serviceConfig.serviceName,
    service_name: serviceConfig.serviceName,
    price: finalPrice,
    customer_name: normalizeText(payload.name),
    customer_phone: normalizeText(payload.phone),
    checkout: {
      key: razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      name: env.businessName,
      description: buildCheckoutDescription(serviceConfig),
      prefill: {
        name: normalizeText(payload.name),
        contact: normalizeText(payload.phone),
        email: normalizeText(payload.email || "") || undefined,
      },
      notes: {
        service: serviceConfig.serviceName,
        serviceName: serviceConfig.serviceName,
        category: serviceConfig.categoryKey,
      },
      config: buildCheckoutDisplayConfig(),
    },
  };
}

async function markInvalidSignature({ orderId, paymentId, signature }) {
  return paymentRepository.markInvalidSignature({
    orderId,
    paymentId,
    signature,
    updatedAt: new Date().toISOString(),
  });
}

async function upsertServiceRecord({ payment, client, orderId, paymentId, paidAt, crmLead = null }) {
  return serviceExecutionService.upsertServiceFromPayment({
    payment,
    client,
    orderId,
    paymentId,
    paidAt,
    crmLead,
  });
}

async function verifyPayment(payload) {
  const orderId = payload.razorpay_order_id;
  const paymentId = payload.razorpay_payment_id;
  const signature = payload.razorpay_signature;

  logger.info("verify_payment_received", {
    orderId,
    paymentId,
    hasSignature: Boolean(signature),
  });

  if (!orderId || !paymentId || !signature) {
    throw new AppError("Missing payment verification details.", 400, "MISSING_PAYMENT_DETAILS");
  }

  let signatureValid = false;

  try {
    signatureValid = verifyPaymentSignature({ orderId, paymentId, signature });
    logger.info("verify_payment_signature_checked", { orderId, paymentId, isSignatureValid: signatureValid });
  } catch (error) {
    logger.error("verify_payment_signature_exception", {
      message: error.message,
      stack: error.stack,
    });
    throw new AppError("Could not verify the payment right now.", 500, "SIGNATURE_VERIFICATION_FAILED");
  }

  if (!signatureValid) {
    await markInvalidSignature({ orderId, paymentId, signature }).catch((error) => {
      logger.error("verify_payment_invalid_signature_persist_failed", {
        message: error.message,
        stack: error.stack,
      });
    });

    throw new AppError("Invalid payment signature.", 400, "INVALID_PAYMENT_SIGNATURE");
  }

  const payment = await paymentRepository.findByOrderId(orderId);

  if (!payment) {
    throw new AppError("Payment order not found.", 404, "PAYMENT_NOT_FOUND");
  }

  const client = await upsertClientIdentity({
    phone: payment.customer_phone,
    name: payment.customer_name,
  });
  const paidAt = new Date().toISOString();
  const invoiceNumber = payment.invoice_number || buildInvoiceNumber(orderId);

  await paymentRepository.updateStatusAndVerification({
    orderId,
    paymentId,
    signature,
    status: "paid",
    invoiceNumber,
    clientId: client.id,
    updatedAt: paidAt,
  });

  const crmResult = await crmService.reconcileSuccessfulPayment({
    payment: {
      ...payment,
      payment_id: paymentId,
      razorpay_signature: signature,
    },
    client,
    orderId,
    paymentId,
    paidAt,
  });

  const resolvedClient = crmResult.client || client;
  const service = await upsertServiceRecord({
    payment,
    client: resolvedClient,
    orderId,
    paymentId,
    paidAt,
    crmLead: crmResult.lead || null,
  });

  const paidPayment = {
    ...payment,
    client_id: resolvedClient.id,
    customer_name: resolvedClient.name || payment.customer_name,
    payment_id: paymentId,
    status: "paid",
    updated_at: paidAt,
    invoice_number: invoiceNumber,
  };

  const postProcessing = await postPaymentService.enqueueOrProcess({
    orderId,
    payment: paidPayment,
  });

  logger.info("verify_payment_completed", {
    orderId,
    paymentId,
    clientId: resolvedClient.id,
    leadId: crmResult.lead ? crmResult.lead.id : null,
    serviceId: service && service.service ? service.service.id : service && service.id ? service.id : null,
    postProcessingMode: postProcessing.mode,
    invoiceGenerated: Boolean(postProcessing.invoiceGenerated),
    whatsappStatus: postProcessing.whatsappStatus,
  });

  return {
    success: true,
    message:
      postProcessing.mode === "queued"
        ? "Payment verified successfully. Confirmation is being finalized."
        : "Payment verified successfully.",
    confirmation_url: `/payment-success?orderId=${encodeURIComponent(orderId)}`,
    invoice_url: postProcessing.invoiceUrl,
    order_id: orderId,
    payment_id: paymentId,
    client_id: resolvedClient.id,
    lead_id: crmResult.lead ? crmResult.lead.id : null,
    service_id: service && service.service ? service.service.id : service && service.id ? service.id : null,
    whatsapp_status: postProcessing.whatsappStatus,
    invoice_generated: Boolean(postProcessing.invoiceGenerated),
    invoice_error: postProcessing.invoiceError,
    post_processing_status: postProcessing.mode,
  };
}

async function getPaymentDetails(orderId) {
  const payment = await paymentRepository.getDetailsByOrderId(orderId);

  if (!payment) {
    throw new AppError("Payment details not found.", 404, "PAYMENT_NOT_FOUND");
  }

  const linkedService = await serviceRepository.findByOrderId(orderId);

  return {
    ...payment,
    amount_formatted: formatAmount(payment.amount, payment.currency),
    invoice_url: payment.invoice_url,
    service_id: linkedService ? linkedService.id : null,
    service_status: linkedService ? linkedService.status : null,
    client_id: linkedService ? linkedService.client_id || linkedService.clientId : payment.client_id || payment.clientId || null,
  };
}

async function getSupportedPaymentMethods() {
  return fetchSupportedMethods();
}

module.exports = {
  createOrderForPayment,
  getSupportedPaymentMethods,
  verifyPayment,
  getPaymentDetails,
};
