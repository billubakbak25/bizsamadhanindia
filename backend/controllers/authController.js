const asyncHandler = require("../utils/asyncHandler");
const { sendOtpEmailCode, verifyOtpEmailCode } = require("../services/authService");

exports.sendOtpEmail = asyncHandler(async (req, res) => {
  const result = await sendOtpEmailCode({
    email: req.body.email,
    captchaToken: req.body.captchaToken,
  });

  res.json({
    success: true,
    message: "OTP sent successfully.",
    data: result,
  });
});

exports.verifyOtpEmail = asyncHandler(async (req, res) => {
  const result = await verifyOtpEmailCode({
    email: req.body.email,
    otp: req.body.otp,
  });

  res.json({
    success: true,
    message: "OTP verified successfully.",
    data: result,
  });
});
