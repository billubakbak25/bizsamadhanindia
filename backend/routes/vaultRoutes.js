const express = require("express");
const { vaultService } = require("../services/platform/platformService");
const asyncHandler = require("../utils/asyncHandler");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAdmin);

router.post("/clients/:clientId/documents", asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await vaultService.createMetadata({ clientId: Number(req.params.clientId), ...req.body }, { userId: req.session && req.session.isAdmin ? "admin" : null, role: "admin" }) });
}));
router.get("/clients/:clientId/folders", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await vaultService.listFolders(Number(req.params.clientId)) });
}));
router.get("/clients/:clientId/documents", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await vaultService.listDocuments(Number(req.params.clientId), req.query.folderName) });
}));
router.post("/documents/:id/review", asyncHandler(async (req, res) => {
  const actor = {
    userId: req.session && req.session.admin && req.session.admin.username ? req.session.admin.username : "admin",
    role: "admin",
  };
  res.json({ success: true, message: "Document review status updated successfully.", data: await vaultService.updateDocumentReview(Number(req.params.id), req.body, actor) });
}));
router.get("/documents/:id", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await vaultService.getDocument(Number(req.params.id)) });
}));

module.exports = router;
