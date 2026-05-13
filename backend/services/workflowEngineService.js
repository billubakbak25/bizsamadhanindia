const crypto = require("crypto");
const logger = require("../utils/logger");
const { enqueue, registerWorker } = require("../infrastructure/queue");

const WORKFLOW_QUEUE_NAME = "workflow-events";

const EVENT_TYPES = Object.freeze({
  SERVICE_CREATED: "SERVICE_CREATED",
  TASK_CREATED: "TASK_CREATED",
  TASK_COMPLETED: "TASK_COMPLETED",
  STATUS_UPDATED: "STATUS_UPDATED",
  DOCUMENT_UPLOADED: "DOCUMENT_UPLOADED",
});

const handlers = new Map();
let workerRegistered = false;

function now() {
  return new Date().toISOString();
}

function normalizeEventType(eventType) {
  return String(eventType || "").trim().toUpperCase();
}

function registerWorkflowHandler(eventType, handler) {
  handlers.set(normalizeEventType(eventType), handler);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWithRetry(handler, event, options = {}) {
  const maxAttempts = Math.max(1, Number(options.maxAttempts || 3));
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await handler(event, { ...options, attempt, maxAttempts });
    } catch (error) {
      lastError = error;
      logger.warn("workflow_event_attempt_failed", {
        eventType: event.type,
        eventId: event.id,
        attempt,
        maxAttempts,
        message: error.message,
      });

      if (attempt < maxAttempts) {
        const backoffMs = Math.min(1000 * 2 ** (attempt - 1), 8000);
        await sleep(backoffMs);
      }
    }
  }

  throw lastError;
}

async function processWorkflowEvent(event, options = {}) {
  const normalizedType = normalizeEventType(event.type);
  const handler = handlers.get(normalizedType);

  if (!handler) {
    logger.debug("workflow_event_skipped_no_handler", {
      eventType: normalizedType,
      eventId: event.id,
    });
    return null;
  }

  return runWithRetry(handler, { ...event, type: normalizedType }, options);
}

async function publishWorkflowEvent(eventType, payload = {}, options = {}) {
  const event = {
    id: options.eventId || crypto.randomUUID(),
    type: normalizeEventType(eventType),
    payload,
    source: options.source || "system",
    metadata: options.metadata || {},
    createdAt: options.createdAt || now(),
  };

  if (options.defer === true) {
    await enqueue(
      WORKFLOW_QUEUE_NAME,
      event.type,
      { event },
      {
        attempts: Math.max(1, Number(options.maxAttempts || 3)),
        backoff: { type: "exponential", delay: 1000 },
      }
    );
    return event;
  }

  return processWorkflowEvent(event, options);
}

async function bootstrapWorkflowEngine() {
  if (workerRegistered) {
    return null;
  }

  workerRegistered = true;

  return registerWorker(
    WORKFLOW_QUEUE_NAME,
    async (job) => {
      const event = job && job.data ? job.data.event || job.data : null;

      if (!event || !event.type) {
        return null;
      }

      return processWorkflowEvent(event, {
        source: "queue",
        maxAttempts: Number(job && job.opts && job.opts.attempts || 3),
      });
    },
    { concurrency: 1 }
  );
}

module.exports = {
  EVENT_TYPES,
  WORKFLOW_QUEUE_NAME,
  bootstrapWorkflowEngine,
  processWorkflowEvent,
  publishWorkflowEvent,
  registerWorkflowHandler,
};
