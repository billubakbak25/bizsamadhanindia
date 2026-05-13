const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/appError");
const clientRepository = require("../repositories/clientRepository");

async function requireClient(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

    if (!token) {
      throw new AppError("Authentication required.", 401, "UNAUTHORIZED");
    }

    const payload = jwt.verify(token, env.jwtAccessSecret);
    const client = await clientRepository.findById(payload.clientId);

    if (!client) {
      throw new AppError("Client not found.", 401, "CLIENT_NOT_FOUND");
    }

    req.client = client;
    req.auth = payload;
    return next();
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    }

    return next(new AppError("Invalid or expired token.", 401, "INVALID_TOKEN"));
  }
}

module.exports = {
  requireClient,
};
