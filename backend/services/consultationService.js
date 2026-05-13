const AppError = require("../utils/appError");
const consultationRepository = require("../repositories/consultationRepository");

const MODE_SLOTS = {
  call: ["09:30", "11:00", "13:30", "15:00", "17:00"],
  video: ["10:00", "12:00", "14:30", "16:30"],
};

const WEEKEND_SLOTS = {
  call: ["10:00", "11:30", "13:00", "15:00"],
  video: ["10:30", "12:00", "14:00", "16:00"],
};

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeMode(value) {
  const mode = normalizeText(value).toLowerCase();
  return mode === "video" ? "video" : "call";
}

function normalizeDate(value) {
  const raw = normalizeText(value);
  const parsed = raw ? new Date(raw) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function isValidDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(normalizeText(value));
}

function isValidEmail(value) {
  const email = normalizeEmail(value);
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCreatePayload(payload) {
  const name = normalizeText(payload.name);
  const phone = normalizePhone(payload.phone);
  const email = normalizeEmail(payload.email);
  const consultationType = normalizeText(payload.consultationType);
  const service = normalizeText(payload.service);
  const preferredDate = normalizeText(payload.preferredDate);
  const mode = normalizeMode(payload.mode);
  const preferredSlot = normalizeText(payload.preferredSlot);

  if (name.length < 2) {
    throw new AppError("Please enter a valid name.", 400, "VALIDATION_ERROR");
  }

  if (!/^[0-9]{10,15}$/.test(phone)) {
    throw new AppError("Please enter a valid phone number.", 400, "VALIDATION_ERROR");
  }

  if (!isValidEmail(email)) {
    throw new AppError("Please enter a valid email address.", 400, "VALIDATION_ERROR");
  }

  if (consultationType.length < 2) {
    throw new AppError("Please select a consultation type.", 400, "VALIDATION_ERROR");
  }

  if (service.length < 2) {
    throw new AppError("Please select a service.", 400, "VALIDATION_ERROR");
  }

  if (!isValidDateString(preferredDate)) {
    throw new AppError("Please choose a valid preferred date.", 400, "VALIDATION_ERROR");
  }

  if (preferredSlot && !/^\d{2}:\d{2}$/.test(preferredSlot)) {
    throw new AppError("Please choose a valid preferred slot.", 400, "VALIDATION_ERROR");
  }

  return {
    name,
    phone,
    email: email || null,
    consultationType,
    service,
    preferredDate,
    preferredSlot: preferredSlot || null,
    mode,
    notes: normalizeText(payload.notes || "") || null,
    source: normalizeText(payload.source || "website") || "website",
    status: normalizeText(payload.status || "new").toLowerCase() || "new",
  };
}

function buildSlotDate(dateValue, timeValue) {
  return new Date(`${dateValue}T${timeValue}:00+05:30`).toISOString();
}

function addMinutes(isoString, minutes) {
  return new Date(new Date(isoString).getTime() + minutes * 60 * 1000).toISOString();
}

function buildSlotLabel(timeValue) {
  const [hours, minutes] = timeValue.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

function getTemplateSlots(preferredDate, mode) {
  const date = normalizeDate(preferredDate);
  const day = date.getDay();
  const baseSlots = day === 0 || day === 6 ? WEEKEND_SLOTS : MODE_SLOTS;
  return (baseSlots[mode] || MODE_SLOTS.call).map((slot) => {
    const startAt = buildSlotDate(formatDateOnly(date), slot);
    return {
      slot,
      label: buildSlotLabel(slot),
      startAt,
      endAt: addMinutes(startAt, 45),
      available: true,
      mode,
    };
  });
}

function getMockSlots({ date, service, mode, consultationType }) {
  const normalizedDate = isValidDateString(date) ? date : formatDateOnly(new Date());
  const normalizedMode = normalizeMode(mode);
  return {
    date: normalizedDate,
    service: normalizeText(service) || "General Legal Consultation",
    mode: normalizedMode,
    consultationType: normalizeText(consultationType) || "general",
    source: "mock",
    slots: getTemplateSlots(normalizedDate, normalizedMode).map((slot, index) => ({
      ...slot,
      id: `${normalizedDate}-${normalizedMode}-${index}`,
    })),
  };
}

async function createConsultationRequest(payload) {
  const data = validateCreatePayload(payload);
  const record = await consultationRepository.createRequest(data);

  return {
    message: "Consultation request submitted successfully.",
    data: record,
  };
}

async function listAvailableSlots(query = {}) {
  return getMockSlots({
    date: query.date || query.preferredDate,
    service: query.service,
    mode: query.mode,
    consultationType: query.consultationType,
  });
}

async function listConsultationRequests(filters = {}) {
  return consultationRepository.listRequests(filters);
}

module.exports = {
  createConsultationRequest,
  listAvailableSlots,
  listConsultationRequests,
};
