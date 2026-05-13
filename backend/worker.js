require("./loadEnv");

const env = require("./config/env");
const logger = require("./utils/logger");
const { getRedisClient } = require("./infrastructure/redis");
const { initializeBackgroundJobs } = require("./services/backgroundJobService");
const { ensurePrismaConnection } = require("./lib/prisma");

async function bootstrapWorker() {
  await ensurePrismaConnection();
  await getRedisClient();
  await initializeBackgroundJobs({
    includeWorkers: true,
    includeScheduler: false,
  });

  logger.info("worker_started", {
    databaseProvider: "postgresql/prisma",
    apiBasePath: `/api/${env.apiVersion}`,
    redisEnabled: env.redisEnabled,
    queueEnabled: env.queueEnabled,
    paymentQueueName: env.paymentQueueName,
    followUpQueueName: env.followUpQueueName,
    whatsappQueueName: env.whatsappQueueName,
    envFile: process.env.ENV_FILE || "backend/.env",
  });

  setInterval(() => {}, 60 * 60 * 1000);
}

bootstrapWorker().catch((error) => {
  logger.error("worker_boot_failed", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
