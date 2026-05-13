const express = require("express");
const controller = require("../controllers/serviceController");
const { requireAdmin } = require("../middleware/auth");
const { singleUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();
router.use(requireAdmin);

router.get("/categories", controller.getCategories);
router.get("/", controller.listServices);
router.post("/", controller.createService);
router.get("/:id", controller.getService);
router.patch("/:id/status", controller.updateServiceStatus);
router.post("/:id/documents", singleUpload("file"), controller.uploadDocument);
router.get("/:id/timeline", controller.getTimeline);

module.exports = router;
