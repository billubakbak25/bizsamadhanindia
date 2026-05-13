require("./loadEnv");

const fs = require("fs");
const path = require("path");
const http = require("http");

const { envPath } = require("./loadEnv");
const env = require("./config/env");
const logger = require("./utils/logger");
const { ensureInvoiceDirectory } = require("./services/invoiceService");
const { initializeBackgroundJobs } = require("./services/backgroundJobService");
const { getRedisClient } = require("./infrastructure/redis");
const { createApp } = require("./app");

const app = createApp();
const server = http.createServer(app);

let isShuttingDown = false;
let dependencyWarmupPromise = null;

ensureInvoiceDirectory();

function sanitizeDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    return "<missing>";
  }

  try {
    const parsed = new URL(databaseUrl);
    if (parsed.password) {
      parsed.password = "***";
    }
    return parsed.toString();
  } catch {
    return String(databaseUrl).replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
  }
}

function validateDatabaseUrl(databaseUrl) {
  if (!databaseUrl || !String(databaseUrl).trim()) {
    return {
      ok: false,
      reason: "DATABASE_URL is undefined or empty at runtime.",
      sanitized: "<missing>",
    };
  }

  const trimmed = String(databaseUrl).trim();

  if (!/^postgres(?:ql)?:\/\//i.test(trimmed)) {
    return {
      ok: false,
      reason: "DATABASE_URL must start with postgresql:// or postgres://.",
      sanitized: sanitizeDatabaseUrl(trimmed),
    };
  }

  try {
    const parsed = new URL(trimmed);
    const hasDatabaseName = parsed.pathname && parsed.pathname !== "/";

    if (!parsed.username || !parsed.hostname || !parsed.port || !hasDatabaseName) {
      return {
        ok: false,
        reason: "DATABASE_URL must follow postgresql://user:password@host:port/db.",
        sanitized: sanitizeDatabaseUrl(trimmed),
      };
    }

    return {
      ok: true,
      sanitized: sanitizeDatabaseUrl(trimmed),
    };
  } catch (error) {
    return {
      ok: false,
      reason: `DATABASE_URL is not a valid URL. ${error.message}`,
      sanitized: sanitizeDatabaseUrl(trimmed),
    };
  }
}

function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.warn("server_shutdown_started", { signal });

  server.close((error) => {
    if (error) {
      logger.error("server_shutdown_failed", {
        signal,
        message: error.message,
      });
      process.exit(1);
      return;
    }

    logger.info("server_shutdown_completed", { signal });
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("server_shutdown_forced", { signal });
    process.exit(1);
  }, env.gracefulShutdownTimeoutMs).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
  logger.error("uncaught_exception", {
    message: error.message,
    stack: error.stack,
  });
  shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  logger.error("unhandled_rejection", {
    message: reason && reason.message ? reason.message : String(reason),
    stack: reason && reason.stack ? reason.stack : null,
  });
  shutdown("unhandledRejection");
});

function validateStartupConfiguration() {
  const schemaPath = path.resolve(__dirname, "..", "prisma", "schema.prisma");
  const databaseValidation = validateDatabaseUrl(env.databaseUrl);
  const summary = {
    envPath: envPath || "process.env",
    schemaPath,
    schemaExists: fs.existsSync(schemaPath),
    databaseUrl: databaseValidation.sanitized,
    hasDatabaseUrl: databaseValidation.ok,
  };

  const issues = [];

  if (!summary.schemaExists) {
    issues.push("Prisma schema not found at root prisma/schema.prisma.");
  }

  if (!databaseValidation.ok) {
    issues.push(databaseValidation.reason);
  }

  if (issues.length > 0) {
    logger.error("startup_validation_failed", {
      ...summary,
      issues,
    });
  } else {
    logger.info("startup_validation_passed", summary);
  }

  return {
    isValid: issues.length === 0,
    summary,
    issues,
  };
}

async function warmupDependency(dependency, action, extra = {}) {
  try {
    await action();
    logger.info("dependency_ready", {
      dependency,
      ...extra,
    });
    return true;
  } catch (error) {
    logger.error("dependency_warmup_failed", {
      dependency,
      message: error.message,
      stack: error.stack,
      ...extra,
    });
    return false;
  }
}

async function warmDependencies(validation) {
  if (dependencyWarmupPromise) {
    return dependencyWarmupPromise;
  }

  dependencyWarmupPromise = (async () => {
    await warmupDependency(
      "prisma",
      async () => {
        const { ensurePrismaConnection } = require("./lib/prisma");
        await ensurePrismaConnection();
      },
      {
        envPath: validation.summary.envPath,
        schemaPath: validation.summary.schemaPath,
        databaseUrl: validation.summary.databaseUrl,
      }
    );

    await warmupDependency(
      "redis",
      async () => {
        await getRedisClient();
      },
      {
        enabled: env.redisEnabled,
      }
    );

    await warmupDependency(
      "background_jobs",
      async () => {
        await initializeBackgroundJobs();
      },
      {
        queueEnabled: env.queueEnabled,
      }
    );
  })().catch((error) => {
    dependencyWarmupPromise = null;
    throw error;
  });

  return dependencyWarmupPromise;
}

function bootstrap() {
  const validation = validateStartupConfiguration();

  if (!validation.isValid) {
    process.exit(1);
    return;
  }

  server.keepAliveTimeout = env.keepAliveTimeoutMs;
  server.headersTimeout = env.headersTimeoutMs;
  server.requestTimeout = env.requestTimeoutMs;

  server.listen(env.port, () => {
    logger.info("server_started", {
      port: env.port,
      appUrl: env.appUrl,
      siteUrl: env.siteUrl,
      apiBasePath: `/api/${env.apiVersion}`,
      databaseProvider: "postgresql/prisma",
      redisEnabled: env.redisEnabled,
      queueEnabled: env.queueEnabled,
      storageDriver: env.storageDriver,
      secureCookies: env.secureCookies,
      forceHttps: env.forceHttps,
      envFile: validation.summary.envPath,
      schemaPath: validation.summary.schemaPath,
      databaseUrl: validation.summary.databaseUrl,
    });

    void warmDependencies(validation).catch((error) => {
      logger.error("dependency_warmup_crashed", {
        message: error.message,
        stack: error.stack,
      });
    });
  });
}

bootstrap();
