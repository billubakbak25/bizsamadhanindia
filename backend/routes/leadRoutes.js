const express = require("express");
const leadController = require("../controllers/leadController");
const { leadRateLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/leads", leadRateLimiter, leadController.createLead);
router.post("/crm/leads", leadRateLimiter, leadController.createLead);
router.post("/contact", leadRateLimiter, leadController.createLead);
router.post("/enquiry", leadRateLimiter, leadController.createLead);

module.exports = router;