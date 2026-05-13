const { PrismaClient } = require("@prisma/client");
require("../loadEnv");
const env = require("../config/env");

const MAX_CONNECT_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 1000;

const globalCache = globalThis;
let prismaClient = globalCache.__bizsamadhanPrisma || null;
let connectionPromise = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createPrismaClient() {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required. PostgreSQL via Prisma is the only supported database configuration.");
  }

  if (!/^postgres(?:ql)?:\/\//i.test(env.databaseUrl)) {
    throw new Error("DATABASE_URL must start with postgresql:// or postgres://.");
  }

  return new PrismaClient({
    log: env.nodeEnv === "development" ? ["warn", "error"] : ["error"],
  });
}

function getPrismaClient() {
  if (!prismaClient) {
    prismaClient = createPrismaClient();

    if (env.nodeEnv !== "production") {
      globalCache.__bizsamadhanPrisma = prismaClient;
    }
  }

  return prismaClient;
}

async function connectWithRetry() {
  let lastError = null;
  const client = getPrismaClient();

  for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt += 1) {
    try {
      await client.$connect();
      console.log("prisma_connected", { attempt });
      return client;
    } catch (error) {
      lastError = error;
      console.error("prisma_connection_failed", {
        attempt,
        maxAttempts: MAX_CONNECT_ATTEMPTS,
        message: error.message,
      });

      if (attempt < MAX_CONNECT_ATTEMPTS) {
        await sleep(BASE_RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError;
}

async function ensurePrismaConnection() {
  if (!connectionPromise) {
    connectionPromise = connectWithRetry().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  return connectionPromise;
}

async function getDatabaseHealth() {
  try {
    const client = await ensurePrismaConnection();
    await client.$queryRawUnsafe("SELECT 1");

    return {
      ok: true,
      status: "ok",
      message: "Database connection healthy.",
    };
  } catch (error) {
    return {
      ok: false,
      status: "error",
      message: error.message,
    };
  }
}

const prisma = new Proxy({}, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = client[property];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

module.exports = {
  prisma,
  ensurePrismaConnection,
  getDatabaseHealth,
};
