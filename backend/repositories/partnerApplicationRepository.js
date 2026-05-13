const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const PARTNER_APPLICATION_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["applicationCode", "application_code"],
  ["name", "name"],
  ["email", "email"],
  ["phone", "phone"],
  ["companyName", "company_name"],
  ["focusArea", "focus_area"],
  ["experienceLevel", "experience_level"],
  ["notes", "notes"],
  ["referralCode", "referral_code"],
  ["source", "source"],
  ["status", "status"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

async function create({
  applicationCode,
  name,
  email,
  phone,
  companyName = null,
  focusArea = null,
  experienceLevel = null,
  notes = null,
  referralCode = null,
  source = "website",
  createdAt,
  updatedAt,
}) {
  const record = await prisma.partnerApplication.create({
    data: {
      applicationCode,
      name,
      email,
      phone,
      companyName,
      focusArea,
      experienceLevel,
      notes,
      referralCode,
      source,
      status: "new",
      createdAt,
      updatedAt,
    },
  });

  return mapRecord(record, PARTNER_APPLICATION_FIELD_MAP);
}

async function listRecent(limit = 10) {
  const records = await prisma.partnerApplication.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: Math.min(Number(limit) || 10, 50),
  });

  return mapRecords(records, PARTNER_APPLICATION_FIELD_MAP);
}

async function findByApplicationCode(applicationCode) {
  const record = await prisma.partnerApplication.findUnique({
    where: { applicationCode: String(applicationCode) },
  });

  return mapRecord(record, PARTNER_APPLICATION_FIELD_MAP);
}

module.exports = {
  create,
  listRecent,
  findByApplicationCode,
};
