const path = require("path");
const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");
const seoService = require("../services/seoService");
const { getDatabaseHealth } = require("../lib/prisma");

function sendPage(res, fileName, options = {}) {
  if (options.noIndex) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  } else {
    res.setHeader("X-Robots-Tag", "index, follow");
  }

  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.sendFile(seoService.getFilePath(fileName));
}

exports.health = function health(req, res) {
  res.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      appUrl: env.appUrl,
      siteUrl: env.siteUrl,
    },
  });
};

exports.healthDb = asyncHandler(async (req, res) => {
  const health = await getDatabaseHealth();
  res.status(health.ok ? 200 : 503).json({
    success: health.ok,
    data: {
      status: health.status,
      message: health.message,
      timestamp: new Date().toISOString(),
    },
  });
});

exports.redirectLegacy = function redirectLegacy(req, res, next) {
  const target = seoService.getLegacyRedirect(req.path);

  if (!target) {
    return next();
  }

  return res.redirect(301, target);
};

exports.renderPage = function renderPage(req, res, next) {
  const page = seoService.resolvePage(req.path);

  if (!page) {
    return next();
  }

  return sendPage(res, page.file, {
    noIndex: page.route === "/client-portal" || page.route === "/admin" || page.route === "/payment-success",
  });
};

exports.robots = function robots(req, res) {
  res.type("text/plain");
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.send(seoService.buildRobotsTxt());
};

exports.sitemap = function sitemap(req, res) {
  res.type("application/xml");
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.send(seoService.buildSitemapXml());
};

exports.siteConfig = function siteConfig(req, res) {
  res.type("application/javascript");
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
  res.send(seoService.buildSiteConfigScript());
};

exports.googleVerification = function googleVerification(req, res, next) {
  const fileName = path.basename(req.path);
  const payload = seoService.getGoogleVerificationPayload(fileName);

  if (!payload) {
    return next();
  }

  res.type("text/plain");
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.send(payload);
};
