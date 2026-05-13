const express = require("express");
const adminController = require("../controllers/adminController");
const leadController = require("../controllers/leadController");
const { requireAdmin } = require("../middleware/auth");
const { adminLoginRateLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/login", adminLoginRateLimiter, adminController.login);
router.post("/logout", adminController.logout);
router.get("/session", adminController.getSession);
router.get("/leads", requireAdmin, leadController.listAdminLeads);
router.delete("/leads/:id", requireAdmin, leadController.deleteLead);

module.exports = router;
