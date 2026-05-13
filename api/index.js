const { ready } = require("../backend/db");
const { createApp } = require("../backend/app");

const app = createApp();
let bootPromise = null;

async function ensureBoot() {
  if (!bootPromise) {
    bootPromise = ready;
  }

  return bootPromise;
}

module.exports = async (req, res) => {
  await ensureBoot();
  return app(req, res);
};
