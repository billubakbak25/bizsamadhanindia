const express = require("express");
const controller = require("../controllers/consultationController");
const { leadRateLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.get("/slots", controller.getAvailableSlots);
router.post("/requests", leadRateLimiter, controller.createRequest);
router.post("/", leadRateLimiter, controller.createRequest);

module.exports = router;
