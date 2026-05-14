const crypto = require("crypto");
const https = require("https");
const Razorpay = require("razorpay");
const { getRedisClient } = require("../infrastructure/redis");
const logger = require("../utils/logger");

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

const razorpay = razorpayKeyId && razorpayKeySecret
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  : null;

const supportedMethodsCacheKey = "razorpay:supported_methods:v1";
const supportedMethodsCacheTtlSeconds = 6 * 60 * 60;
let supportedMethodsMemoryCache = null;

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

function buildSupportedMethodsFallback(reason) {
  return {
    success: false,
    source: "fallback",
    reason,
    refreshed_at: new Date().toISOString(),
    methods: {
      card: true,
      netbanking: true,
      upi: true,
      wallet: true,
      emi: true,
      cardless_emi: true,
      paylater: true,
      app: true,
    },
    banks: {},
    wallets: {},
    upi: {},
    apps: {},
    card_networks: ["Visa", "Mastercard", "RuPay", "American Express"],
    note: "Live bank and provider lists are fetched from Razorpay when RAZORPAY_KEY_ID is configured.",
  };
}

function readCachedSupportedMethods() {
  if (!supportedMethodsMemoryCache || supportedMethodsMemoryCache.expiresAt <= Date.now()) {
    return null;
  }

  return supportedMethodsMemoryCache.payload;
}

async function writeSupportedMethodsCache(payload) {
  supportedMethodsMemoryCache = {
    payload,
    expiresAt: Date.now() + supportedMethodsCacheTtlSeconds * 1000,
  };

  const redis = await getRedisClient();
  if (redis) {
    await redis.set(supportedMethodsCacheKey, JSON.stringify(payload), "EX", supportedMethodsCacheTtlSeconds);
  }
}

async function readSupportedMethodsCache() {
  const memoryPayload = readCachedSupportedMethods();
  if (memoryPayload) {
    return memoryPayload;
  }

  const redis = await getRedisClient();
  if (!redis) {
    return null;
  }

  const cachedPayload = await redis.get(supportedMethodsCacheKey);
  if (!cachedPayload) {
    return null;
  }

  try {
    const payload = JSON.parse(cachedPayload);
    supportedMethodsMemoryCache = {
      payload,
      expiresAt: Date.now() + supportedMethodsCacheTtlSeconds * 1000,
    };
    return payload;
  } catch (error) {
    logger.warn("razorpay_supported_methods_cache_parse_failed", { message: error.message });
    return null;
  }
}

function requestSupportedMethodsFromRazorpay() {
  return new Promise((resolve, reject) => {
    if (!razorpayKeyId) {
      resolve(buildSupportedMethodsFallback("RAZORPAY_KEY_ID is not configured."));
      return;
    }

    const request = https.request(
      {
        hostname: "api.razorpay.com",
        path: "/v1/methods",
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:`).toString("base64")}`,
          Accept: "application/json",
        },
        timeout: 10000,
      },
      (response) => {
        let body = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          let parsedBody = {};

          try {
            parsedBody = body ? JSON.parse(body) : {};
          } catch (error) {
            reject(new Error(`Could not parse Razorpay supported methods response: ${error.message}`));
            return;
          }

          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`Razorpay supported methods request failed with status ${response.statusCode}.`));
            return;
          }

          resolve({
            success: true,
            source: "razorpay",
            refreshed_at: new Date().toISOString(),
            ...parsedBody,
          });
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error("Razorpay supported methods request timed out."));
    });
    request.on("error", reject);
    request.end();
  });
}

async function fetchSupportedMethods({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cachedPayload = await readSupportedMethodsCache();
    if (cachedPayload) {
      return {
        ...cachedPayload,
        cache: "hit",
      };
    }
  }

  try {
    const payload = await requestSupportedMethodsFromRazorpay();
    await writeSupportedMethodsCache(payload);
    return {
      ...payload,
      cache: "refreshed",
    };
  } catch (error) {
    logger.error("razorpay_supported_methods_fetch_failed", { message: error.message });
    const fallback = buildSupportedMethodsFallback(error.message);
    await writeSupportedMethodsCache(fallback).catch((cacheError) => {
      logger.warn("razorpay_supported_methods_fallback_cache_failed", { message: cacheError.message });
    });
    return {
      ...fallback,
      cache: "fallback",
    };
  }
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
  fetchSupportedMethods,
  verifyPaymentSignature,
  razorpayKeyId,
};
