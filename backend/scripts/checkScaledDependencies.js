require("../loadEnv");

const systemRepository = require("../repositories/systemRepository");
const Redis = require("ioredis");
const env = require("../config/env");

async function checkPostgres() {
  if (!env.databaseUrl) {
    return { ok: false, reason: "DATABASE_URL is not configured" };
  }

  return systemRepository.pingDatabase();
}

async function checkRedis() {
  if (!env.redisEnabled || !env.redisUrl) {
    return { skipped: true, reason: "Redis is not enabled" };
  }

  const client = new Redis(env.redisUrl, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  try {
    await client.connect();
    const pong = await client.ping();
    return { ok: pong === "PONG" };
  } finally {
    client.disconnect();
  }
}

(async () => {
  try {
    const [postgres, redis] = await Promise.all([checkPostgres(), checkRedis()]);
    console.log(JSON.stringify({
      envFile: process.env.ENV_FILE || "backend/.env",
      postgres,
      redis,
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      envFile: process.env.ENV_FILE || "backend/.env",
      ok: false,
      message: error.message,
    }, null, 2));
    process.exit(1);
  }
})();
