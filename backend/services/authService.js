const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const otpRepository = require("../repositories/otpRepository");
const { sendEmailOtp } = require("../lib/emailService");
const { buildOtpExpiry, createOtpHash, generateOtp, normalizeEmail, validateEmail, verifyOtpHash } = require("../lib/otp");
const { enforceRateLimit } = require("../lib/rate-limit");
const { verifyCaptchaToken } = require("../lib/captcha");
const { upsertClientByEmail } = require("./clientIdentityService");

function ensureOtpFormat(otp) {
  return /^[0-9]{6}$/.test(String(otp || "").trim());
}

async function sendOtpEmailCode({ email, captchaToken }) {
  const normalizedEmail = normalizeEmail(email);

  if (!validateEmail(normalizedEmail)) {
    throw new AppError("Valid email is required.", 400, "VALIDATION_ERROR");
  }

  await verifyCaptchaToken(captchaToken);

  await Promise.all([
    enforceRateLimit({
      key: `auth:email:send:${normalizedEmail}`,
      limit: env.otpRequestLimit,
      windowMs: env.otpRequestWindowMs,
      message: "Too many OTP requests. Please try again in an hour.",
      code: "OTP_REQUEST_LIMIT_EXCEEDED",
    }),
    enforceRateLimit({
      key: `auth:email:resend:${normalizedEmail}`,
      limit: 1,
      windowMs: env.otpResendCooldownMs,
      message: "Please wait 30 seconds before requesting another OTP.",
      code: "OTP_RESEND_COOLDOWN",
    }),
  ]);

  const otp = generateOtp();
  const expiresAt = buildOtpExpiry(env.otpExpiresInMs);

  await otpRepository.deleteByEmail(normalizedEmail);
  await otpRepository.create({
    email: normalizedEmail,
    otpHash: createOtpHash(otp),
    expiresAt,
    attempts: 0,
  });

  const delivery = await sendEmailOtp(normalizedEmail, otp);

  logger.info("auth_email_otp_sent", {
    email: normalizedEmail,
    expiresAt: expiresAt.toISOString(),
    provider: delivery.provider,
    messageId: delivery.id || null,
  });

  return {
    email: normalizedEmail,
    expiresAt: expiresAt.toISOString(),
    cooldownSeconds: Math.ceil(env.otpResendCooldownMs / 1000),
  };
}

async function verifyOtpEmailCode({ email, otp }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedOtp = String(otp || "").trim();

  if (!validateEmail(normalizedEmail)) {
    throw new AppError("Valid email is required.", 400, "VALIDATION_ERROR");
  }

  if (!ensureOtpFormat(normalizedOtp)) {
    throw new AppError("Valid OTP is required.", 400, "VALIDATION_ERROR");
  }

  await enforceRateLimit({
    key: `auth:email:verify:${normalizedEmail}`,
    limit: env.otpMaxAttempts,
    windowMs: env.otpVerifyWindowMs,
    message: "Too many verification attempts. Please try again in an hour.",
    code: "OTP_VERIFY_LIMIT_EXCEEDED",
  });

  const record = await otpRepository.findLatestByEmail(normalizedEmail);

  if (!record) {
    throw new AppError("OTP not found.", 404, "OTP_NOT_FOUND");
  }

  if (record.expires_at && new Date(record.expires_at).getTime() < Date.now()) {
    await otpRepository.deleteById(record.id);
    throw new AppError("OTP expired.", 400, "OTP_EXPIRED");
  }

  if (Number(record.attempts || 0) >= env.otpMaxAttempts) {
    await otpRepository.deleteById(record.id);
    throw new AppError("Maximum OTP attempts exceeded.", 429, "OTP_ATTEMPTS_EXCEEDED");
  }

  const valid = verifyOtpHash(normalizedOtp, record.otp_hash);

  if (!valid) {
    await otpRepository.updateAttempts(record.id, Number(record.attempts || 0) + 1);
    throw new AppError("Invalid OTP.", 400, "INVALID_OTP");
  }

  await otpRepository.deleteById(record.id);
  const client = await upsertClientByEmail(normalizedEmail);
  const accessToken = jwt.sign(
    {
      clientId: client.id,
      email: client.email,
      phone: client.phone || null,
      role: "client",
      type: "access",
    },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );

  logger.info("auth_email_otp_verified", {
    email: normalizedEmail,
    clientId: client.id,
  });

  return {
    accessToken,
    client,
  };
}

module.exports = {
  sendOtpEmailCode,
  verifyOtpEmailCode,
};