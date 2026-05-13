const followUpRepository = require("../repositories/followUpRepository");
const leadRepository = require("../repositories/leadRepository");
const { mapRecord, mapRecords, buildFieldMap } = require("../repositories/prismaMapper");
const AppError = require("../utils/appError");

const FOLLOW_UP_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["leadId", "lead_id"],
  ["stepKey", "step_key"],
  ["scheduledFor", "scheduled_for"],
  ["status", "status"],
  ["channel", "channel"],
  ["message", "message"],
  ["sentAt", "sent_at"],
  ["cancelledReason", "cancelled_reason"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

const FOLLOW_UP_STEPS = [
  { stepKey: "reminder_10m", offsetMs: 10 * 60 * 1000, message: "10 minute reminder follow-up." },
  { stepKey: "reminder_1h", offsetMs: 60 * 60 * 1000, message: "1 hour reminder follow-up." },
  { stepKey: "reminder_24h", offsetMs: 24 * 60 * 60 * 1000, message: "24 hour reminder follow-up." },
];

function now() {
  return new Date().toISOString();
}

async function scheduleForLead(leadId, baseTime) {
  const lead = await leadRepository.findById(leadId);

  if (!lead) {
    throw new AppError("Lead not found.", 404, "LEAD_NOT_FOUND");
  }

  if (lead.status === "converted") {
    throw new AppError("Lead already converted. Follow-ups not scheduled.", 409, "LEAD_CONVERTED");
  }

  const anchor = baseTime ? new Date(baseTime).getTime() : Date.now();
  const rows = [];

  for (const step of FOLLOW_UP_STEPS) {
    const timestamp = now();
    const record = await followUpRepository.create({
      leadId: Number(lead.id),
      stepKey: step.stepKey,
      scheduledFor: new Date(anchor + step.offsetMs).toISOString(),
      status: "scheduled",
      channel: "whatsapp",
      message: step.message,
      sentAt: null,
      cancelledReason: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    rows.push(mapRecord(record, FOLLOW_UP_FIELD_MAP));
  }

  return rows;
}

async function stopOnConversion(leadId) {
  const lead = await leadRepository.findById(leadId);

  if (!lead) {
    throw new AppError("Lead not found.", 404, "LEAD_NOT_FOUND");
  }

  const timestamp = now();
  await leadRepository.updateById(lead.id, {
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    service: lead.service,
    message: lead.message,
    status: "converted",
    notes: lead.notes,
    updatedAt: timestamp,
  });

  await followUpRepository.updateMany(
    {
      leadId: Number(lead.id),
      status: "scheduled",
    },
    {
      status: "cancelled",
      cancelledReason: "lead_converted",
      updatedAt: timestamp,
    }
  );

  const records = await followUpRepository.findMany({
    where: { leadId: Number(lead.id) },
    orderBy: { scheduledFor: "asc" },
  });

  return mapRecords(records, FOLLOW_UP_FIELD_MAP);
}

async function listByLead(leadId) {
  const records = await followUpRepository.findMany({
    where: { leadId: Number(leadId) },
    orderBy: { scheduledFor: "asc" },
  });

  return mapRecords(records, FOLLOW_UP_FIELD_MAP);
}

async function processDue(referenceTime) {
  const dueRows = await followUpRepository.findMany({
    where: {
      status: "scheduled",
      scheduledFor: {
        lte: referenceTime || now(),
      },
    },
    orderBy: { scheduledFor: "asc" },
  });

  const processed = [];

  for (const row of dueRows) {
    const lead = await leadRepository.findById(row.leadId);
    const timestamp = now();

    if (lead && lead.status === "converted") {
      await followUpRepository.updateMany(
        { id: Number(row.id) },
        {
          status: "cancelled",
          cancelledReason: "lead_converted",
          updatedAt: timestamp,
        }
      );
    } else {
      await followUpRepository.updateMany(
        { id: Number(row.id) },
        {
          status: "sent",
          sentAt: timestamp,
          updatedAt: timestamp,
        }
      );
    }

    const updated = await followUpRepository.findUnique({ where: { id: Number(row.id) } });
    processed.push(mapRecord(updated, FOLLOW_UP_FIELD_MAP));
  }

  return processed;
}

module.exports = {
  scheduleForLead,
  stopOnConversion,
  listByLead,
  processDue,
};
