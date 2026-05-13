const multer = require("multer");
const AppError = require("../utils/appError");
const env = require("../config/env");

const allowedMimeTypes = new Set(env.allowedUploadMimeTypes);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxUploadSizeBytes,
    files: 1,
  },
  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError(`Invalid file type. Allowed types: ${Array.from(allowedMimeTypes).join(", ")}`, 400, "INVALID_FILE_TYPE"));
      return;
    }

    callback(null, true);
  },
});

function singleUpload(fieldName = "file") {
  return function uploadMiddleware(req, res, next) {
    upload.single(fieldName)(req, res, (error) => {
      if (!error) {
        next();
        return;
      }

      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        next(new AppError(`File too large. Max ${env.maxUploadSizeBytes} bytes allowed.`, 400, "FILE_TOO_LARGE"));
        return;
      }

      next(error);
    });
  };
}

module.exports = {
  singleUpload,
};
