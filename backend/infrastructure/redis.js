const Redis = require("ioredis");
const env = require("../config/env");
const logger = require("../utils/logger");

let clientPromise = null;
let warningLogged = false;

async function createRedisClient() {
  if (!env.redisEnabled || !env.redisUrl) {
    if (!warningLogged) {
      logger.warn("redis_disabled", {
        reason: "REDIS_ENABLED or REDIS_URL not configured",
      });
      warningLogged = true;
    }
    return null;
  }

  const client = new Redis(env.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  client.on("error", (error) => {
    logger.error("redis_error", {
      message: error.message,
    });
  });

  await client.connect();
  logger.info("redis_connected", {
    hostConfigured: true,
  });
  return client;
}

async function getRedisClient() {
  if (!clientPromise) {
    clientPromise = createRedisClient().catch((error) => {
      clientPromise = null;
      logger.error("redis_connection_failed", {
        message: error.message,
      });
      return null;
    });
  }

  return clientPromise;
}

module.exports = {
  getRedisClient,
};
