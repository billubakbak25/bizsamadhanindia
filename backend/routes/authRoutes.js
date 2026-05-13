const express = require("express");
const controller = require("../controllers/authController");

const router = express.Router();

router.post("/send-otp-email", controller.sendOtpEmail);
router.post("/verify-otp-email", controller.verifyOtpEmail);

module.exports = router;
