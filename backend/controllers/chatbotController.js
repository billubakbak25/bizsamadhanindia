const asyncHandler = require("../utils/asyncHandler");
const chatbotService = require("../services/chatbot/chatbotService");

exports.chat = asyncHandler(async (req, res) => {
  const result = await chatbotService.chat(req.body.message);

  res.status(200).json({
    success: true,
    data: result,
  });
});
