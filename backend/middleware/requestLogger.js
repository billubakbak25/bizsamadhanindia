const logger = require("../utils/logger");

module.exports = function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    logger.info("http_request", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "",
    });
  });

  next();
};
