const logger = require("../utils/logger");
const env = require("../config/env");
const paymentRepository = require("../repositories/paymentRepository");
const { sendPaymentConfirmation } = require("./whatsappService");
const { generateInvoicePdf, formatAmount } = require("./invoiceService");
const { enqueue } = require("../infrastructure/queue");

async function generateInvoice(payment, orderId) {
  if (payment.invoice_url) {
    return {
      invoiceUrl: payment.invoice_url,
      invoiceError: null,
      skipped: true,
    };
  }

  try {
    const invoice = await generateInvoicePdf({ payment, appUrl: env.appUrl });
    await paymentRepository.updateInvoice({
      orderId,
      invoiceUrl: invoice.invoiceUrl,
      invoicePath: invoice.filePath,
      updatedAt: new Date().toISOString(),
    });

    logger.info("invoice_generated", {
      orderId,
      invoiceUrl: invoice.invoiceUrl,
    });

    return {
      invoiceUrl: invoice.invoiceUrl,
      invoiceError: null,
      skipped: false,
    };
  } catch (error) {
    logger.error("invoice_generation_failed", {
      orderId,
      message: error.message,
      stack: error.stack,
    });

    return {
      invoiceUrl: null,
      invoiceError: error.message,
      skipped: false,
    };
  }
}

async function sendConfirmation(payment, orderId) {
  if (["sent", "skipped"].includes(String(payment.whatsapp_status || "").toLowerCase())) {
    return {
      sent: payment.whatsapp_status === "sent",
      status: payment.whatsapp_status,
      reason: payment.whatsapp_error || null,
      skipped: true,
    };
  }

  try {
    const whatsappResult = await sendPaymentConfirmation({
      phone: payment.customer_phone,
      customerName: payment.customer_name,
      amountFormatted: formatAmount(payment.amount, payment.currency),
    });

    await paymentRepository.updateWhatsapp({
      orderId,
      whatsappStatus: whatsappResult.status,
      whatsappError: whatsappResult.reason || null,
      updatedAt: new Date().toISOString(),
    });

    logger.info("whatsapp_result_recorded", {
      orderId,
      whatsappStatus: whatsappResult.status,
    });

    return {
      ...whatsappResult,
      skipped: false,
    };
  } catch (error) {
    logger.error("whatsapp_send_exception", {
      orderId,
      message: error.message,
      stack: error.stack,
    });

    await paymentRepository.updateWhatsapp({
      orderId,
      whatsappStatus: "failed",
      whatsappError: error.message,
      updatedAt: new Date().toISOString(),
    }).catch((dbError) => {
      logger.error("whatsapp_error_persist_failed", {
        message: dbError.message,
        stack: dbError.stack,
      });
    });

    return {
      sent: false,
      status: "failed",
      reason: error.message,
      skipped: false,
    };
  }
}

async function processPostPayment({ orderId, payment = null }) {
  const currentPayment = payment || await paymentRepository.findByOrderId(orderId);

  if (!currentPayment) {
    throw new Error(`Payment not found for order ${orderId}`);
  }

  const invoiceResult = await generateInvoice(currentPayment, orderId);
  const refreshedPayment = await paymentRepository.findByOrderId(orderId);
  const whatsappResult = await sendConfirmation(refreshedPayment || currentPayment, orderId);

  return {
    invoiceUrl: invoiceResult.invoiceUrl,
    invoiceError: invoiceResult.invoiceError,
    invoiceGenerated: Boolean(invoiceResult.invoiceUrl),
    whatsappStatus: whatsappResult.status,
    whatsappResult,
  };
}

async function enqueueOrProcess({ orderId, payment = null }) {
  if (env.queueEnabled && !env.paymentInlinePostProcessing) {
    await paymentRepository.updateWhatsapp({
      orderId,
      whatsappStatus: "queued",
      whatsappError: null,
      updatedAt: new Date().toISOString(),
    }).catch(() => null);

    const job = await enqueue(
      env.paymentQueueName,
      "payment.post_process",
      { orderId },
      {
        jobId: `payment-post-process:${orderId}`,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      }
    );

    if (job) {
      logger.info("payment_post_processing_queued", {
        orderId,
        jobId: job.id,
      });
      return {
        mode: "queued",
        invoiceUrl: payment && payment.invoice_url ? payment.invoice_url : null,
        invoiceError: null,
        invoiceGenerated: Boolean(payment && payment.invoice_url),
        whatsappStatus: "queued",
      };
    }
  }

  const result = await processPostPayment({ orderId, payment });
  return {
    mode: "inline",
    ...result,
  };
}

module.exports = {
  processPostPayment,
  enqueueOrProcess,
};
