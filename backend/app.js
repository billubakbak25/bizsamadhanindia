require("./loadEnv");

const compression = require("compression");
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const path = require("path");

const env = require("./config/env");
const { leadRateLimiter, chatbotRateLimiter } = require("./middleware/rateLimit");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

const systemRoutes = require("./routes/systemRoutes");
const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminConsoleRoutes = require("./routes/adminConsoleRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const clientRoutes = require("./routes/clientRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const crmRoutes = require("./routes/crmRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const addonRoutes = require("./routes/addonRoutes");
const referralRoutes = require("./routes/referralRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");
const billingRoutes = require("./routes/billingRoutes");
const taskRoutes = require("./routes/taskRoutes");
const vaultRoutes = require("./routes/vaultRoutes");
const workflowRoutes = require("./routes/workflowRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const followUpRoutes = require("./routes/followUpRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const adminPricingRoutes = require("./routes/adminPricingRoutes");

const { bootstrapWorkflowEngine } = require("./services/workflowEngineService");
require("./services/workflowHandlers");

const { createSessionStore } = require("./infrastructure/sessionStore");

function registerMounts(app, definitions) {
  definitions.forEach(({ path, middleware = [], router }) => {
    app.use(path, ...middleware, router);
  });
}

function createApp() {
  const app = express();
  const apiBasePath = `/api/${env.apiVersion}`;
  const frontendPath = path.join(__dirname, "..", "frontend");
  const sessionStore = createSessionStore();

  bootstrapWorkflowEngine().catch((error) => {
    console.warn("workflow_engine_bootstrap_failed", error.message);
  });

  const allowedOrigins = Array.from(
    new Set(
      [env.siteUrl, env.appUrl, String(env.corsAllowedOrigins || "")]
        .join(",")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );

  app.disable("x-powered-by");
  app.set("trust proxy", env.trustProxyHops);

  app.get("/api/test", (req, res) => {
    res.json({ success: true, msg: "Backend working" });
  });

  app.get(`${apiBasePath}/test`, (req, res) => {
    res.json({ success: true, msg: "Backend working" });
  });

  app.get(`${apiBasePath}/health`, (req, res) => {
    res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
  });

  app.get(`${apiBasePath}/health/db`, async (req, res) => {
    const { getDatabaseHealth } = require("./lib/prisma");
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

  app.use((req, res, next) => {
    const origin = String(req.headers.origin || "").trim();
    const isAllowedOrigin = Boolean(origin) && allowedOrigins.includes(origin);

    res.setHeader("Access-Control-Allow-Origin", isAllowedOrigin ? origin : "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

    if (isAllowedOrigin) {
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      hsts: env.nodeEnv === "production",
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
  );

  app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
    next();
  });

  app.use((req, res, next) => {
    if (!env.forceHttps) {
      return next();
    }

    const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();

    if (req.secure || forwardedProto === "https") {
      return next();
    }

    return res.redirect(301, `${env.siteUrl}${req.originalUrl}`);
  });

  app.use(
    compression({
      threshold: env.compressionThresholdBytes,
    })
  );

  app.use("/api/webhooks", webhookRoutes);
  app.use(`${apiBasePath}/webhooks`, webhookRoutes);

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  app.use(
    session({
      name: env.sessionName,
      store: sessionStore,
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        sameSite: env.secureCookies ? "none" : "lax",
        secure: env.secureCookies,
        maxAge: env.sessionTtlSeconds * 1000,
      },
    })
  );

  app.use(requestLogger);

  app.use((req, res, next) => {
    const pathname = req.path || "";
    const shouldNoIndex =
      pathname === "/admin" ||
      pathname === "/admin.html" ||
      pathname === "/client-portal" ||
      pathname === "/client.html" ||
      pathname === "/payment-success" ||
      pathname === "/payment-success.html" ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/client/") ||
      pathname.startsWith("/invoice-files/") ||
      pathname.startsWith("/client-uploads/");

    if (shouldNoIndex) {
      res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    }

    next();
  });

  app.use(systemRoutes);

  app.use(
    express.static(frontendPath, {
      index: false,
      maxAge: env.staticAssetCacheSeconds * 1000,
      setHeaders(res, filePath) {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
          return;
        }

        if (filePath.endsWith(".svg") || filePath.endsWith(".webmanifest") || filePath.endsWith(".css") || filePath.endsWith(".js")) {
          res.setHeader("Cache-Control", `public, max-age=${env.staticAssetCacheSeconds}, stale-while-revalidate=86400`);
        }
      },
    })
  );

  app.use(
    "/invoice-files",
    express.static(path.join(__dirname, "storage", "invoices"), {
      maxAge: 60 * 60 * 1000,
    })
  );

  app.use(
    "/client-uploads",
    express.static(path.join(__dirname, "storage", "uploads"), {
      maxAge: 60 * 60 * 1000,
    })
  );

  registerMounts(app, [
    { path: "/api/auth", router: authRoutes },
    { path: "/api/consultations", router: consultationRoutes },
    { path: "/api", router: leadRoutes },
    { path: "/api/admin", router: adminRoutes },
    { path: "/api/admin", router: adminConsoleRoutes },
    { path: "/api", router: paymentRoutes },
    { path: "/api", router: pricingRoutes },
    { path: "/client", router: clientRoutes },
    { path: "/api/chatbot", middleware: [chatbotRateLimiter], router: chatbotRoutes },
    { path: "/api/admin/crm", router: crmRoutes },
    { path: "/api/admin/metrics", router: metricsRoutes },
    { path: "/api/admin/addons", router: addonRoutes },
    { path: "/api/admin/referrals", router: referralRoutes },
    { path: "/api", router: marketplaceRoutes },
    { path: "/api/admin/billing", router: billingRoutes },
    { path: "/api/admin/tasks", router: taskRoutes },
    { path: "/api/admin/vault", router: vaultRoutes },
    { path: "/api/admin/workflows", router: workflowRoutes },
    { path: "/api/admin/followups", router: followUpRoutes },
    { path: "/api/admin/pricing", router: adminPricingRoutes },
  ]);

  registerMounts(app, [
    { path: `${apiBasePath}/auth`, router: authRoutes },
    { path: `${apiBasePath}/consultations`, router: consultationRoutes },
    { path: apiBasePath, router: leadRoutes },
    { path: `${apiBasePath}/admin`, router: adminRoutes },
    { path: `${apiBasePath}/admin`, router: adminConsoleRoutes },
    { path: apiBasePath, router: paymentRoutes },
    { path: apiBasePath, router: pricingRoutes },
    { path: `${apiBasePath}/client`, router: clientRoutes },
    { path: `${apiBasePath}/chatbot`, middleware: [chatbotRateLimiter], router: chatbotRoutes },
    { path: `${apiBasePath}/admin/crm`, router: crmRoutes },
    { path: `${apiBasePath}/crm`, router: crmRoutes },
    { path: `${apiBasePath}/services`, router: serviceRoutes },
    { path: `${apiBasePath}/admin/metrics`, router: metricsRoutes },
    { path: `${apiBasePath}/admin/addons`, router: addonRoutes },
    { path: `${apiBasePath}/admin/referrals`, router: referralRoutes },
    { path: apiBasePath, router: marketplaceRoutes },
    { path: `${apiBasePath}/admin/billing`, router: billingRoutes },
    { path: `${apiBasePath}/admin/tasks`, router: taskRoutes },
    { path: `${apiBasePath}/admin/vault`, router: vaultRoutes },
    { path: `${apiBasePath}/admin/workflows`, router: workflowRoutes },
    { path: `${apiBasePath}/admin/followups`, router: followUpRoutes },
    { path: `${apiBasePath}/admin/pricing`, router: adminPricingRoutes },
  ]);

  app.use((req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    error.code = "ROUTE_NOT_FOUND";
    next(error);
  });

  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};





