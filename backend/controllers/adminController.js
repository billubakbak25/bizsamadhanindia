const asyncHandler = require("../utils/asyncHandler");
const adminService = require("../services/adminService");

exports.login = asyncHandler(async (req, res) => {
  const result = adminService.login(req, req.body);
  res.json(result);
});

exports.logout = asyncHandler(async (req, res) => {
  const result = await adminService.logout(req);
  res.json(result);
});

exports.getSession = asyncHandler(async (req, res) => {
  const result = adminService.getSession(req);
  res.json(result);
});
