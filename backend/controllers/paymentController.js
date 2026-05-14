const asyncHandler = require("../utils/asyncHandler");
const paymentService = require("../services/paymentService");

exports.createOrder = asyncHandler(async (req, res) => {
  console.log("REQUEST BODY:", req.body);

  try {
    const result = await paymentService.createOrderForPayment(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error && (error.statusCode === 400 || error.code === "INVALID_SERVICE" || error.code === "VALIDATION_ERROR")) {
      res.status(400).json({
        error: "Invalid request",
        received: req.body,
      });
      return;
    }

    throw error;
  }
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.verifyPayment(req.body);
  res.json(result);
});

exports.getPaymentDetails = asyncHandler(async (req, res) => {
  const result = await paymentService.getPaymentDetails(req.params.orderId);
  res.json(result);
});

exports.getSupportedPaymentMethods = asyncHandler(async (req, res) => {
  const result = await paymentService.getSupportedPaymentMethods();
  res.json({ success: true, data: result });
});
