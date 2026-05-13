const AppError = require("../utils/appError");
const rateLimitService = require("../services/rateLimitService");

async function enforceRateLimit({ key, limit, windowMs, message, code }) {
  const result = await rateLimitService.consume({
    key,
    limit,
    windowMs,
  });

  if (!result.allowed) {
    throw new AppError(message, 429, code || "RATE_LIMIT_EXCEEDED");
  }

  return result;
}

module.exports = {
  enforceRateLimit,
};
