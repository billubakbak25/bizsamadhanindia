const crypto = require("crypto");
const AppError = require("../../utils/appError");
const platformRepository = require("../../repositories/platformRepository");
const leadRepository = require("../../repositories/leadRepository");
const logRepository = require("../../repositories/logRepository");
const addonRepository = require("../../repositories/addonRepository");
const referralRepository = require("../../repositories/referralRepository");
const billingRepository = require("../../repositories/billingRepository");
const taskRepository = require("../../repositories/taskRepository");
const workflowRepository = require("../../repositories/workflowRepository");
const documentRepository = require("../../repositories/documentRepository");
const paymentRepository = require("../../repositories/paymentRepository");
const postPaymentService = require("../postPaymentService");
const workflowEngine = require("../workflowEngineService");

function now() {
  return new Date().toISOString();
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function addInterval(dateValue, intervalUnit, intervalCount) {
  const date = new Date(dateValue);

  if (intervalUnit === "day") {
    date.setDate(date.getDate() + intervalCount);
  } else if (intervalUnit === "month") {
    date.setMonth(date.getMonth() + intervalCount);
  } else if (intervalUnit === "year") {
    date.setFullYear(date.getFullYear() + intervalCount);
  }

  return date.toISOString();
}

async function writeLog(level, event, message, metadata = {}) {
  await logRepository.create({
    level,
    event,
    message,
    entityType: metadata.entity_type || null,
    entityId: metadata.entity_id || null,
    metadata,
    createdAt: now(),
  });
}

const crmService = require("../crmService");

function toPositiveInteger(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  if (typeof max === "number") {
    return Math.min(parsed, max);
  }

  return parsed;
}

function normalizeDateInput(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function buildCreatedAtRange(query = {}) {
  const startDate = normalizeDateInput(query.startDate || query.from || query.start);
  const endDate = normalizeDateInput(query.endDate || query.to || query.end);

  if (!startDate && !endDate) {
    return undefined;
  }

  return {
    ...(startDate ? { gte: startDate } : {}),
    ...(endDate ? { lte: endDate } : {}),
  };
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const metricsService = {
  async getRevenue(query = {}) {
    const createdAt = buildCreatedAtRange(query);
    const paidWhere = {
      status: "paid",
      ...(createdAt ? { createdAt } : {}),
    };

    const [revenueAggregate, paidPayments, pendingPayments, failedPayments] = await Promise.all([
      platformRepository.payment.aggregate({
        where: paidWhere,
        _sum: { amount: true },
      }),
      platformRepository.payment.count({ where: paidWhere }),
      platformRepository.payment.count({
        where: {
          status: "pending",
          ...(createdAt ? { createdAt } : {}),
        },
      }),
      platformRepository.payment.count({
        where: {
          status: { in: ["failed", "signature_failed"] },
          ...(createdAt ? { createdAt } : {}),
        },
      }),
    ]);

    const totalRevenue = toNumber(revenueAggregate && revenueAggregate._sum ? revenueAggregate._sum.amount : 0);
    const averageOrderValue = paidPayments > 0 ? Number((totalRevenue / paidPayments).toFixed(2)) : 0;

    return {
      totalRevenue,
      paidPayments,
      pendingPayments,
      failedPayments,
      averageOrderValue,
      currency: normalizeText(query.currency || "INR").toUpperCase(),
      range: {
        startDate: createdAt ? createdAt.gte || null : null,
        endDate: createdAt ? createdAt.lte || null : null,
      },
    };
  },

  async getConversions() {
    const [totalLeads, contactedLeads, qualifiedLeads, convertedLeads, totalPayments, paidPayments] = await Promise.all([
      leadRepository.countAll(),
      leadRepository.countByStatus("contacted"),
      leadRepository.countByStatus("qualified"),
      leadRepository.countByStatus("converted"),
      platformRepository.payment.count(),
      platformRepository.payment.count({ where: { status: "paid" } }),
    ]);

    const leadConversionRate = totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(2)) : 0;
    const paymentSuccessRate = totalPayments > 0 ? Number(((paidPayments / totalPayments) * 100).toFixed(2)) : 0;

    return {
      totalLeads,
      contactedLeads,
      qualifiedLeads,
      convertedLeads,
      paidPayments,
      leadConversionRate,
      paymentSuccessRate,
    };
  },

  async getPendingWork() {
    const [pendingServices, inProgressServices, activeServices, assignedTasks, blockedTasks, overdueTasks] = await Promise.all([
      platformRepository.service.count({ where: { status: "pending" } }),
      platformRepository.service.count({ where: { status: "in_progress" } }),
      platformRepository.service.count({ where: { status: { in: ["active", "pending", "in_progress"] } } }),
      taskRepository.countByStatus("assigned"),
      taskRepository.countByStatus("blocked"),
      taskRepository.listOverdueTasks(),
    ]);

    return {
      services: {
        pending: pendingServices,
        inProgress: inProgressServices,
        active: activeServices,
      },
      tasks: {
        assigned: assignedTasks,
        blocked: blockedTasks,
        overdue: overdueTasks.length,
      },
      openItems: pendingServices + inProgressServices + assignedTasks + blockedTasks,
    };
  },

  async getTopServices(limit = 5) {
    const normalizedLimit = toPositiveInteger(limit, 5, 20);
    const payments = await platformRepository.payment.findMany({
      select: {
        service: true,
        amount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const serviceMap = new Map();

    payments.forEach((payment) => {
      const serviceName = normalizeText(payment && payment.service);
      if (!serviceName) {
        return;
      }

      const current = serviceMap.get(serviceName) || {
        service: serviceName,
        totalPayments: 0,
        paidPayments: 0,
        revenue: 0,
        latestActivityAt: null,
      };

      current.totalPayments += 1;
      if (payment.status === "paid") {
        current.paidPayments += 1;
        current.revenue += toNumber(payment.amount);
      }

      const activityAt = payment.updatedAt || payment.createdAt || null;
      if (!current.latestActivityAt || (activityAt && new Date(activityAt).getTime() > new Date(current.latestActivityAt).getTime())) {
        current.latestActivityAt = activityAt;
      }

      serviceMap.set(serviceName, current);
    });

    return Array.from(serviceMap.values())
      .sort((left, right) => {
        if (right.revenue !== left.revenue) {
          return right.revenue - left.revenue;
        }

        if (right.paidPayments !== left.paidPayments) {
          return right.paidPayments - left.paidPayments;
        }

        return right.totalPayments - left.totalPayments;
      })
      .slice(0, normalizedLimit);
  },
};

const addonService = {
  async createCatalogItem(payload) {
    const timestamp = now();
    return addonRepository.createCatalogItem({
      serviceCode: normalizeText(payload.serviceCode),
      addonCode: normalizeText(payload.addonCode),
      addonName: normalizeText(payload.addonName),
      description: normalizeText(payload.description || "") || null,
      basePrice: Number(payload.basePrice || 0),
      pricingType: normalizeText(payload.pricingType || "fixed"),
      pricingMetadata: payload.pricingMetadata ? JSON.stringify(payload.pricingMetadata) : null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },

  calculatePrice(item, paymentAmount) {
    const pricingType = item.pricing_type || "fixed";
    const metadata = parseJson(item.pricing_metadata, {});

    if (pricingType === "percent_of_payment") {
      const percentage = Number(metadata.percentage || 0);
      return {
        suggestedPrice: Math.round((Number(paymentAmount || 0) * percentage) / 100),
        pricingReason: `${percentage}% of payment amount applied.`,
      };
    }

    return {
      suggestedPrice: Number(item.base_price || 0),
      pricingReason: "Fixed add-on pricing applied.",
    };
  },

  async suggest(payload) {
    const items = await addonRepository.listCatalogByServiceCode(normalizeText(payload.serviceCode));
    const suggestions = [];

    for (const item of items) {
      const price = this.calculatePrice(item, payload.paymentAmount);
      const timestamp = now();
      suggestions.push(
        await addonRepository.createSuggestion({
          paymentId: normalizeText(payload.paymentId),
          clientId: String(payload.clientId),
          serviceCode: normalizeText(payload.serviceCode),
          addonCode: item.addon_code,
          addonName: item.addon_name,
          suggestedPrice: price.suggestedPrice,
          pricingReason: price.pricingReason,
          status: "suggested",
          createdAt: timestamp,
          updatedAt: timestamp,
        })
      );
    }

    return suggestions;
  },

  async listSuggestions(paymentId) {
    return addonRepository.listSuggestionsByPaymentId(paymentId);
  },

  async updateSuggestionStatus(id, status) {
    const timestamp = now();
    return addonRepository.updateSuggestionStatus(id, status, timestamp, timestamp, timestamp);
  },
};

const referralService = {
  async getOrCreateCode(userId) {
    const existing = await referralRepository.findCodeByUserId(userId);

    if (existing) {
      return existing;
    }

    let code = "";
    let collision = true;
    while (collision) {
      code = `${String(userId).replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "USER"}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      const current = await referralRepository.findCodeByReferralCode(code);
      collision = Boolean(current);
    }

    const timestamp = now();
    const record = await referralRepository.createCode({
      userId,
      referralCode: code,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await referralRepository.updateClientReferralCode(userId, code, timestamp).catch(() => {});
    return record;
  },

  async createReferral(referralCode, referredUserId) {
    const normalizedReferralCode = normalizeText(referralCode).toUpperCase();
    const codeRecord = await referralRepository.findCodeByReferralCode(normalizedReferralCode);

    if (!codeRecord) {
      throw new AppError("Referral code not found.", 404, "REFERRAL_CODE_NOT_FOUND");
    }

    const existing = await referralRepository.findReferralByReferredUserId(referredUserId);

    if (existing) {
      throw new AppError("Referral already tracked for this user.", 409, "REFERRAL_EXISTS");
    }

    const timestamp = now();
    return referralRepository.createReferral({
      referrerUserId: codeRecord.user_id,
      referredUserId: String(referredUserId),
      referralCode: codeRecord.referral_code,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },

  async reward(referredUserId, rewardAmount = 500) {
    const referral = await referralRepository.findReferralByReferredUserId(referredUserId);

    if (!referral) {
      throw new AppError("Referral not found.", 404, "REFERRAL_NOT_FOUND");
    }

    const timestamp = now();
    return referralRepository.updateReferralReward(referral.id, Number(rewardAmount), timestamp, timestamp);
  },

  async list(userId) {
    return referralRepository.listByReferrerUserId(userId);
  },
};

const billingService = {
  async createPlan(payload) {
    const timestamp = now();
    return billingRepository.createPlan({
      planCode: normalizeText(payload.planCode),
      planName: normalizeText(payload.planName),
      intervalUnit: normalizeText(payload.intervalUnit),
      intervalCount: Number(payload.intervalCount || 1),
      amount: Number(payload.amount || 0),
      currency: normalizeText(payload.currency || "INR").toUpperCase(),
      reminderDaysBefore: Number(payload.reminderDaysBefore || 3),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },

  async listPlans() {
    return billingRepository.listPlans();
  },

  async createSubscription(payload) {
    const plan = await billingRepository.findActivePlanByCode(normalizeText(payload.planCode));

    if (!plan) {
      throw new AppError("Billing plan not found.", 404, "PLAN_NOT_FOUND");
    }

    const startAt = payload.startAt ? new Date(payload.startAt).toISOString() : now();
    const currentPeriodEnd = addInterval(startAt, plan.interval_unit, Number(plan.interval_count || 1));
    const timestamp = now();
    const subscription = await billingRepository.createSubscription({
      clientId: String(payload.clientId),
      planCode: plan.plan_code,
      startAt,
      currentPeriodEnd,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    const renewal = await billingRepository.createRenewal({
      subscriptionId: subscription.id,
      renewalDueAt: currentPeriodEnd,
      amount: plan.amount,
      currency: plan.currency,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    const reminderAt = new Date(
      new Date(currentPeriodEnd).getTime() - Number(plan.reminder_days_before || 3) * 24 * 60 * 60 * 1000
    ).toISOString();
    await billingRepository.createReminder({
      subscriptionId: subscription.id,
      renewalId: renewal.id,
      remindAt: reminderAt,
      channel: "whatsapp",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return subscription;
  },

  async listSubscriptions(filters) {
    return billingRepository.listSubscriptions(filters);
  },

  async renew(subscriptionId) {
    const subscription = await billingRepository.findSubscriptionById(subscriptionId);
    if (!subscription) {
      throw new AppError("Subscription not found.", 404, "SUBSCRIPTION_NOT_FOUND");
    }

    const plan = await billingRepository.findPlanByCode(subscription.plan_code);
    const pendingRenewal = await billingRepository.findPendingRenewalBySubscriptionId(subscription.id);
    if (!pendingRenewal) {
      throw new AppError("No pending renewal found.", 404, "RENEWAL_NOT_FOUND");
    }

    const timestamp = now();
    await billingRepository.completeRenewal(pendingRenewal.id, timestamp, timestamp);
    const nextPeriodStart = subscription.next_renewal_at;
    const nextPeriodEnd = addInterval(nextPeriodStart, plan.interval_unit, Number(plan.interval_count || 1));
    await billingRepository.updateSubscriptionRenewal({
      id: subscription.id,
      nextPeriodStart,
      nextPeriodEnd,
      renewedAt: timestamp,
      updatedAt: timestamp,
    });
    const renewal = await billingRepository.createRenewal({
      subscriptionId: subscription.id,
      renewalDueAt: nextPeriodEnd,
      amount: plan.amount,
      currency: plan.currency,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    const reminderAt = new Date(
      new Date(nextPeriodEnd).getTime() - Number(plan.reminder_days_before || 3) * 24 * 60 * 60 * 1000
    ).toISOString();
    await billingRepository.createReminder({
      subscriptionId: subscription.id,
      renewalId: renewal.id,
      remindAt: reminderAt,
      channel: "whatsapp",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return billingRepository.findSubscriptionById(subscription.id);
  },

  async processReminders(referenceTime) {
    const dueRows = await billingRepository.listDueReminders(referenceTime || now());
    const processed = [];

    for (const row of dueRows) {
      const timestamp = now();
      processed.push(await billingRepository.markReminderSent(row.id, timestamp, timestamp));
    }

    return processed;
  },
};

const taskService = {
  async saveMapping(payload) {
    const timestamp = now();
    return taskRepository.upsertMapping({
      serviceCode: normalizeText(payload.serviceCode),
      serviceName: normalizeText(payload.serviceName),
      staffId: normalizeText(payload.staffId),
      staffName: normalizeText(payload.staffName),
      isActive: payload.isActive === false ? 0 : 1,
      timestamp,
    });
  },

  async autoAssign(payload) {
    const mapping = await taskRepository.findActiveMappingByServiceCode(normalizeText(payload.serviceCode));
    if (!mapping) {
      throw new AppError("No active staff mapping found for service.", 404, "SERVICE_MAPPING_NOT_FOUND");
    }

    const timestamp = now();
    const slaDueAt = new Date(Date.now() + Number(payload.slaMinutes || 60) * 60 * 1000).toISOString();
    const task = await taskRepository.createTask({
      clientId: payload.clientId,
      serviceCode: mapping.service_code,
      serviceName: mapping.service_name,
      assignedStaffId: mapping.staff_id,
      assignedStaffName: mapping.staff_name,
      title: normalizeText(payload.title),
      description: normalizeText(payload.description || "") || null,
      priority: normalizeText(payload.priority || "normal"),
      slaDueAt,
      timestamp,
    });

    await workflowEngine.publishWorkflowEvent(
      workflowEngine.EVENT_TYPES.TASK_CREATED,
      {
        serviceId: payload.serviceId || null,
        clientId: payload.clientId,
        serviceCode: mapping.service_code,
        serviceName: mapping.service_name,
        stepCode: payload.stepCode || null,
        task,
      },
      { source: "platform_task_service", metadata: { autoAssigned: true } }
    );

    return task;
  },

  async updateStatus(taskId, status) {
    const timestamp = now();
    const task = await taskRepository.updateTaskStatus(taskId, status, timestamp, timestamp);

    if (String(status || "").toLowerCase() === "completed") {
      await workflowEngine.publishWorkflowEvent(
        workflowEngine.EVENT_TYPES.TASK_COMPLETED,
        {
          task,
          status: "completed",
        },
        { source: "platform_task_service", metadata: { taskId: Number(taskId) } }
      );
    } else {
      await workflowEngine.publishWorkflowEvent(
        workflowEngine.EVENT_TYPES.STATUS_UPDATED,
        {
          task,
          status,
        },
        { source: "platform_task_service", metadata: { taskId: Number(taskId) } }
      );
    }

    return task;
  },

  async list(filters) {
    return taskRepository.listTasks(filters);
  },

  async overdue() {
    return taskRepository.listOverdueTasks();
  },
};

const workflowService = {
  async define(payload) {
    const steps = Array.isArray(payload.steps)
      ? payload.steps.map((step, index) => ({
          code: normalizeText(step.code),
          title: normalizeText(step.title),
          autoProgressOnComplete: step.autoProgressOnComplete !== false,
          required: step.required !== false,
          metadata: step.metadata || {},
          order: index,
        }))
      : [];

    if (!steps.length) {
      throw new AppError("steps array is required.", 400, "VALIDATION_ERROR");
    }

    return workflowRepository.saveDefinition({
      serviceCode: normalizeText(payload.serviceCode),
      serviceName: normalizeText(payload.serviceName),
      stepsJson: JSON.stringify(steps),
      timestamp: now(),
    });
  },

  async start(payload) {
    const serviceRequestId = normalizeText(payload.serviceRequestId);
    const existing = await workflowRepository.findInstanceByServiceRequestId(serviceRequestId);
    if (existing) {
      return {
        ...existing,
        steps: parseJson(existing.steps_json, []),
        context: parseJson(existing.context_json, {}),
      };
    }

    const definition = await workflowRepository.findDefinitionByServiceCode(normalizeText(payload.serviceCode));
    if (!definition) {
      throw new AppError("Workflow definition not found.", 404, "WORKFLOW_NOT_FOUND");
    }

    const timestamp = now();
    const steps = parseJson(definition.steps_json, []).map((step, index) => ({
      ...step,
      status: index === 0 ? "in_progress" : "pending",
      startedAt: index === 0 ? timestamp : null,
      completedAt: null,
      updatedAt: timestamp,
    }));
    const instance = await workflowRepository.createInstance({
      serviceRequestId,
      serviceCode: definition.service_code,
      serviceName: definition.service_name,
      status: "in_progress",
      currentStepCode: steps[0].code,
      contextJson: JSON.stringify(payload.context || {}),
      stepsJson: JSON.stringify(steps),
      timestamp,
    });

    return {
      ...instance,
      steps,
      context: parseJson(instance.context_json, {}),
    };
  },

  async get(serviceRequestId) {
    const instance = await workflowRepository.findInstanceByServiceRequestId(normalizeText(serviceRequestId));
    if (!instance) {
      throw new AppError("Workflow instance not found.", 404, "WORKFLOW_INSTANCE_NOT_FOUND");
    }

    return {
      ...instance,
      steps: parseJson(instance.steps_json, []),
      context: parseJson(instance.context_json, {}),
    };
  },

  async updateStep(payload) {
    const instance = await this.get(payload.serviceRequestId);
    const steps = instance.steps;
    const targetIndex = steps.findIndex((step) => step.code === normalizeText(payload.stepCode));

    if (targetIndex === -1) {
      throw new AppError("Step not found.", 404, "STEP_NOT_FOUND");
    }

    const timestamp = now();
    steps[targetIndex].status = normalizeText(payload.status).toLowerCase();
    steps[targetIndex].updatedAt = timestamp;

    if (steps[targetIndex].status === "completed") {
      steps[targetIndex].completedAt = timestamp;
      const nextStep = steps.find((step, index) => index > targetIndex && step.status === "pending");
      if (nextStep && payload.autoProgress !== false && steps[targetIndex].autoProgressOnComplete !== false) {
        nextStep.status = "in_progress";
        nextStep.startedAt = nextStep.startedAt || timestamp;
        nextStep.updatedAt = timestamp;
      }
    }

    const currentStep = steps.find((step) => step.status === "in_progress");
    const workflowStatus = steps.some((step) => step.status === "blocked")
      ? "blocked"
      : steps.every((step) => ["completed", "skipped"].includes(step.status))
        ? "completed"
        : "in_progress";

    await workflowRepository.updateInstance({
      id: instance.id,
      status: workflowStatus,
      currentStepCode: currentStep ? currentStep.code : null,
      stepsJson: JSON.stringify(steps),
      updatedAt: timestamp,
    });

    return this.get(payload.serviceRequestId);
  },

  async autoProgress(serviceRequestId) {
    const instance = await this.get(serviceRequestId);
    const currentStep = instance.steps.find((step) => step.status === "in_progress");
    if (!currentStep) {
      return instance;
    }
    return this.updateStep({
      serviceRequestId,
      stepCode: currentStep.code,
      status: "completed",
      autoProgress: true,
    });
  },
};

const vaultService = {
  async createMetadata(payload, actor) {
    return documentRepository.create({
      clientId: payload.clientId,
      folderName: normalizeText(payload.folderName || "general"),
      documentType: normalizeText(payload.documentType),
      fileName: normalizeText(payload.fileName),
      originalName: normalizeText(payload.originalName),
      filePath: normalizeText(payload.filePath),
      fileUrl: normalizeText(payload.fileUrl),
      mimeType: normalizeText(payload.mimeType),
      size: Number(payload.size || 0),
      uploadedByUserId: actor.userId || null,
      uploadedByRole: actor.role || null,
      uploadedAt: now(),
    });
  },

  async listFolders(clientId) {
    return documentRepository.listFoldersByClientId(clientId);
  },

  async listDocuments(clientId, folderName) {
    if (folderName) {
      return documentRepository.listByClientIdAndFolder(clientId, folderName);
    }
    return documentRepository.listByClientId(clientId);
  },

  async getDocument(id) {
    const document = await documentRepository.findById(id);
    if (!document) {
      throw new AppError("Document not found.", 404, "DOCUMENT_NOT_FOUND");
    }
    return document;
  },

  async updateDocumentReview(id, payload, actor) {
    const documentId = Number(id);
    if (!Number.isFinite(documentId) || documentId <= 0) {
      throw new AppError("Document not found.", 404, "DOCUMENT_NOT_FOUND");
    }

    const document = await documentRepository.findById(documentId);
    if (!document) {
      throw new AppError("Document not found.", 404, "DOCUMENT_NOT_FOUND");
    }

    const nextStatus = normalizeText(payload.reviewStatus || payload.status).toLowerCase();
    const allowedStatuses = new Set(["pending_review", "in_review", "approved", "needs_changes"]);
    if (!allowedStatuses.has(nextStatus)) {
      throw new AppError("Please choose a valid document review status.", 400, "VALIDATION_ERROR");
    }

    return documentRepository.updateReviewStatus({
      id: documentId,
      reviewStatus: nextStatus,
      reviewedAt: now(),
      reviewedByUserId: actor.userId || null,
      reviewedByRole: actor.role || null,
    });
  },
};

const webhookService = {
  verifySignature(rawBody, signature) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    if (!secret) {
      throw new AppError("Missing Razorpay webhook secret.", 500, "CONFIG_ERROR");
    }
    const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const left = Buffer.from(expectedSignature, "utf8");
    const right = Buffer.from(String(signature || ""), "utf8");
    return left.length === right.length && crypto.timingSafeEqual(left, right);
  },

  async handle(payload, rawBody, signature) {
    if (!this.verifySignature(rawBody, signature)) {
      throw new AppError("Invalid webhook signature.", 401, "INVALID_WEBHOOK_SIGNATURE");
    }

    const event = payload.event || "unknown";
    const payment = payload.payload && payload.payload.payment ? payload.payload.payment.entity || {} : {};
    const orderId = payment.order_id || (payload.payload && payload.payload.order && payload.payload.order.entity ? payload.payload.order.entity.id : null);
    const paymentId = payment.id || null;

    if (!orderId) {
      throw new AppError("Order ID missing in webhook payload.", 400, "INVALID_WEBHOOK_PAYLOAD");
    }

    const status = event === "payment.captured" || event === "order.paid"
      ? "paid"
      : event === "payment.failed"
        ? "failed"
        : "pending";
    const record = await paymentRepository.findByOrderId(orderId);
    if (!record) {
      return { duplicate: false, ignored: true, orderId, event };
    }

    await paymentRepository.updateStatusAndVerification({
      orderId,
      paymentId: paymentId || record.payment_id,
      signature: record.razorpay_signature || null,
      status,
      invoiceNumber: record.invoice_number,
      clientId: record.client_id,
      updatedAt: now(),
    });

    if (status === "paid") {
      await postPaymentService.enqueueOrProcess({ orderId });
    }

    await writeLog("info", "razorpay_webhook_processed", `Webhook ${event} processed`, {
      entity_type: "payment",
      entity_id: String(orderId),
      event,
    });
    return { duplicate: false, ignored: false, orderId, paymentId, status, event };
  },
};

module.exports = {
  crmService,
  metricsService,
  addonService,
  referralService,
  billingService,
  taskService,
  workflowService,
  vaultService,
  webhookService,
};








