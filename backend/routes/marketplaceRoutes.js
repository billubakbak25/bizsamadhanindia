const express = require("express");
const controller = require("../controllers/marketplaceController");

const router = express.Router();

router.get("/partners/dashboard", controller.getPartnerDashboard);
router.post("/partners/apply", controller.applyPartner);
router.get("/packages", controller.listPackages);
router.get("/bundles", controller.listPackages);
router.get("/tools/defaults", controller.getToolDefaults);

module.exports = router;
