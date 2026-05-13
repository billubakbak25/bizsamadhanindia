const rateLimitService = require("../services/rateLimitService");
const env = require("../config/env");

async function consumeLimit(req, res, next, { keyPrefix, limit, windowMs, message }) {
  try {
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || "unknown";
    const result = await rateLimitService.consume({
      key: `${keyPrefix}:${ip}`,
      limit,
      windowMs,
    });

    if (!result.allowed) {
      res.setHeader("Retry-After", Math.ceil(result.retryAfterMs / 1000));
      return res.status(429).json({
        message,
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

async function leadRateLimiter(req, res, next) {
  return consumeLimit(req, res, next, {
    keyPrefix: "lead",
    limit: 5,
    windowMs: 60 * 1000,
    message: "Too many submissions. Please wait a minute and try again.",
  });
}

async function chatbotRateLimiter(req, res, next) {
  return consumeLimit(req, res, next, {
    keyPrefix: "chatbot",
    limit: 12,
    windowMs: 60 * 1000,
    message: "Too many assistant requests. Please wait a minute and try again.",
  });
}

async function adminLoginRateLimiter(req, res, next) {
  return consumeLimit(req, res, next, {
    keyPrefix: "admin:login",
    limit: env.adminLoginLimit,
    windowMs: env.adminLoginWindowMs,
    message: "Too many admin login attempts. Please wait and try again.",
  });
}

module.exports = { leadRateLimiter, chatbotRateLimiter, adminLoginRateLimiter };
