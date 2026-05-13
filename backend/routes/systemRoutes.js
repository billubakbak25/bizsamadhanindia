const express = require("express");
const systemController = require("../controllers/systemController");
const seoService = require("../services/seoService");

const router = express.Router();

router.get("/health", systemController.health);
router.get("/health/db", systemController.healthDb);
router.get("/favicon.ico", (req, res) => res.redirect(301, "/favicon.svg"));
router.get("/robots.txt", systemController.robots);
router.get("/sitemap.xml", systemController.sitemap);
router.get("/site-config.js", systemController.siteConfig);
router.get(/^\/google[a-zA-Z0-9]+\.html$/, systemController.googleVerification);

router.get(seoService.getLegacyRedirectPaths(), systemController.redirectLegacy);
router.get([...seoService.getPublicRoutePaths(), ...seoService.privatePages.map((page) => page.route)], systemController.renderPage);

module.exports = router;
