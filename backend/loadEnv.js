const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const candidateEnvPaths = [
  process.env.ENV_FILE ? path.resolve(process.cwd(), process.env.ENV_FILE) : null,
  path.join(__dirname, ".env"),
  path.resolve(process.cwd(), ".env"),
].filter(Boolean);

const resolvedEnvPath = candidateEnvPaths.find((filePath) => fs.existsSync(filePath));

if (resolvedEnvPath) {
  dotenv.config({ path: resolvedEnvPath });
} else {
  dotenv.config();
}

module.exports = {
  envPath: resolvedEnvPath || null,
};
