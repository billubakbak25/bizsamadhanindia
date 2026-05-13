const fs = require("fs");
const path = require("path");
const env = require("../config/env");

if (!fs.existsSync(env.logsPath)) {
  fs.mkdirSync(env.logsPath, { recursive: true });
}

function write(level, event, meta = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...meta,
  };

  const line = `${JSON.stringify(payload)}\n`;
  const filePath = path.join(env.logsPath, level === "error" ? "errors.log" : "app.log");

  try {
    fs.appendFileSync(filePath, line);
  } catch (error) {
    console.error("[LOGGER] Failed to write log file", error.message);
  }

  if (level === "error") {
    console.error(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
}

module.exports = {
  info(event, meta = {}) {
    write("info", event, meta);
  },
  warn(event, meta = {}) {
    write("warn", event, meta);
  },
  error(event, meta = {}) {
    write("error", event, meta);
  },
};
