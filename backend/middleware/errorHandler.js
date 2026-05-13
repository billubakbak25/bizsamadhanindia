const logger = require("../utils/logger");

module.exports = function errorHandler(error, req, res, next) {
  const statusCode = Number(error.statusCode || 500);
  const code = error.code || "INTERNAL_SERVER_ERROR";
  const isProduction = process.env.NODE_ENV === "production";
  const errorPayload = {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code,
    message: error.message,
    stack: error.stack,
  };

  logger.error("request_failed", errorPayload);
  console.error("api_error", errorPayload);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: statusCode >= 500 && isProduction ? "Internal server error" : error.message,
      ...(isProduction || !error.stack ? {} : { stack: error.stack }),
    },
  });
};