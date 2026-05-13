const session = require("express-session");
const env = require("../config/env");
const logger = require("../utils/logger");
const { getRedisClient } = require("./redis");

class RedisSessionStore extends session.Store {
  constructor(options = {}) {
    super();
    this.prefix = options.prefix || env.sessionPrefix;
    this.ttlSeconds = Number(options.ttlSeconds || env.sessionTtlSeconds);
  }

  getKey(sid) {
    return `${this.prefix}${sid}`;
  }

  getTtl(sessionData) {
    if (sessionData && sessionData.cookie && sessionData.cookie.maxAge) {
      return Math.max(1, Math.ceil(Number(sessionData.cookie.maxAge) / 1000));
    }
    return this.ttlSeconds;
  }

  async get(sid, callback) {
    try {
      const client = await getRedisClient();
      if (!client) {
        callback(null, null);
        return;
      }

      const raw = await client.get(this.getKey(sid));
      callback(null, raw ? JSON.parse(raw) : null);
    } catch (error) {
      callback(error);
    }
  }

  async set(sid, sessionData, callback) {
    try {
      const client = await getRedisClient();
      if (!client) {
        callback && callback(null);
        return;
      }

      await client.set(this.getKey(sid), JSON.stringify(sessionData), "EX", this.getTtl(sessionData));
      callback && callback(null);
    } catch (error) {
      callback && callback(error);
    }
  }

  async destroy(sid, callback) {
    try {
      const client = await getRedisClient();
      if (!client) {
        callback && callback(null);
        return;
      }

      await client.del(this.getKey(sid));
      callback && callback(null);
    } catch (error) {
      callback && callback(error);
    }
  }

  async touch(sid, sessionData, callback) {
    try {
      const client = await getRedisClient();
      if (!client) {
        callback && callback(null);
        return;
      }

      await client.expire(this.getKey(sid), this.getTtl(sessionData));
      callback && callback(null);
    } catch (error) {
      callback && callback(error);
    }
  }
}

function createSessionStore() {
  if (env.redisEnabled) {
    logger.info("session_store_selected", {
      store: "redis",
    });
    return new RedisSessionStore();
  }

  logger.info("session_store_selected", {
    store: "memory",
  });
  return new session.MemoryStore();
}

module.exports = {
  createSessionStore,
};
