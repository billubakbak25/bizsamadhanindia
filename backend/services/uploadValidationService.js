const path = require("path");

const DEFAULT_DOCUMENT_RULES = {
  GST_REGISTRATION: [
    { key: "pan_card", label: "PAN Card", required: true, mimeTypes: ["application/pdf", "image/jpeg", "image/png"] },
    { key: "aadhaar_card", label: "Aadhaar Card", required: true, mimeTypes: ["application/pdf", "image/jpeg", "image/png"] },
    { key: "business_proof", label: "Business Proof", required: true, mimeTypes: ["application/pdf", "image/jpeg", "image/png"] },
  ],
  ITR_FILING: [
    { key: "pan_card", label: "PAN Card", required: true, mimeTypes: ["application/pdf", "image/jpeg", "image/png"] },
    { key: "form_16", label: "Form 16", required: true, mimeTypes: ["application/pdf"] },
    { key: "bank_statement", label: "Bank Statement", required: false, mimeTypes: ["application/pdf"] },
  ],
};

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeDocKey(value) {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function getExtension(fileName) {
  return path.extname(String(fileName || "")).toLowerCase();
}

class UploadValidationService {
  constructor(documentRules = DEFAULT_DOCUMENT_RULES) {
    this.documentRules = documentRules;
  }

  getRules(serviceCode) {
    return this.documentRules[normalizeText(serviceCode)] || [];
  }

  validateUploadedDocument(file, rule) {
    const issues = [];

    if (!file) {
      issues.push({
        code: "MISSING_FILE",
        message: `${rule.label} is missing.`,
      });

      return {
        valid: false,
        issues,
      };
    }

    const mimeType = normalizeText(file.mimetype);
    const originalName = normalizeText(file.originalname);

    if (!rule.mimeTypes.includes(mimeType)) {
      issues.push({
        code: "INVALID_FILE_TYPE",
        message: `${rule.label} must be one of: ${rule.mimeTypes.join(", ")}.`,
      });
    }

    if (!originalName || !getExtension(originalName)) {
      issues.push({
        code: "INVALID_FILE_NAME",
        message: `${rule.label} has an invalid file name.`,
      });
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  validate(serviceCode, uploadedFiles) {
    const rules = this.getRules(serviceCode);

    if (!rules.length) {
      return {
        valid: true,
        summary: {
          missingDocuments: [],
          invalidDocuments: [],
          acceptedDocuments: [],
        },
        feedback: [],
      };
    }

    const filesByKey = new Map();

    for (const file of uploadedFiles || []) {
      filesByKey.set(normalizeDocKey(file.fieldname || file.documentKey || file.document_type), file);
    }

    const missingDocuments = [];
    const invalidDocuments = [];
    const acceptedDocuments = [];
    const feedback = [];

    for (const rule of rules) {
      const key = normalizeDocKey(rule.key);
      const file = filesByKey.get(key);

      if (!file && rule.required) {
        missingDocuments.push(rule.key);
        feedback.push({
          field: rule.key,
          status: "missing",
          message: `${rule.label} is required.`,
        });
        continue;
      }

      if (!file) {
        continue;
      }

      const validation = this.validateUploadedDocument(file, rule);

      if (!validation.valid) {
        invalidDocuments.push({
          key: rule.key,
          issues: validation.issues,
        });

        for (const issue of validation.issues) {
          feedback.push({
            field: rule.key,
            status: "invalid",
            code: issue.code,
            message: issue.message,
          });
        }

        continue;
      }

      acceptedDocuments.push({
        key: rule.key,
        label: rule.label,
        fileName: file.originalname,
        mimeType: file.mimetype,
      });

      feedback.push({
        field: rule.key,
        status: "accepted",
        message: `${rule.label} uploaded successfully.`,
      });
    }

    return {
      valid: missingDocuments.length === 0 && invalidDocuments.length === 0,
      summary: {
        missingDocuments,
        invalidDocuments,
        acceptedDocuments,
      },
      feedback,
    };
  }
}

module.exports = new UploadValidationService();
