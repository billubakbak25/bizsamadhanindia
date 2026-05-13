const AppError = require("../utils/appError");
const leadRepository = require("../repositories/leadRepository");
const crmService = require("./crmService");

async function createLead(payload) {
  return crmService.createLead(payload);
}

async function listAdminLeads(filters) {
  return crmService.listLeads(filters);
}

async function deleteLead(id) {
  const result = await leadRepository.removeById(id);

  if (result.changes === 0) {
    throw new AppError("Lead not found.", 404, "LEAD_NOT_FOUND");
  }

  return {
    message: "Lead deleted successfully.",
  };
}

module.exports = {
  createLead,
  listAdminLeads,
  deleteLead,
};
