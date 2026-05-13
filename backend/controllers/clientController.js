const asyncHandler = require("../utils/asyncHandler");
const { saveClientDocument } = require("../services/fileService");
const AppError = require("../utils/appError");
const clientPortalService = require("../services/clientPortalService");
const clientRepository = require("../repositories/clientRepository");

exports.getDashboard = asyncHandler(async (req, res) => {
  const data = await clientPortalService.getDashboard(req.client);
  res.json({ success: true, data });
});

exports.getPayments = asyncHandler(async (req, res) => {
  const data = await clientPortalService.getPayments(req.client);
  res.json({ success: true, data });
});

exports.getServices = asyncHandler(async (req, res) => {
  const data = await clientPortalService.getServices(req.client);
  res.json({ success: true, data });
});

exports.getDocuments = asyncHandler(async (req, res) => {
  const data = await clientPortalService.getDocuments(req.client);
  res.json({ success: true, data });
});

exports.getSubscriptions = asyncHandler(async (req, res) => {
  const data = await clientPortalService.getSubscriptions(req.client, req.query);
  res.json({ success: true, data });
});

exports.getConsultations = asyncHandler(async (req, res) => {
  const data = await clientPortalService.getConsultations(req.client, req.query);
  res.json({ success: true, data });
});

exports.getTickets = asyncHandler(async (req, res) => {
  const data = await clientPortalService.getTickets(req.client, req.query);
  res.json({ success: true, data });
});

exports.createTicket = asyncHandler(async (req, res) => {
  const ticket = await clientPortalService.createTicket(req.client, req.body);
  res.status(201).json({
    success: true,
    message: "Support ticket created successfully.",
    data: ticket,
  });
});

exports.uploadDocument = asyncHandler(async (req, res) => {
  const targetClientId = Number(req.body.client_id || req.client.id);

  if (targetClientId !== req.client.id) {
    throw new AppError("Forbidden.", 403, "FORBIDDEN");
  }

  const client = await clientRepository.findById(targetClientId);

  if (!client) {
    throw new AppError("Client not found.", 404, "CLIENT_NOT_FOUND");
  }

  const result = await saveClientDocument({
    clientId: client.id,
    file: req.file,
    documentType: req.body.document_type || "general",
    serviceCode: req.body.service_code || req.body.serviceCode || "",
  });

  res.status(201).json({
    success: true,
    message: "Document uploaded successfully.",
    data: result,
  });
});