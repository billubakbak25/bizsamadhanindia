const fs = require('fs');
const path = require('path');
const { serviceCatalog } = require('../config/serviceCatalog');

const frontendRoot = path.join(__dirname, '..', '..', 'frontend');
const force = process.argv.includes('--force');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function renderFaqs(faqs) {
  return faqs
    .map(
      (faq) => `
            <article class="benefit-card reveal">
              <h3>${escapeHtml(faq.question)}</h3>
              <p>${escapeHtml(faq.answer)}</p>
            </article>`
    )
    .join('');
}

function renderStats(stats) {
  return stats
    .map(
      (stat, index) => `<div class="stat-card reveal${index ? ` delay-${index}` : ''}"><strong>${escapeHtml(stat.value)}</strong><span>${escapeHtml(stat.label)}</span></div>`
    )
    .join('');
}

function renderProblemCards(cards) {
  return cards
    .map(
      (card, index) => `
            <article class="benefit-card reveal${index ? ` delay-${index}` : ''}">
              <h3>${escapeHtml(card.title)}</h3>
              <p>${escapeHtml(card.body)}</p>
            </article>`
    )
    .join('');
}

function renderRelatedLinks(links) {
  return links.map((link) => `<a class="text-link" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join('');
}

function buildPage(service) {
  const pageSlug = service.route.replace(/^\/services\//, '');
  const canonical = `https://www.bizsamadhanindia.com${service.route}`;
  const breadcrumbName = service.pageTitle.replace(/ Service$/, '');
  const priceValue = String(Math.round(Number(service.price || 0)));
  const trustStats = [
    { value: 'Guided', label: 'Step-by-step support from start to finish' },
    { value: 'Reviewed', label: 'Document and application checks' },
    { value: 'Clear', label: 'Next steps made easier to follow' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(service.metaDescription)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="Wadhwani Associates" />
    <meta name="theme-color" content="#1163ff" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:site_name" content="Wadhwani Associates" />
    <meta property="og:title" content="${escapeHtml(service.pageTitle)} | Wadhwani Associates" />
    <meta property="og:description" content="${escapeHtml(service.metaDescription)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="https://www.bizsamadhanindia.com/og-image.svg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(service.pageTitle)} | Wadhwani Associates" />
    <meta name="twitter:description" content="${escapeHtml(service.metaDescription)}" />
    <meta name="twitter:image" content="https://www.bizsamadhanindia.com/og-image.svg" />
    <script type="application/ld+json">
      ${JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bizsamadhanindia.com/' },
              { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.bizsamadhanindia.com/services' },
              { '@type': 'ListItem', position: 3, name: breadcrumbName, item: canonical },
            ],
          },
          {
            '@type': 'Service',
            name: service.pageTitle,
            provider: { '@type': 'Organization', name: 'Wadhwani Associates' },
            serviceType: service.serviceName,
            areaServed: 'IN',
            offers: { '@type': 'Offer', priceCurrency: 'INR', price: priceValue, url: canonical },
            description: service.metaDescription,
          },
          {
            '@type': 'FAQPage',
            mainEntity: service.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          },
        ],
      })}
    </script>
    <title>${escapeHtml(service.pageTitle)} | Wadhwani Associates</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <header class="site-header">
      <nav class="navbar container" aria-label="Main navigation">
        <a class="brand" href="/" aria-label="Wadhwani Associates home">
          <span class="brand-mark">WA</span>
          <span class="brand-text">Wadhwani Associates</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="Toggle navigation">
          <span></span><span></span><span></span>
        </button>
        <div class="nav-menu" id="nav-menu">
          <a href="/">Home</a>
          <a href="/services" class="active">Services</a>
          <a href="/consultation">Consultation</a>
          <a href="/contact">Contact</a>
          <a href="/client-portal">Client Portal</a>
          <a href="/consultation" class="btn btn-primary nav-cta" data-track="${escapeHtml(service.trackPrefix)}_consultation">Book Consultation</a>
        </div>
      </nav>
    </header>

    <main>
      <section class="page-hero section">
        <div class="container narrow reveal">
          <p class="breadcrumbs"><a href="/">Home</a><span>/</span><a href="/services">Services</a><span>/</span><strong>${escapeHtml(breadcrumbName)}</strong></p>
          <p class="eyebrow">${escapeHtml(service.category)}</p>
          <h1>${escapeHtml(service.heroTitle)}</h1>
          <p>${escapeHtml(service.heroCopy)}</p>
          <div class="hero-actions">
            <a href="/consultation" class="btn btn-primary" data-track="${escapeHtml(service.trackPrefix)}_consultation">${escapeHtml(service.ctaButton)}</a>
            <a href="/services" class="btn btn-secondary">View Pricing</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container answer-card reveal">
          <p class="eyebrow">Quick Answer</p>
          <h2>${escapeHtml(service.quickAnswerTitle)}</h2>
          <p>${escapeHtml(service.quickAnswerBody)}</p>
        </div>
      </section>

      <section class="section section-alt">
        <div class="container">
          <div class="hero-stats trust-strip">
            ${renderStats(trustStats)}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-heading reveal">
            <p class="eyebrow">Why It Matters</p>
            <h2>What businesses usually need before they move forward.</h2>
          </div>
          <div class="benefit-grid">
            ${renderProblemCards(service.problemCards)}
          </div>
        </div>
      </section>

      <section class="section section-alt">
        <div class="container service-detail-grid">
          <article class="service-card reveal">
            <p class="eyebrow">How We Help</p>
            <h2>${escapeHtml(service.pageTitle.replace(' Service', ''))} support from start to filing.</h2>
            <ul class="detail-list">
              ${renderList(service.helpBullets)}
            </ul>
          </article>
          <article class="service-card reveal delay-1">
            <p class="eyebrow">Best Fit For</p>
            <h2>Ideal for teams that want a clear process.</h2>
            <ul class="detail-list">
              ${renderList(service.bestForBullets)}
            </ul>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="container service-detail-grid">
          <article class="service-card reveal">
            <p class="eyebrow">Common Documents</p>
            <h2>Documents usually requested for this service.</h2>
            <ul class="detail-list">
              ${renderList(service.docBullets)}
            </ul>
          </article>
          <article class="service-card reveal delay-1">
            <p class="eyebrow">Why Wadhwani Associates</p>
            <h2>Built for clarity, speed, and fewer back-and-forth loops.</h2>
            <ul class="detail-list">
              <li>Clear expert guidance at each step</li>
              <li>Document review before filing</li>
              <li>Consultation support when the case needs it</li>
              <li>Transparent next-step direction after submission</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="section section-alt">
        <div class="container">
          <div class="section-heading reveal">
            <p class="eyebrow">${escapeHtml(service.pageTitle)}</p>
            <h2>FAQs that help high-intent visitors move faster.</h2>
          </div>
          <div class="benefit-grid">
            ${renderFaqs(service.faqs)}
          </div>
        </div>
      </section>

      <section class="section section-alt">
        <div class="container link-grid">
          <article class="info-card reveal">
            <h3>Also explore</h3>
            ${renderRelatedLinks(service.relatedLinks)}
          </article>
          <article class="cta-strip-inner reveal delay-1">
            <div>
              <p class="eyebrow">${escapeHtml(service.ctaTitle)}</p>
              <h2>${escapeHtml(service.ctaCopy)}</h2>
            </div>
            <a href="/consultation" class="btn btn-primary" data-track="${escapeHtml(service.trackPrefix)}_bottom_cta">${escapeHtml(service.ctaButton)}</a>
          </article>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <a class="brand footer-brand" href="/">
            <span class="brand-mark">WA</span>
            <span class="brand-text">Wadhwani Associates</span>
          </a>
          <p>Premium legal and tax compliance support for modern businesses.</p>
        </div>
        <div>
          <h3>Pages</h3>
          <a href="/">Home</a>
          <a href="/services">Services</a>
          <a href="/consultation">Consultation</a>
          <a href="/contact">Contact</a>
        </div>
        <div>
          <h3>Popular Services</h3>
          <a href="/services/gst-registration">GST Registration</a>
          <a href="/services/company-registration">Company Registration</a>
          <a href="/services/trademark-registration">Trademark Registration</a>
        </div>
        <div>
          <h3>Contact</h3>
          <a href="tel:+919696893625">+91 9696893625</a>
          <a href="tel:+918303340092">+91 8303340092</a>
          <a href="mailto:support@bizsamadhanindia.com">support@bizsamadhanindia.com</a>
          <p>Mon-Sat, 9:00 AM to 7:00 PM</p>
        </div>
      </div>
    </footer>

    <script src="/site-config.js" defer></script>
    <script src="/script.js" defer></script>
    <script src="/chatbot.js" defer></script>
  </body>
</html>
`;
}

fs.mkdirSync(frontendRoot, { recursive: true });

for (const service of serviceCatalog) {
  const targetPath = path.join(frontendRoot, service.file);

  if (!force && fs.existsSync(targetPath)) {
    continue;
  }

  fs.writeFileSync(targetPath, buildPage(service), 'utf8');
}
