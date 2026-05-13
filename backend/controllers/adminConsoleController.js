const asyncHandler = require("../utils/asyncHandler");
const adminConsoleService = require("../services/adminConsoleService");

exports.getOverview = asyncHandler(async (req, res) => {
  const data = await adminConsoleService.getOverviewCounts();
  res.json({ success: true, data });
});

exports.listReferrals = asyncHandler(async (req, res) => {
  const data = await adminConsoleService.listReferrals(req.query);
  res.json({ success: true, data });
});

exports.listAddons = asyncHandler(async (req, res) => {
  const data = await adminConsoleService.listAddons(req.query);
  res.json({ success: true, data });
});

exports.listVaultDocuments = asyncHandler(async (req, res) => {
  const data = await adminConsoleService.listVaultDocuments(req.query);
  res.json({ success: true, data });
});

exports.listVaultFolders = asyncHandler(async (req, res) => {
  const data = await adminConsoleService.listVaultFolders(req.query);
  res.json({ success: true, data });
});

exports.listSupportTickets = asyncHandler(async (req, res) => {
  const data = await adminConsoleService.listSupportTickets(req.query);
  res.json({ success: true, data });
});

exports.updateSupportTicketStatus = asyncHandler(async (req, res) => {
  const data = await adminConsoleService.updateSupportTicketStatus(req.params.ticketId, req.body);
  res.json({ success: true, message: "Support ticket updated successfully.", data });
});

exports.listClients = asyncHandler(async (req, res) => {
  const data = await adminConsoleService.listClients(req.query);
  res.json({ success: true, data });
});

exports.listWorkflowInstances = asyncHandler(async (req, res) => {
  const data = await adminConsoleService.listWorkflowInstances(req.query);
  res.json({ success: true, data });
});

exports.listFollowUps = asyncHandler(async (req, res) => {
  const data = await adminConsoleService.listFollowUps(req.query);
  res.json({ success: true, data });
});

exports.listConsultations = asyncHandler(async (req, res) => {
  const data = await adminConsoleService.listConsultations(req.query);
  res.json({ success: true, data });
});
