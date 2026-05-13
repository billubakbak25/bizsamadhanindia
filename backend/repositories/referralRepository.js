const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const REFERRAL_CODE_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["userId", "user_id"],
  ["referralCode", "referral_code"],
  ["isActive", "is_active"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

const REFERRAL_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["referrerUserId", "referrer_user_id"],
  ["referredUserId", "referred_user_id"],
  ["referralCode", "referral_code"],
  ["status", "status"],
  ["rewardAmount", "reward_amount"],
  ["rewardStatus", "reward_status"],
  ["rewardedAt", "rewarded_at"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

async function findCodeByUserId(userId) {
  const record = await prisma.referralCode.findFirst({
    where: {
      userId: String(userId),
      isActive: 1,
    },
  });

  return mapRecord(record, REFERRAL_CODE_FIELD_MAP);
}

async function findCodeByReferralCode(referralCode) {
  const record = await prisma.referralCode.findFirst({
    where: {
      referralCode: String(referralCode),
      isActive: 1,
    },
  });

  return mapRecord(record, REFERRAL_CODE_FIELD_MAP);
}

async function createCode({ userId, referralCode, createdAt, updatedAt }) {
  const record = await prisma.referralCode.create({
    data: {
      userId: String(userId),
      referralCode,
      isActive: 1,
      createdAt,
      updatedAt,
    },
  });

  return mapRecord(record, REFERRAL_CODE_FIELD_MAP);
}

async function updateClientReferralCode(userId, referralCode, updatedAt) {
  const result = await prisma.client.updateMany({
    where: { id: Number(userId) },
    data: {
      referralCode,
      updatedAt,
    },
  });

  return { changes: result.count };
}

async function findReferralByReferredUserId(referredUserId) {
  const record = await prisma.referral.findUnique({
    where: { referredUserId: String(referredUserId) },
  });

  return mapRecord(record, REFERRAL_FIELD_MAP);
}

async function createReferral({ referrerUserId, referredUserId, referralCode, createdAt, updatedAt }) {
  const record = await prisma.referral.create({
    data: {
      referrerUserId: String(referrerUserId),
      referredUserId: String(referredUserId),
      referralCode,
      status: "pending",
      rewardAmount: 0,
      rewardStatus: "pending",
      rewardedAt: null,
      createdAt,
      updatedAt,
    },
  });

  return mapRecord(record, REFERRAL_FIELD_MAP);
}

async function updateReferralReward(id, rewardAmount, rewardedAt, updatedAt) {
  await prisma.referral.updateMany({
    where: { id: Number(id) },
    data: {
      status: "converted",
      rewardAmount: Number(rewardAmount) || 0,
      rewardStatus: "rewarded",
      rewardedAt,
      updatedAt,
    },
  });

  const record = await prisma.referral.findUnique({ where: { id: Number(id) } });
  return mapRecord(record, REFERRAL_FIELD_MAP);
}

async function listByReferrerUserId(userId) {
  const records = await prisma.referral.findMany({
    where: { referrerUserId: String(userId) },
    orderBy: { createdAt: "desc" },
  });

  return mapRecords(records, REFERRAL_FIELD_MAP);
}

module.exports = {
  findCodeByUserId,
  findCodeByReferralCode,
  createCode,
  updateClientReferralCode,
  findReferralByReferredUserId,
  createReferral,
  updateReferralReward,
  listByReferrerUserId,
};
