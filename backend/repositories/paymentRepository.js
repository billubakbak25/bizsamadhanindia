const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const PAYMENT_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["orderId", "order_id"],
  ["paymentId", "payment_id"],
  ["service", "service"],
  ["amount", "amount"],
  ["currency", "currency"],
  ["status", "status"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
  ["customerName", "customer_name"],
  ["customerPhone", "customer_phone"],
  ["customerMessage", "customer_message"],
  ["invoiceNumber", "invoice_number"],
  ["invoiceHtml", "invoice_html"],
  ["invoiceUrl", "invoice_url"],
  ["invoicePath", "invoice_path"],
  ["whatsappStatus", "whatsapp_status"],
  ["whatsappError", "whatsapp_error"],
  ["razorpaySignature", "razorpay_signature"],
  ["clientId", "client_id"],
]);

async function create({
  orderId,
  paymentId = null,
  service,
  amount,
  currency,
  status,
  customerName = null,
  customerPhone = null,
  customerMessage = null,
  invoiceNumber = null,
  whatsappStatus = "pending",
  clientId = null,
}) {
  const now = new Date().toISOString();
  const record = await prisma.payment.create({
    data: {
      orderId: String(orderId),
      paymentId,
      service,
      amount: Number(amount),
      currency,
      status,
      createdAt: now,
      updatedAt: now,
      customerName,
      customerPhone,
      customerMessage,
      invoiceNumber,
      whatsappStatus,
      clientId: clientId === null || clientId === undefined || clientId === "" ? null : Number(clientId),
    },
  });

  return mapRecord(record, PAYMENT_FIELD_MAP);
}

async function findById(id) {
  const record = await prisma.payment.findUnique({
    where: { id: Number(id) },
  });

  return mapRecord(record, PAYMENT_FIELD_MAP);
}

async function findByOrderId(orderId) {
  const record = await prisma.payment.findUnique({
    where: { orderId: String(orderId) },
  });

  return mapRecord(record, PAYMENT_FIELD_MAP);
}

async function listByClientId(clientId) {
  const records = await prisma.payment.findMany({
    where: { clientId: Number(clientId) },
    orderBy: { updatedAt: "desc" },
  });

  return mapRecords(records, PAYMENT_FIELD_MAP);
}

async function updateStatusAndVerification({ orderId, paymentId, signature, status, invoiceNumber, clientId, updatedAt }) {
  await prisma.payment.updateMany({
    where: { orderId: String(orderId) },
    data: {
      paymentId,
      razorpaySignature: signature,
      status,
      updatedAt,
      invoiceNumber,
      clientId: clientId === null || clientId === undefined || clientId === "" ? null : Number(clientId),
    },
  });

  return findByOrderId(orderId);
}

async function markInvalidSignature({ orderId, paymentId, signature, updatedAt }) {
  await prisma.payment.updateMany({
    where: { orderId: String(orderId) },
    data: {
      paymentId,
      razorpaySignature: signature,
      status: "signature_failed",
      updatedAt,
    },
  });

  return findByOrderId(orderId);
}

async function updateInvoice({ orderId, invoiceUrl, invoicePath, updatedAt }) {
  await prisma.payment.updateMany({
    where: { orderId: String(orderId) },
    data: {
      invoiceUrl,
      invoicePath,
      updatedAt,
    },
  });

  return findByOrderId(orderId);
}

async function updateWhatsapp({ orderId, whatsappStatus, whatsappError = null, updatedAt }) {
  await prisma.payment.updateMany({
    where: { orderId: String(orderId) },
    data: {
      whatsappStatus,
      whatsappError,
      updatedAt,
    },
  });

  return findByOrderId(orderId);
}

async function getDetailsByOrderId(orderId) {
  const record = await prisma.payment.findUnique({
    where: { orderId: String(orderId) },
    select: {
      orderId: true,
      paymentId: true,
      service: true,
      amount: true,
      currency: true,
      status: true,
      customerName: true,
      customerPhone: true,
      invoiceNumber: true,
      invoiceUrl: true,
      whatsappStatus: true,
      whatsappError: true,
      updatedAt: true,
      clientId: true,
    },
  });

  return mapRecord(record, PAYMENT_FIELD_MAP);
}

module.exports = {
  create,
  findById,
  findByOrderId,
  listByClientId,
  updateStatusAndVerification,
  markInvalidSignature,
  updateInvoice,
  updateWhatsapp,
  getDetailsByOrderId,
};
