const env = require("../config/env");
const AppError = require("../utils/appError");
const uploadValidationService = require("./uploadValidationService");
const documentRepository = require("../repositories/documentRepository");
const objectStorage = require("../infrastructure/objectStorage");

function sanitize(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
}

function toValidationServiceCode(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

async function saveClientDocument({ clientId, file, documentType = "general", serviceCode = "", folderName = "general" }) {
  if (!file) {
    throw new AppError("File is required.", 400, "FILE_REQUIRED");
  }

  const validation = uploadValidationService.validate(toValidationServiceCode(serviceCode), [
    {
      ...file,
      documentKey: documentType,
      fieldname: documentType,
    },
  ]);

  if (!validation.valid && validation.summary.invalidDocuments.length > 0) {
    const firstIssue = validation.summary.invalidDocuments[0].issues[0];
    throw new AppError(firstIssue.message, 400, firstIssue.code || "INVALID_DOCUMENT");
  }

  const savedFile = await objectStorage.saveFile({
    buffer: file.buffer,
    contentType: file.mimetype,
    clientId: sanitize(clientId),
    originalName: file.originalname,
  });

  const now = new Date().toISOString();

  await documentRepository.create({
    clientId,
    folderName: sanitize(folderName || serviceCode || "general") || "general",
    documentType,
    fileName: savedFile.key.split("/").pop(),
    originalName: file.originalname,
    filePath: savedFile.filePath,
    fileUrl: savedFile.fileUrl,
    mimeType: file.mimetype,
    size: file.size,
    uploadedByUserId: String(clientId),
    uploadedByRole: "client",
    uploadedAt: now,
  });

  return {
    fileName: savedFile.key.split("/").pop(),
    originalName: file.originalname,
    fileUrl: savedFile.fileUrl,
    mimeType: file.mimetype,
    size: file.size,
    storage: savedFile.storage,
    validation,
  };
}

module.exports = {
  saveClientDocument,
};
