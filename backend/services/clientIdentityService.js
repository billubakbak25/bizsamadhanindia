const clientRepository = require("../repositories/clientRepository");
const { normalizeEmail } = require("../lib/otp");

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function buildNameFromEmail(email) {
  const localPart = normalizeEmail(email).split("@")[0] || "client";
  const cleaned = localPart.replace(/[._-]+/g, " ").trim();

  if (!cleaned) {
    return "Client";
  }

  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildNameFromPhone(phone) {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return "Client";
  }

  return `Client ${String(normalizedPhone).slice(-4)}`;
}

function isPlaceholderClientName(name) {
  return /^Client\s+\d{4}$/i.test(String(name || "").trim());
}

function resolveClientName({ name, email, phone, existingClient = null }) {
  const explicitName = String(name || "").trim();
  if (explicitName) {
    return explicitName;
  }

  if (existingClient && existingClient.name && !isPlaceholderClientName(existingClient.name)) {
    return existingClient.name;
  }

  const normalizedEmail = normalizeEmail(email || "");
  if (normalizedEmail) {
    return buildNameFromEmail(normalizedEmail);
  }

  return buildNameFromPhone(phone);
}

async function upsertClientIdentity({ phone = null, name = "", email = "" } = {}) {
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email || "");

  let existingClient = null;

  if (normalizedPhone) {
    existingClient = await clientRepository.findByPhone(normalizedPhone);
  }

  if (!existingClient && normalizedEmail) {
    existingClient = await clientRepository.findByEmail(normalizedEmail);
  }

  const resolvedName = resolveClientName({
    name,
    email: normalizedEmail,
    phone: normalizedPhone,
    existingClient,
  });

  if (existingClient) {
    return clientRepository.updateById(existingClient.id, {
      ...(normalizedPhone ? { phone: normalizedPhone } : {}),
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      name: resolvedName,
      role: existingClient.role || "client",
      updatedAt: new Date().toISOString(),
    });
  }

  return clientRepository.create({
    phone: normalizedPhone || null,
    name: resolvedName,
    email: normalizedEmail || null,
    role: "client",
  });
}

async function upsertClientByPhone(phone) {
  return upsertClientIdentity({ phone });
}

async function upsertClientByEmail(email) {
  return upsertClientIdentity({ email });
}

module.exports = {
  upsertClientIdentity,
  upsertClientByPhone,
  upsertClientByEmail,
  normalizePhone,
};