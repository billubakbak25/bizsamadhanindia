const asyncHandler = require("../utils/asyncHandler");
const crmService = require("../services/crmService");

exports.listLeads = asyncHandler(async (req, res) => {
  const data = await crmService.listLeads(req.query);
  res.json({ success: true, data });
});

exports.createLead = asyncHandler(async (req, res) => {
  const data = await crmService.createLead(req.body);
  res.status(201).json({ success: true, data });
});

exports.updateLead = asyncHandler(async (req, res) => {
  const data = await crmService.updateLead(req.params.id, req.body);
  res.json({ success: true, data });
});

exports.qualifyLead = asyncHandler(async (req, res) => {
  const data = await crmService.qualifyLead(req.params.id, req.body);
  res.json({ success: true, data });
});

exports.convertLead = asyncHandler(async (req, res) => {
  const data = await crmService.convertLeadToClient(req.params.id, req.body);
  res.json({ success: true, message: "Lead converted successfully.", data });
});

exports.getLeadStatus = asyncHandler(async (req, res) => {
  const data = await crmService.getLeadStatus(req.params.id);
  res.json({ success: true, data });
});

exports.getPipelineOverview = asyncHandler(async (req, res) => {
  const data = await crmService.getPipelineOverview();
  res.json({ success: true, data });
});

exports.createClientService = asyncHandler(async (req, res) => {
  const data = await crmService.createServiceForClient(req.params.clientId, req.body);
  res.status(201).json({ success: true, data });
});

exports.getClientStatus = asyncHandler(async (req, res) => {
  const data = await crmService.getClientStatus(req.params.clientId);
  res.json({ success: true, data });
});

exports.listTasks = asyncHandler(async (req, res) => {
  const data = await crmService.listTasks(req.query);
  res.json({ success: true, data });
});

exports.createTask = asyncHandler(async (req, res) => {
  const data = await crmService.assignTask(req.body);
  res.status(201).json({ success: true, data });
});

exports.updateTaskStatus = asyncHandler(async (req, res) => {
  const data = await crmService.updateTaskStatus(req.params.id, req.body.status || req.body.nextStatus);
  res.json({ success: true, data });
});

exports.scheduleFollowUps = asyncHandler(async (req, res) => {
  const data = await crmService.scheduleFollowUps(req.params.id, req.body.baseTime);
  res.status(201).json({ success: true, data });
});

exports.listFollowUps = asyncHandler(async (req, res) => {
  const data = await crmService.listFollowUps(req.query.leadId);
  res.json({ success: true, data });
});
