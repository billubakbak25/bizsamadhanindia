const fs = require("fs");
const path = require("path");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const env = require("../config/env");
const logger = require("../utils/logger");

let s3Client = null;

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sanitizeSegment(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getS3Client() {
  if (env.storageDriver !== "s3") {
    return null;
  }

  if (!env.s3Bucket || !env.s3AccessKeyId || !env.s3SecretAccessKey) {
    logger.warn("storage_s3_incomplete_config", {
      bucketConfigured: Boolean(env.s3Bucket),
      endpointConfigured: Boolean(env.s3Endpoint),
    });
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: env.s3Region,
      endpoint: env.s3Endpoint || undefined,
      forcePathStyle: env.s3ForcePathStyle,
      credentials: {
        accessKeyId: env.s3AccessKeyId,
        secretAccessKey: env.s3SecretAccessKey,
      },
    });
  }

  return s3Client;
}

function buildPublicUrl(key) {
  if (env.storagePublicBaseUrl) {
    return `${env.storagePublicBaseUrl.replace(/\/$/, "")}/${key}`;
  }

  if (env.s3Endpoint && env.s3Bucket) {
    return `${env.s3Endpoint.replace(/\/$/, "")}/${env.s3Bucket}/${key}`;
  }

  return `${env.appUrl}/client-uploads/${key}`;
}

async function saveFile({ buffer, contentType, clientId, originalName }) {
  const extension = path.extname(originalName || "") || ".bin";
  const baseName = sanitizeSegment(path.basename(originalName || "file", extension));
  const key = `${sanitizeSegment(clientId)}/${Date.now()}_${baseName}${extension}`;
  const client = getS3Client();

  if (client) {
    await client.send(new PutObjectCommand({
      Bucket: env.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || "application/octet-stream",
    }));

    return {
      storage: "s3",
      key,
      filePath: key,
      fileUrl: buildPublicUrl(key),
    };
  }

  const safeClientId = sanitizeSegment(clientId);
  const clientDirectory = path.join(env.uploadPath, safeClientId);
  ensureDirectory(clientDirectory);
  const fileName = path.basename(key);
  const filePath = path.join(clientDirectory, fileName);

  await fs.promises.writeFile(filePath, buffer);

  return {
    storage: "local",
    key,
    filePath,
    fileUrl: `${env.appUrl}/client-uploads/${safeClientId}/${encodeURIComponent(fileName)}`,
  };
}

module.exports = {
  saveFile,
};
