const express = require("express");
const controller = require("../controllers/crmController");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAdmin);

router.get("/pipeline", controller.getPipelineOverview);
router.get("/leads", controller.listLeads);
router.post("/leads", controller.createLead);
router.patch("/leads/:id", controller.updateLead);
router.post("/leads/:id/qualify", controller.qualifyLead);
router.post("/leads/:id/convert", controller.convertLead);
router.get("/leads/:id/status", controller.getLeadStatus);
router.post("/leads/:id/follow-ups", controller.scheduleFollowUps);
router.get("/clients/:clientId/status", controller.getClientStatus);
router.post("/clients/:clientId/services", controller.createClientService);
router.get("/tasks", controller.listTasks);
router.post("/tasks", controller.createTask);
router.patch("/tasks/:id/status", controller.updateTaskStatus);
router.get("/follow-ups", controller.listFollowUps);

module.exports = router;
