const express = require("express");
const paymentController = require("../controllers/paymentController");
const { leadRateLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/create-order", leadRateLimiter, paymentController.createOrder);
router.post("/verify-payment", paymentController.verifyPayment);
router.get("/payment-details/:orderId", paymentController.getPaymentDetails);

module.exports = router;
