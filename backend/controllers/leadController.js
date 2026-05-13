const asyncHandler = require("../utils/asyncHandler");
const leadService = require("../services/leadService");

exports.createLead = asyncHandler(async (req, res) => {
  console.log("REQUEST BODY:", req.body);

  try {
    const result = await leadService.createLead(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error && (error.statusCode === 400 || error.code === "VALIDATION_ERROR" || error.code === "INVALID_SERVICE")) {
      res.status(400).json({
        error: "Invalid request",
        received: req.body,
      });
      return;
    }

    throw error;
  }
});

exports.listAdminLeads = asyncHandler(async (req, res) => {
  const result = await leadService.listAdminLeads(req.query);
  res.json(result);
});

exports.deleteLead = asyncHandler(async (req, res) => {
  const result = await leadService.deleteLead(req.params.id);
  res.json(result);
});