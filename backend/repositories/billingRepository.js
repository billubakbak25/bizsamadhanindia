const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const BILLING_PLAN_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["planCode", "plan_code"],
  ["planName", "plan_name"],
  ["intervalUnit", "interval_unit"],
  ["intervalCount", "interval_count"],
  ["amount", "amount"],
  ["currency", "currency"],
  ["reminderDaysBefore", "reminder_days_before"],
  ["isActive", "is_active"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

const SUBSCRIPTION_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["clientId", "client_id"],
  ["planCode", "plan_code"],
  ["status", "status"],
  ["currentPeriodStart", "current_period_start"],
  ["currentPeriodEnd", "current_period_end"],
  ["lastRenewedAt", "last_renewed_at"],
  ["nextRenewalAt", "next_renewal_at"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

const BILLING_RENEWAL_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["subscriptionId", "subscription_id"],
  ["renewalDueAt", "renewal_due_at"],
  ["renewedAt", "renewed_at"],
  ["status", "status"],
  ["amount", "amount"],
  ["currency", "currency"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

const BILLING_REMINDER_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["subscriptionId", "subscription_id"],
  ["renewalId", "renewal_id"],
  ["remindAt", "remind_at"],
  ["sentAt", "sent_at"],
  ["status", "status"],
  ["channel", "channel"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

async function createPlan({ planCode, planName, intervalUnit, intervalCount, amount, currency, reminderDaysBefore, createdAt, updatedAt }) {
  const record = await prisma.billingPlan.create({
    data: {
      planCode,
      planName,
      intervalUnit,
      intervalCount: Number(intervalCount),
      amount: Number(amount),
      currency,
      reminderDaysBefore: Number(reminderDaysBefore),
      isActive: 1,
      createdAt,
      updatedAt,
    },
  });

  return mapRecord(record, BILLING_PLAN_FIELD_MAP);
}

async function listPlans() {
  const records = await prisma.billingPlan.findMany({
    where: { isActive: 1 },
    orderBy: { createdAt: "desc" },
  });

  return mapRecords(records, BILLING_PLAN_FIELD_MAP);
}

async function findActivePlanByCode(planCode) {
  const record = await prisma.billingPlan.findFirst({
    where: { planCode, isActive: 1 },
  });

  return mapRecord(record, BILLING_PLAN_FIELD_MAP);
}

async function findPlanByCode(planCode) {
  const record = await prisma.billingPlan.findUnique({
    where: { planCode },
  });

  return mapRecord(record, BILLING_PLAN_FIELD_MAP);
}

async function createSubscription({ clientId, planCode, startAt, currentPeriodEnd, createdAt, updatedAt }) {
  const record = await prisma.subscription.create({
    data: {
      clientId: Number(clientId),
      planCode,
      status: "active",
      currentPeriodStart: startAt,
      currentPeriodEnd,
      lastRenewedAt: null,
      nextRenewalAt: currentPeriodEnd,
      createdAt,
      updatedAt,
    },
  });

  return mapRecord(record, SUBSCRIPTION_FIELD_MAP);
}

async function listSubscriptions(filters = {}) {
  const records = await prisma.subscription.findMany({
    where: {
      ...(filters.clientId ? { clientId: Number(filters.clientId) } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return mapRecords(records, SUBSCRIPTION_FIELD_MAP);
}

async function findSubscriptionById(id) {
  const record = await prisma.subscription.findUnique({
    where: { id: Number(id) },
  });

  return mapRecord(record, SUBSCRIPTION_FIELD_MAP);
}

async function updateSubscriptionRenewal({ id, nextPeriodStart, nextPeriodEnd, renewedAt, updatedAt }) {
  await prisma.subscription.updateMany({
    where: { id: Number(id) },
    data: {
      currentPeriodStart: nextPeriodStart,
      currentPeriodEnd: nextPeriodEnd,
      lastRenewedAt: renewedAt,
      nextRenewalAt: nextPeriodEnd,
      updatedAt,
    },
  });

  return findSubscriptionById(id);
}

async function createRenewal({ subscriptionId, renewalDueAt, amount, currency, createdAt, updatedAt }) {
  const record = await prisma.billingRenewal.create({
    data: {
      subscriptionId: Number(subscriptionId),
      renewalDueAt,
      renewedAt: null,
      status: "pending",
      amount: Number(amount),
      currency,
      createdAt,
      updatedAt,
    },
  });

  return mapRecord(record, BILLING_RENEWAL_FIELD_MAP);
}

async function findPendingRenewalBySubscriptionId(subscriptionId) {
  const record = await prisma.billingRenewal.findFirst({
    where: {
      subscriptionId: Number(subscriptionId),
      status: "pending",
    },
    orderBy: { renewalDueAt: "asc" },
  });

  return mapRecord(record, BILLING_RENEWAL_FIELD_MAP);
}

async function completeRenewal(id, renewedAt, updatedAt) {
  await prisma.billingRenewal.updateMany({
    where: { id: Number(id) },
    data: {
      renewedAt,
      status: "completed",
      updatedAt,
    },
  });

  return prisma.billingRenewal.findUnique({ where: { id: Number(id) } }).then((record) => mapRecord(record, BILLING_RENEWAL_FIELD_MAP));
}

async function createReminder({ subscriptionId, renewalId, remindAt, channel, createdAt, updatedAt }) {
  const record = await prisma.billingReminder.create({
    data: {
      subscriptionId: Number(subscriptionId),
      renewalId: Number(renewalId),
      remindAt,
      sentAt: null,
      status: "scheduled",
      channel,
      createdAt,
      updatedAt,
    },
  });

  return mapRecord(record, BILLING_REMINDER_FIELD_MAP);
}

async function listDueReminders(referenceTime) {
  const records = await prisma.billingReminder.findMany({
    where: {
      status: "scheduled",
      remindAt: { lte: referenceTime },
    },
    orderBy: { remindAt: "asc" },
  });

  return mapRecords(records, BILLING_REMINDER_FIELD_MAP);
}

async function markReminderSent(id, sentAt, updatedAt) {
  await prisma.billingReminder.updateMany({
    where: { id: Number(id) },
    data: {
      sentAt,
      status: "sent",
      updatedAt,
    },
  });

  const record = await prisma.billingReminder.findUnique({ where: { id: Number(id) } });
  return mapRecord(record, BILLING_REMINDER_FIELD_MAP);
}

module.exports = {
  createPlan,
  listPlans,
  findActivePlanByCode,
  findPlanByCode,
  createSubscription,
  listSubscriptions,
  findSubscriptionById,
  updateSubscriptionRenewal,
  createRenewal,
  findPendingRenewalBySubscriptionId,
  completeRenewal,
  createReminder,
  listDueReminders,
  markReminderSent,
};
