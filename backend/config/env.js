require("../loadEnv");

const path = require("path");

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
}

function isNotFalse(value, fallback = true) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value).trim().toLowerCase() !== "false";
}

const port = Number(process.env.PORT || 3000);
const appUrl = String(process.env.APP_URL || `http://localhost:${port}`).trim().replace(/\/+$/, "");

module.exports = {
  nodeEnv: String(process.env.NODE_ENV || "development").trim().toLowerCase(),
  port,
  apiVersion: String(process.env.API_VERSION || "v1").trim().toLowerCase(),
  appUrl,
  siteUrl: String(process.env.SITE_URL || appUrl).trim().replace(/\/+$/, ""),
  businessName: String(process.env.BUSINESS_NAME || "BizSamadhan India").trim(),
  businessPhone: String(process.env.BUSINESS_PHONE || "+91 99999 99999").trim(),
  businessEmail: String(process.env.BUSINESS_EMAIL || "hello@bizsamadhanindia.com").trim(),
  businessCity: String(process.env.BUSINESS_CITY || "Kanpur").trim(),
  businessRegion: String(process.env.BUSINESS_REGION || "Uttar Pradesh").trim(),
  businessCountry: String(process.env.BUSINESS_COUNTRY || "IN").trim(),
  businessPostalCode: String(process.env.BUSINESS_POSTAL_CODE || "").trim(),
  businessStreetAddress: String(process.env.BUSINESS_STREET_ADDRESS || "").trim(),
  googleAnalyticsId: String(process.env.GOOGLE_ANALYTICS_ID || "").trim(),
  googleTagManagerId: String(process.env.GOOGLE_TAG_MANAGER_ID || "").trim(),
  googleSiteVerificationFile: String(process.env.GOOGLE_SITE_VERIFICATION_FILE || "").trim(),
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  adminLoginLimit: Number(process.env.ADMIN_LOGIN_LIMIT || 5),
  adminLoginWindowMs: Number(process.env.ADMIN_LOGIN_WINDOW_MS || 15 * 60 * 1000),
  sessionSecret: process.env.SESSION_SECRET || "replace-this-secret-key",
  sessionName: String(process.env.SESSION_NAME || "bizsamadhan.sid").trim(),
  sessionPrefix: String(process.env.SESSION_PREFIX || "sess:").trim(),
  sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 4),
  secureCookies: toBoolean(process.env.SECURE_COOKIES, String(process.env.NODE_ENV || "development").trim().toLowerCase() === "production"),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || process.env.SESSION_SECRET || "replace-this-jwt-secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "7d",
  otpExpiresInMs: Number(process.env.OTP_EXPIRES_IN_MS || 5 * 60 * 1000),
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5),
  otpRequestLimit: Number(process.env.OTP_REQUEST_LIMIT || 5),
  otpRequestWindowMs: Number(process.env.OTP_REQUEST_WINDOW_MS || 60 * 60 * 1000),
  otpVerifyWindowMs: Number(process.env.OTP_VERIFY_WINDOW_MS || 60 * 60 * 1000),
  otpResendCooldownMs: Number(process.env.OTP_RESEND_COOLDOWN_MS || 30 * 1000),
  emailProvider: String(process.env.EMAIL_PROVIDER || "resend").trim().toLowerCase(),
  emailFrom: String(process.env.EMAIL_FROM || "").trim(),
  emailReplyTo: String(process.env.EMAIL_REPLY_TO || "").trim(),
  resendApiKey: String(process.env.RESEND_API_KEY || "").trim(),
  emailAllowMock: toBoolean(process.env.EMAIL_ALLOW_MOCK, String(process.env.NODE_ENV || "development").trim().toLowerCase() !== "production"),
  turnstileSecretKey: String(process.env.TURNSTILE_SECRET_KEY || "").trim(),
  captchaAllowMock: toBoolean(process.env.CAPTCHA_ALLOW_MOCK, String(process.env.NODE_ENV || "development").trim().toLowerCase() !== "production"),
  uploadPath: path.join(__dirname, "..", "storage", "uploads"),
  logsPath: path.join(__dirname, "..", "storage", "logs"),
  maxUploadSizeBytes: Number(process.env.MAX_UPLOAD_SIZE_BYTES || 5 * 1024 * 1024),
  allowedUploadMimeTypes: String(process.env.ALLOWED_UPLOAD_MIME_TYPES || "application/pdf,image/jpeg,image/png")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  followUpScheduleMinutes: [10, 60, 1440],
  databaseUrl: String(process.env.DATABASE_URL || "").trim(),
  redisUrl: String(process.env.REDIS_URL || "").trim(),
  redisEnabled: toBoolean(process.env.REDIS_ENABLED) || Boolean(String(process.env.REDIS_URL || "").trim()),
  queueEnabled: toBoolean(process.env.QUEUE_ENABLED),
  queuePrefix: String(process.env.QUEUE_PREFIX || "bizsamadhan").trim(),
  queueInlineWorkers: isNotFalse(process.env.QUEUE_INLINE_WORKERS, true),
  followUpQueueName: String(process.env.FOLLOW_UP_QUEUE_NAME || "followups").trim(),
  paymentQueueName: String(process.env.PAYMENT_QUEUE_NAME || "payments").trim(),
  whatsappQueueName: String(process.env.WHATSAPP_QUEUE_NAME || "whatsapp-bot").trim(),
  paymentInlinePostProcessing: isNotFalse(process.env.PAYMENT_INLINE_POST_PROCESSING, true),
  followUpWorkerConcurrency: Number(process.env.FOLLOW_UP_WORKER_CONCURRENCY || 2),
  paymentWorkerConcurrency: Number(process.env.PAYMENT_WORKER_CONCURRENCY || 2),
  whatsappWorkerConcurrency: Number(process.env.WHATSAPP_WORKER_CONCURRENCY || 2),
  followUpPollIntervalMs: Number(process.env.FOLLOW_UP_POLL_INTERVAL_MS || 60 * 1000),
  storageDriver: String(process.env.STORAGE_DRIVER || "local").trim().toLowerCase(),
  storagePublicBaseUrl: String(process.env.STORAGE_PUBLIC_BASE_URL || "").trim(),
  s3Bucket: String(process.env.S3_BUCKET || "").trim(),
  s3Region: String(process.env.S3_REGION || "ap-south-1").trim(),
  s3Endpoint: String(process.env.S3_ENDPOINT || "").trim(),
  s3AccessKeyId: String(process.env.S3_ACCESS_KEY_ID || "").trim(),
  s3SecretAccessKey: String(process.env.S3_SECRET_ACCESS_KEY || "").trim(),
  s3ForcePathStyle: toBoolean(process.env.S3_FORCE_PATH_STYLE),
  whatsappApiToken: String(process.env.WHATSAPP_API_TOKEN || "").trim(),
  whatsappPhoneNumberId: String(process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim(),
  whatsappGraphApiVersion: String(process.env.WHATSAPP_GRAPH_API_VERSION || "v20.0").trim(),
  whatsappTemplateName: String(process.env.WHATSAPP_TEMPLATE_NAME || "hello_world").trim(),
  whatsappTemplateLanguageCode: String(process.env.WHATSAPP_TEMPLATE_LANGUAGE_CODE || "en_US").trim(),
  whatsappLeadNotifyTo: String(process.env.WHATSAPP_LEAD_NOTIFY_TO || "").trim(),
  whatsappWebhookVerifyToken: String(process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "").trim(),
  whatsappAppSecret: String(process.env.WHATSAPP_APP_SECRET || "").trim(),
  whatsappBotEnabled: isNotFalse(process.env.WHATSAPP_BOT_ENABLED, true),
  corsAllowedOrigins: String(process.env.CORS_ALLOWED_ORIGINS || "").trim(),
  staticAssetCacheSeconds: Number(process.env.STATIC_ASSET_CACHE_SECONDS || 60 * 60 * 24 * 7),
  compressionThresholdBytes: Number(process.env.COMPRESSION_THRESHOLD_BYTES || 1024),
  forceHttps: toBoolean(process.env.FORCE_HTTPS, false),
  trustProxyHops: Number(process.env.TRUST_PROXY_HOPS || 1),
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 30 * 1000),
  headersTimeoutMs: Number(process.env.HEADERS_TIMEOUT_MS || 35 * 1000),
  keepAliveTimeoutMs: Number(process.env.KEEP_ALIVE_TIMEOUT_MS || 5 * 1000),
  gracefulShutdownTimeoutMs: Number(process.env.GRACEFUL_SHUTDOWN_TIMEOUT_MS || 10 * 1000),
};
