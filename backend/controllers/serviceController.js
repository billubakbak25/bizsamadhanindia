const asyncHandler = require("../utils/asyncHandler");
const serviceService = require("../services/serviceService");

exports.getCategories = asyncHandler(async (req, res) => {
  const data = serviceService.getServiceCategories();
  res.json({ success: true, data });
});

exports.listServices = asyncHandler(async (req, res) => {
  const data = await serviceService.listServices(req.query);
  res.json({ success: true, data });
});

exports.createService = asyncHandler(async (req, res) => {
  const data = await serviceService.createServiceForClient(req.body.clientId, req.body);
  res.status(201).json({ success: true, message: "Service created successfully.", data });
});

exports.getService = asyncHandler(async (req, res) => {
  const data = await serviceService.getService(req.params.id);
  res.json({ success: true, data });
});

exports.updateServiceStatus = asyncHandler(async (req, res) => {
  const data = await serviceService.updateServiceStatus(req.params.id, req.body.status || req.body.nextStatus, req.body);
  res.json({ success: true, message: "Service status updated successfully.", data });
});

exports.uploadDocument = asyncHandler(async (req, res) => {
  const data = await serviceService.uploadServiceDocument(req.params.id, req.body, req.file, {
    userId: req.session && req.session.admin && req.session.admin.username ? req.session.admin.username : null,
    role: "admin",
  });
  res.status(201).json({ success: true, message: "Document uploaded successfully.", data });
});

exports.getTimeline = asyncHandler(async (req, res) => {
  const data = await serviceService.getServiceTimeline(req.params.id);
  res.json({ success: true, data });
});
