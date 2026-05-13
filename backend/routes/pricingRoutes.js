const express = require("express");
const controller = require("../controllers/pricingController");

const router = express.Router();

router.get("/pricing", controller.listPricing);
router.get("/pricing/:serviceCode", controller.getPricing);

module.exports = router;