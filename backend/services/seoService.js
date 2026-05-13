const fs = require('fs');
const path = require('path');

const env = require('../config/env');
const { getServiceCatalogPages, getServiceLegacyRedirects } = require('../config/serviceCatalog');

const frontendRoot = path.join(__dirname, '..', '..', 'frontend');

const publicPages = [
  { key: 'home', route: '/', file: 'index.html', changefreq: 'weekly', priority: '1.0' },
  { key: 'services', route: '/services', file: 'services.html', changefreq: 'weekly', priority: '0.95' },
  { key: 'privacy-policy', route: '/privacy-policy', file: 'privacy-policy.html', changefreq: 'monthly', priority: '0.4' },
  { key: 'terms-and-conditions', route: '/terms-and-conditions', file: 'terms-and-conditions.html', changefreq: 'monthly', priority: '0.4' },
  { key: 'gst-registration', route: '/services/gst-registration', file: 'gst-registration.html', changefreq: 'weekly', priority: '0.9' },
  { key: 'itr-filing', route: '/services/itr-filing', file: 'itr-filing.html', changefreq: 'weekly', priority: '0.9' },
  { key: 'company-registration', route: '/services/company-registration', file: 'company-registration.html', changefreq: 'weekly', priority: '0.9' },
  { key: 'trademark-registration', route: '/services/trademark-registration', file: 'trademark-registration.html', changefreq: 'weekly', priority: '0.9' },
  { key: 'consultation', route: '/consultation', file: 'consultation.html', changefreq: 'weekly', priority: '0.9' },
  ...getServiceCatalogPages(),
  { key: 'partner', route: '/partner', file: 'partner.html', changefreq: 'monthly', priority: '0.8' },
  { key: 'tools', route: '/tools', file: 'tools.html', changefreq: 'monthly', priority: '0.8' },
  { key: 'ca-kanpur', route: '/locations/kanpur/ca-services', file: 'ca-in-kanpur.html', changefreq: 'weekly', priority: '0.85' },
  { key: 'contact', route: '/contact', file: 'contact.html', changefreq: 'monthly', priority: '0.8' },
];

const privatePages = [
  { key: 'client-portal', route: '/client-portal', file: 'client.html' },
  { key: 'admin', route: '/admin', file: 'admin.html' },
  { key: 'payment-success', route: '/payment-success', file: 'payment-success.html' },
];

const legacyRedirects = new Map([
  ['/index.html', '/'],
  ['/services.html', '/services'],
  ['/contact.html', '/contact'],
  ['/privacy-policy.html', '/privacy-policy'],
  ['/terms-and-conditions.html', '/terms-and-conditions'],
  ['/client.html', '/client-portal'],
  ['/admin.html', '/admin'],
  ['/gst-registration.html', '/services/gst-registration'],
  ['/itr-filing.html', '/services/itr-filing'],
  ['/company-registration.html', '/services/company-registration'],
  ['/trademark-registration.html', '/services/trademark-registration'],
  ['/consultation.html', '/consultation'],
  ['/partner.html', '/partner'],
  ['/tools.html', '/tools'],
  ['/ca-in-kanpur.html', '/locations/kanpur/ca-services'],
  ['/locations/kanpur', '/locations/kanpur/ca-services'],
  ...getServiceLegacyRedirects(),
]);

function toDateOnly(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function getFilePath(fileName) {
  return path.join(frontendRoot, fileName);
}

function resolvePage(routePath) {
  return publicPages.find((page) => page.route === routePath) || privatePages.find((page) => page.route === routePath) || null;
}

function getLegacyRedirect(routePath) {
  return legacyRedirects.get(routePath) || null;
}

function getLastModified(fileName) {
  try {
    const stats = fs.statSync(getFilePath(fileName));
    return toDateOnly(stats.mtime);
  } catch (error) {
    return toDateOnly(Date.now());
  }
}

function buildSitemapXml() {
  const siteUrl = env.siteUrl;
  const entries = publicPages
    .map((page) => `  <url>\n    <loc>${siteUrl}${page.route === '/' ? '/' : page.route}</loc>\n    <lastmod>${getLastModified(page.file)}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

function buildRobotsTxt() {
  const host = env.siteUrl.replace(/^https?:\/\//, '');

  return [
    'User-agent: *',
    'Allow: /',
    `Host: ${host}`,
    `Sitemap: ${env.siteUrl}/sitemap.xml`,
    '',
    'Disallow: /admin',
    'Disallow: /admin.html',
    'Disallow: /client-portal',
    'Disallow: /client.html',
    'Disallow: /payment-success',
    'Disallow: /payment-success.html',
    'Disallow: /api/',
    'Disallow: /client/',
    'Disallow: /invoice-files/',
    'Disallow: /client-uploads/',
  ].join('\n');
}

function buildSiteConfigScript() {
  const payload = {
    siteUrl: env.siteUrl,
    businessName: env.businessName,
    businessPhone: env.businessPhone,
    businessEmail: env.businessEmail,
    businessCity: env.businessCity,
    googleAnalyticsId: env.googleAnalyticsId,
    googleTagManagerId: env.googleTagManagerId,
  };

  return `window.__LEGALAXIS_SITE__ = ${JSON.stringify(payload)};`;
}

function getGoogleVerificationPayload(fileName) {
  if (!env.googleSiteVerificationFile) {
    return null;
  }

  if (fileName !== env.googleSiteVerificationFile) {
    return null;
  }

  return `google-site-verification: ${env.googleSiteVerificationFile}`;
}

function getPublicRoutePaths() {
  return publicPages.map((page) => page.route);
}

function getLegacyRedirectPaths() {
  return Array.from(legacyRedirects.keys());
}

module.exports = {
  publicPages,
  privatePages,
  resolvePage,
  getFilePath,
  getLegacyRedirect,
  buildSitemapXml,
  buildRobotsTxt,
  buildSiteConfigScript,
  getGoogleVerificationPayload,
  getPublicRoutePaths,
  getLegacyRedirectPaths,
};
