const env = require("../config/env");
const logger = require("../utils/logger");
const followUpService = require("./followUpService");
const postPaymentService = require("./postPaymentService");
const whatsappBotService = require("./whatsappBotService");
const { enqueue, registerWorker } = require("../infrastructure/queue");

let localTimer = null;
let queueSchedulerTimer = null;

async function processDueJob(data = {}) {
  return followUpService.processDue(data.referenceTime || new Date().toISOString());
}

async function registerQueueWorkers() {
  await registerWorker(
    env.followUpQueueName,
    async (job) => {
      if (job.name === "followup.process_due") {
        return processDueJob(job.data);
      }
      return null;
    },
    { concurrency: env.followUpWorkerConcurrency }
  );

  await registerWorker(
    env.paymentQueueName,
    async (job) => {
      if (job.name === "payment.post_process") {
        return postPaymentService.processPostPayment(job.data);
      }
      return null;
    },
    { concurrency: env.paymentWorkerConcurrency }
  );

  await registerWorker(
    env.whatsappQueueName,
    async (job) => {
      if (job.name === "whatsapp.inbound_message") {
        return whatsappBotService.processIncomingMessage(job.data.message);
      }
      return null;
    },
    { concurrency: env.whatsappWorkerConcurrency }
  );
}

function startQueueScheduler() {
  if (queueSchedulerTimer) {
    return;
  }

  queueSchedulerTimer = setInterval(async () => {
    try {
      await enqueue(
        env.followUpQueueName,
        "followup.process_due",
        { referenceTime: new Date().toISOString() },
        {
          jobId: `followup-process-${Math.floor(Date.now() / env.followUpPollIntervalMs)}`,
        }
      );
    } catch (error) {
      logger.error("followup_enqueue_failed", {
        message: error.message,
      });
    }
  }, env.followUpPollIntervalMs);

  queueSchedulerTimer.unref();
}

async function initializeBackgroundJobs(options = {}) {
  const includeWorkers = options.includeWorkers !== undefined ? options.includeWorkers : env.queueInlineWorkers;
  const includeScheduler = options.includeScheduler !== undefined ? options.includeScheduler : true;

  if (env.queueEnabled) {
    if (includeWorkers) {
      await registerQueueWorkers();
    }

    if (includeScheduler) {
      startQueueScheduler();
    }

    logger.info("background_jobs_initialized", {
      mode: includeWorkers ? "queue_workers_enabled" : "queue_scheduler_only",
      followUpQueueName: env.followUpQueueName,
      paymentQueueName: env.paymentQueueName,
      whatsappQueueName: env.whatsappQueueName,
      schedulerEnabled: includeScheduler,
    });
    return;
  }

  if (!localTimer) {
    localTimer = setInterval(async () => {
      try {
        await processDueJob({ referenceTime: new Date().toISOString() });
      } catch (error) {
        logger.error("followup_poll_failed", {
          message: error.message,
        });
      }
    }, env.followUpPollIntervalMs);
    localTimer.unref();
  }

  logger.info("background_jobs_initialized", {
    mode: "local_timer",
    intervalMs: env.followUpPollIntervalMs,
  });
}

module.exports = {
  initializeBackgroundJobs,
};
