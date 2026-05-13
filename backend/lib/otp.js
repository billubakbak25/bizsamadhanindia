const crypto = require("crypto");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function createOtpHash(otp) {
  const salt = crypto.randomBytes(16).toString("hex");
  const digest = crypto.scryptSync(String(otp || ""), salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

function verifyOtpHash(otp, storedValue) {
  const [salt, expectedDigest] = String(storedValue || "").split(":");

  if (!salt || !expectedDigest) {
    return false;
  }

  const actualDigest = crypto.scryptSync(String(otp || ""), salt, 64).toString("hex");
  const left = Buffer.from(expectedDigest, "hex");
  const right = Buffer.from(actualDigest, "hex");

  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function buildOtpExpiry(windowMs) {
  return new Date(Date.now() + Number(windowMs || 0));
}

module.exports = {
  normalizeEmail,
  validateEmail,
  generateOtp,
  createOtpHash,
  verifyOtpHash,
  buildOtpExpiry,
};
