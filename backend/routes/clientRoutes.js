const express = require("express");
const controller = require("../controllers/clientController");
const { requireClient } = require("../middleware/clientAuth");
const { singleUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(requireClient);
router.get("/dashboard", controller.getDashboard);
router.get("/payments", controller.getPayments);
router.get("/services", controller.getServices);
router.get("/documents", controller.getDocuments);
router.get("/subscriptions", controller.getSubscriptions);
router.get("/consultations", controller.getConsultations);
router.get("/tickets", controller.getTickets);
router.post("/tickets", controller.createTicket);
router.post("/documents/upload", singleUpload("file"), controller.uploadDocument);

module.exports = router;