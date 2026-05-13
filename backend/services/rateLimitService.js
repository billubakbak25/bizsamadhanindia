const logger = require("../utils/logger");
const { getRedisClient } = require("../infrastructure/redis");

const memoryBuckets = new Map();

async function consume({ key, limit, windowMs }) {
  const redis = await getRedisClient();

  if (redis) {
    const redisKey = `rate_limit:${key}`;
    const total = await redis.incr(redisKey);

    if (total === 1) {
      await redis.pexpire(redisKey, windowMs);
    }

    const ttl = await redis.pttl(redisKey);
    return {
      allowed: total <= limit,
      count: total,
      retryAfterMs: ttl > 0 ? ttl : windowMs,
    };
  }

  const now = Date.now();
  const timestamps = (memoryBuckets.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
  timestamps.push(now);
  memoryBuckets.set(key, timestamps);

  if (timestamps.length > limit) {
    logger.warn("rate_limit_exceeded", { key, limit, windowMs });
  }

  return {
    allowed: timestamps.length <= limit,
    count: timestamps.length,
    retryAfterMs: windowMs,
  };
}

module.exports = {
  consume,
};
