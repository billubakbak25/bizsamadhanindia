const { prisma } = require("../lib/prisma");
const { mapRecord, mapRecords, buildFieldMap } = require("./prismaMapper");

const DOCUMENT_FIELD_MAP = buildFieldMap([
  ["id", "id"],
  ["clientId", "client_id"],
  ["folderName", "folder_name"],
  ["documentType", "document_type"],
  ["fileName", "file_name"],
  ["originalName", "original_name"],
  ["filePath", "file_path"],
  ["fileUrl", "file_url"],
  ["mimeType", "mime_type"],
  ["size", "size"],
  ["uploadedByUserId", "uploaded_by_user_id"],
  ["uploadedByRole", "uploaded_by_role"],
  ["uploadedAt", "uploaded_at"],
  ["reviewStatus", "review_status"],
  ["reviewedAt", "reviewed_at"],
  ["reviewedByUserId", "reviewed_by_user_id"],
  ["reviewedByRole", "reviewed_by_role"],
  ["createdAt", "created_at"],
  ["updatedAt", "updated_at"],
]);

async function create({ clientId, folderName = "general", documentType, fileName, originalName, filePath, fileUrl, mimeType, size, uploadedByUserId = null, uploadedByRole = null, uploadedAt }) {
  const timestamp = uploadedAt || new Date().toISOString();
  const record = await prisma.document.create({
    data: {
      clientId: Number(clientId),
      folderName,
      documentType,
      fileName,
      originalName,
      filePath,
      fileUrl,
      mimeType,
      size: size === null || size === undefined || size === "" ? null : Number(size),
      uploadedByUserId: uploadedByUserId === null || uploadedByUserId === undefined || uploadedByUserId === "" ? null : Number(uploadedByUserId),
      uploadedByRole,
      uploadedAt: timestamp,
      reviewStatus: "pending_review",
      reviewedAt: null,
      reviewedByUserId: null,
      reviewedByRole: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  });

  return mapRecord(record, DOCUMENT_FIELD_MAP);
}

async function findById(id) {
  const record = await prisma.document.findUnique({
    where: { id: Number(id) },
  });

  return mapRecord(record, DOCUMENT_FIELD_MAP);
}

async function updateReviewStatus({ id, reviewStatus, reviewedAt, reviewedByUserId = null, reviewedByRole = null }) {
  const timestamp = new Date().toISOString();
  await prisma.document.updateMany({
    where: { id: Number(id) },
    data: {
      reviewStatus,
      reviewedAt,
      reviewedByUserId: reviewedByUserId === null || reviewedByUserId === undefined || reviewedByUserId === "" ? null : Number(reviewedByUserId),
      reviewedByRole,
      updatedAt: timestamp,
    },
  });

  return findById(id);
}

async function listFoldersByClientId(clientId) {
  const records = await prisma.document.findMany({
    where: { clientId: Number(clientId) },
    select: {
      folderName: true,
      uploadedAt: true,
      id: true,
    },
    orderBy: [{ folderName: "asc" }, { uploadedAt: "desc" }, { id: "desc" }],
  });

  const grouped = new Map();

  records.forEach((record) => {
    const current = grouped.get(record.folderName) || { folder_name: record.folderName, total_documents: 0, last_uploaded_at: null };
    current.total_documents += 1;
    if (!current.last_uploaded_at || new Date(record.uploadedAt).getTime() > new Date(current.last_uploaded_at).getTime()) {
      current.last_uploaded_at = record.uploadedAt;
    }
    grouped.set(record.folderName, current);
  });

  return Array.from(grouped.values());
}

async function listByClientIdAndFolder(clientId, folderName) {
  const records = await prisma.document.findMany({
    where: {
      clientId: Number(clientId),
      folderName: String(folderName),
    },
    orderBy: [{ uploadedAt: "desc" }, { id: "desc" }],
  });

  return mapRecords(records, DOCUMENT_FIELD_MAP);
}

async function listByClientId(clientId) {
  const records = await prisma.document.findMany({
    where: { clientId: Number(clientId) },
    orderBy: [{ uploadedAt: "desc" }, { id: "desc" }],
  });

  return mapRecords(records, DOCUMENT_FIELD_MAP);
}

module.exports = {
  create,
  findById,
  updateReviewStatus,
  listFoldersByClientId,
  listByClientIdAndFolder,
  listByClientId,
};
