const { prisma } = require("../lib/prisma");

async function pingDatabase() {
  await prisma.$connect();
  return { ok: true };
}

module.exports = {
  pingDatabase,
};
