const asyncHandler = require("../utils/asyncHandler");
const consultationService = require("../services/consultationService");

exports.getAvailableSlots = asyncHandler(async (req, res) => {
  const data = await consultationService.listAvailableSlots(req.query);
  res.json({ success: true, data });
});

exports.createRequest = asyncHandler(async (req, res) => {
  const result = await consultationService.createConsultationRequest(req.body);
  res.status(201).json({ success: true, ...result });
});

exports.listAdminRequests = asyncHandler(async (req, res) => {
  const data = await consultationService.listConsultationRequests(req.query);
  res.json({ success: true, data });
});
