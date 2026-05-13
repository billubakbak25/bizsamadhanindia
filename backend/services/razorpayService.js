const crypto = require("crypto");
const Razorpay = require("razorpay");

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

const razorpay = razorpayKeyId && razorpayKeySecret
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  : null;

function ensureRazorpayConfigured() {
  if (!razorpay) {
    const error = new Error("Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    error.statusCode = 500;
    throw error;
  }
}

function toPositiveAmount(amount) {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error("A valid Razorpay amount is required.");
  }

  return Math.round(parsedAmount);
}

async function createOrder({ amount, currency, receipt, notes = {} }) {
  ensureRazorpayConfigured();

  return razorpay.orders.create({
    amount: toPositiveAmount(amount),
    currency: String(currency || "INR").trim().toUpperCase(),
    receipt: String(receipt || `receipt_${Date.now()}`),
    notes,
  });
}

function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!razorpayKeySecret) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedSignature = Buffer.from(generatedSignature, "utf8");
  const receivedSignature = Buffer.from(String(signature || ""), "utf8");

  if (expectedSignature.length !== receivedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedSignature, receivedSignature);
}

module.exports = {
  createOrder,
  ensureRazorpayConfigured,
  verifyPaymentSignature,
  razorpayKeyId,
};