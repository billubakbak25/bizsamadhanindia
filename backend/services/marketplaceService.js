const crypto = require("crypto");
const AppError = require("../utils/appError");
const referralRepository = require("../repositories/referralRepository");
const clientRepository = require("../repositories/clientRepository");
const partnerApplicationRepository = require("../repositories/partnerApplicationRepository");
const { getPackageCatalog, getToolDefaults, getCatalogSummary } = require("../config/marketplaceCatalog");

function now() {
  return new Date().toISOString();
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function mergeNotes(...parts) {
  return parts
    .map((part) => normalizeText(part))
    .filter(Boolean)
    .join(" | ") || null;
}

function buildReferralSummary(referrals = []) {
  return referrals.reduce(
    (acc, referral) => {
      const status = String(referral.status || "").toLowerCase();
      acc.total += 1;
      if (status === "converted") {
        acc.converted += 1;
      } else if (status === "pending") {
        acc.pending += 1;
      }
      acc.rewardTotal += Number(referral.rewardAmount || 0);
      return acc;
    },
    {
      total: 0,
      converted: 0,
      pending: 0,
      rewardTotal: 0,
    }
  );
}

function mapReferralRow(row) {
  return {
    id: row.id,
    referrerUserId: row.referrer_user_id,
    referredUserId: row.referred_user_id,
    referralCode: row.referral_code,
    status: row.status,
    rewardAmount: Number(row.reward_amount || 0),
    rewardStatus: row.reward_status,
    rewardedAt: row.rewarded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateApplicationCode() {
  return `PART-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

const marketplaceService = {
  async getPartnerDashboard(code) {
    const normalizedCode = normalizeText(code).toUpperCase();

    if (!normalizedCode) {
      return {
        lookupStatus: "missing",
        partner: null,
        referrals: [],
        summary: buildReferralSummary([]),
        packages: getPackageCatalog(),
        tools: getToolDefaults(),
      };
    }

    const referralCode = await referralRepository.findCodeByReferralCode(normalizedCode);

    if (!referralCode) {
      return {
        lookupStatus: "not_found",
        partner: null,
        referrals: [],
        summary: buildReferralSummary([]),
        packages: getPackageCatalog(),
        tools: getToolDefaults(),
      };
    }

    const client = await clientRepository.findById(referralCode.user_id).catch(() => null);
    const referrals = (await referralRepository.listByReferrerUserId(referralCode.user_id)).map(mapReferralRow);
    const summary = buildReferralSummary(referrals);

    return {
      lookupStatus: "found",
      partner: {
        code: referralCode.referral_code,
        userId: referralCode.user_id,
        name: client ? client.name : `Partner ${String(referralCode.user_id).slice(-4)}`,
        email: client ? client.email : null,
        phone: client ? client.phone : null,
        status: "active",
        totalReferrals: summary.total,
        convertedReferrals: summary.converted,
        pendingReferrals: summary.pending,
        rewardTotal: summary.rewardTotal,
      },
      referrals,
      summary,
      packages: getPackageCatalog(),
      tools: getToolDefaults(),
      updatedAt: now(),
    };
  },

  async applyPartner(payload = {}) {
    const name = normalizeText(payload.name);
    const email = normalizeEmail(payload.email);
    const phone = normalizePhone(payload.phone);
    const companyName = normalizeText(payload.companyName || payload.businessName || "");
    const city = normalizeText(payload.city || "");
    const message = normalizeText(payload.message || payload.notes || "");

    if (!name || name.length < 2) {
      throw new AppError("Partner name is required.", 400, "VALIDATION_ERROR");
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError("A valid email address is required.", 400, "VALIDATION_ERROR");
    }

    if (!/^[0-9]{10,15}$/.test(phone)) {
      throw new AppError("A valid phone number is required.", 400, "VALIDATION_ERROR");
    }

    const applicationCode = generateApplicationCode();
    const timestamp = now();
    const application = await partnerApplicationRepository.create({
      applicationCode,
      name,
      email,
      phone,
      companyName: companyName || null,
      focusArea: normalizeText(payload.focusArea || companyName || "") || null,
      experienceLevel: normalizeText(payload.experienceLevel || "") || null,
      notes: mergeNotes(city ? `City: ${city}` : "", message ? `Message: ${message}` : "", payload.notes),
      referralCode: normalizeText(payload.referralCode || "").toUpperCase() || null,
      source: normalizeText(payload.source || "website"),
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return {
      application,
      message: "Partner interest captured successfully.",
      nextStep: "Our team will review the application and reach out with the partner setup flow.",
    };
  },

  async listPackages() {
    const items = getPackageCatalog();
    return {
      items,
      summary: getCatalogSummary(),
    };
  },

  async getToolDefaults() {
    const items = getToolDefaults();
    return {
      items,
      summary: {
        total: items.length,
      },
    };
  },
};

module.exports = marketplaceService;
