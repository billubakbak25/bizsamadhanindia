const express = require("express");
const controller = require("../controllers/adminConsoleController");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAdmin);

router.get("/overview", controller.getOverview);
router.get("/referrals", controller.listReferrals);
router.get("/addons", controller.listAddons);
router.get("/vault/documents", controller.listVaultDocuments);
router.get("/vault/folders", controller.listVaultFolders);
router.get("/clients", controller.listClients);
router.get("/tickets", controller.listSupportTickets);
router.post("/tickets/:ticketId/status", controller.updateSupportTicketStatus);
router.get("/workflow-instances", controller.listWorkflowInstances);
router.get("/followups", controller.listFollowUps);
router.get("/consultations", controller.listConsultations);

module.exports = router;
