const { Queue, Worker } = require("bullmq");
const env = require("../config/env");
const logger = require("../utils/logger");
const { getRedisClient } = require("./redis");

const queueCache = new Map();
const workerCache = new Map();

async function getQueue(name) {
  if (!env.queueEnabled) {
    return null;
  }

  if (queueCache.has(name)) {
    return queueCache.get(name);
  }

  const connection = await getRedisClient();
  if (!connection) {
    logger.warn("queue_disabled_no_redis", { name });
    return null;
  }

  const queue = new Queue(name, {
    connection,
    prefix: env.queuePrefix,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });
  queueCache.set(name, queue);
  return queue;
}

async function enqueue(queueName, jobName, data, options = {}) {
  const queue = await getQueue(queueName);
  if (!queue) {
    return null;
  }

  return queue.add(jobName, data, options);
}

async function registerWorker(queueName, processor, options = {}) {
  if (!env.queueEnabled || !env.queueInlineWorkers) {
    return null;
  }

  if (workerCache.has(queueName)) {
    return workerCache.get(queueName);
  }

  const connection = await getRedisClient();
  if (!connection) {
    return null;
  }

  const worker = new Worker(queueName, processor, {
    connection,
    prefix: env.queuePrefix,
    concurrency: Number(options.concurrency || 1),
  });

  worker.on("completed", (job) => {
    logger.info("queue_job_completed", {
      queueName,
      jobName: job.name,
      jobId: job.id,
    });
  });

  worker.on("failed", (job, error) => {
    logger.error("queue_job_failed", {
      queueName,
      jobName: job ? job.name : "unknown",
      jobId: job ? job.id : null,
      message: error.message,
    });
  });

  workerCache.set(queueName, worker);
  logger.info("queue_worker_started", { queueName });
  return worker;
}

module.exports = {
  getQueue,
  enqueue,
  registerWorker,
};
