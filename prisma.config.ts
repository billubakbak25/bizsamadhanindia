import fs from "node:fs";
import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { defineConfig } from "prisma/config";

const candidateEnvPaths = [
  process.env.ENV_FILE ? path.resolve(process.cwd(), process.env.ENV_FILE) : null,
  path.resolve(process.cwd(), "backend/.env"),
  path.resolve(process.cwd(), ".env"),
].filter((value): value is string => Boolean(value));

const resolvedEnvPath = candidateEnvPaths.find((filePath) => fs.existsSync(filePath));

if (resolvedEnvPath) {
  loadDotenv({ path: resolvedEnvPath });
}

export default defineConfig({
  schema: path.resolve(process.cwd(), "prisma/schema.prisma"),
  migrations: {
    path: path.resolve(process.cwd(), "prisma/migrations"),
  },
});
