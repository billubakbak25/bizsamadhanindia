const crypto = require("crypto");

const env = require("../config/env");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function login(req, { username, password }) {
  if (safeCompare(username, env.adminUsername) && safeCompare(password, env.adminPassword)) {
    req.session.isAdmin = true;
    req.session.admin = {
      username: env.adminUsername,
      authenticatedAt: new Date().toISOString(),
    };
    logger.info("admin_login_success", {
      username: env.adminUsername,
      ip: req.ip || req.connection.remoteAddress || req.socket.remoteAddress || "unknown",
    });
    return { message: "Login successful." };
  }

  logger.warn("admin_login_failed", {
    username: String(username || "").trim(),
    ip: req.ip || req.connection.remoteAddress || req.socket.remoteAddress || "unknown",
  });
  throw new AppError("Invalid username or password.", 401, "INVALID_CREDENTIALS");
}

function logout(req) {
  return new Promise((resolve) => {
    req.session.destroy(() => {
      resolve({ message: "Logged out successfully." });
    });
  });
}

function getSession(req) {
  return {
    authenticated: Boolean(req.session && req.session.isAdmin),
    admin: req.session && req.session.admin ? req.session.admin : null,
  };
}

module.exports = {
  login,
  logout,
  getSession,
};
