require("../loadEnv");

const http = require("http");
const https = require("https");
const env = require("../config/env");

const target = process.env.HEALTHCHECK_URL || `${env.appUrl}/health`;
const client = target.startsWith("https://") ? https : http;

const request = client.get(target, (response) => {
  if (response.statusCode && response.statusCode >= 200 && response.statusCode < 400) {
    process.exit(0);
    return;
  }

  process.exit(1);
});

request.on("error", () => {
  process.exit(1);
});

request.setTimeout(5000, () => {
  request.destroy();
  process.exit(1);
});
