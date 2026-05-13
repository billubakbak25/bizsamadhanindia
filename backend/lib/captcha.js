const AppError = require("../utils/appError");
const env = require("../config/env");

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

async function verifyTurnstileToken(token) {
  const body = new URLSearchParams({
    secret: env.turnstileSecretKey,
    response: token,
  });

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body,
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new AppError("CAPTCHA verification failed. Please retry the check.", 400, "CAPTCHA_INVALID");
  }

  return {
    provider: "turnstile",
    verified: true,
  };
}

async function verifyCaptchaToken(token) {
  const normalizedToken = String(token || "").trim();

  if (!normalizedToken) {
    throw new AppError("Complete the CAPTCHA check before requesting a code.", 400, "CAPTCHA_REQUIRED");
  }

  if (env.turnstileSecretKey) {
    return verifyTurnstileToken(normalizedToken);
  }

  if (env.captchaAllowMock && normalizedToken === "placeholder-ok") {
    return {
      provider: "mock",
      verified: true,
    };
  }

  throw new AppError("CAPTCHA provider is not configured.", 500, "CAPTCHA_NOT_CONFIGURED");
}

module.exports = {
  verifyCaptchaToken,
};
