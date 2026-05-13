const express = require("express");
const controller = require("../controllers/pricingController");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAdmin);

router.get("/services", controller.listAdminPricingServices);
router.post("/services", controller.saveAdminPricingService);
router.patch("/services/:code", controller.saveAdminPricingService);
router.post("/update", controller.saveAdminPricingService);
router.get("/rules", controller.listAdminPricingRules);
router.post("/rules", controller.createAdminPricingRule);
router.patch("/rules/:id", controller.updateAdminPricingRule);
router.post("/rule", controller.createAdminPricingRule);

module.exports = router;