const express = require("express");
const controller = require("../controllers/chatbotController");

const router = express.Router();

router.post("/message", controller.chat);

module.exports = router;
