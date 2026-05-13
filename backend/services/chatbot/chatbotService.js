const env = require("../../config/env");
const AppError = require("../../utils/appError");
const knowledgeBase = require("./faqKnowledgeBase");

const SERVICE_PATHS = {
  GST_REGISTRATION: "/gst-registration",
  ITR_FILING: "/itr-filing",
  COMPANY_REGISTRATION: "/company-registration",
  TRADEMARK_REGISTRATION: "/trademark-registration",
  LLP_REGISTRATION: "/llp-registration",
  STARTUP_INDIA_REGISTRATION: "/startup-india-registration",
  ANNUAL_COMPLIANCE_FILING: "/annual-compliance-filing",
  GST_RETURN_FILING: "/gst-return-filing",
  ROC_FILING: "/roc-filing",
  ACCOUNTING_BOOKKEEPING: "/accounting-bookkeeping",
};

const SERVICE_HINTS = [
  { code: "GST_REGISTRATION", keywords: ["gst registration", "gst number", "register gst"] },
  { code: "GST_RETURN_FILING", keywords: ["gst return", "gstr1", "gstr 3b", "monthly gst"] },
  { code: "ITR_FILING", keywords: ["itr", "income tax", "tax return"] },
  { code: "COMPANY_REGISTRATION", keywords: ["company", "private limited", "startup company", "incorporation"] },
  { code: "TRADEMARK_REGISTRATION", keywords: ["trademark", "brand", "logo registration"] },
  { code: "LLP_REGISTRATION", keywords: ["llp", "limited liability partnership"] },
  { code: "STARTUP_INDIA_REGISTRATION", keywords: ["startup india", "dpiit", "startup recognition"] },
  { code: "ANNUAL_COMPLIANCE_FILING", keywords: ["annual compliance", "annual filing", "compliance filing"] },
  { code: "ROC_FILING", keywords: ["roc", "mca filing", "roc filing"] },
  { code: "ACCOUNTING_BOOKKEEPING", keywords: ["bookkeeping", "accounting", "monthly books", "reconciliation"] },
];

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function getPublicSiteUrl() {
  return String(env.siteUrl || env.appUrl || "").trim().replace(/\/+$/, "");
}

class ChatbotService {
  scoreFaq(query, item) {
    const normalizedQuery = normalizeText(query);
    let score = 0;

    for (const keyword of item.keywords) {
      const normalizedKeyword = normalizeText(keyword);

      if (normalizedQuery === normalizedKeyword) {
        score += 10;
        continue;
      }

      if (normalizedQuery.includes(normalizedKeyword)) {
        score += 5;
      }
    }

    if (normalizedQuery.includes(normalizeText(item.serviceName))) {
      score += 3;
    }

    return score;
  }

  findByCode(serviceCode) {
    return knowledgeBase.find((item) => item.serviceCode === serviceCode) || null;
  }

  findBestMatch(query) {
    let best = null;
    let bestScore = 0;

    for (const item of knowledgeBase) {
      const score = this.scoreFaq(query, item);

      if (score > bestScore) {
        best = item;
        bestScore = score;
      }
    }

    return bestScore > 0 ? best : null;
  }

  suggestService(query) {
    const normalizedQuery = normalizeText(query);

    for (const hint of SERVICE_HINTS) {
      const matched = hint.keywords.some((keyword) => normalizedQuery.includes(normalizeText(keyword)));

      if (matched) {
        return this.findByCode(hint.code);
      }
    }

    return this.findBestMatch(query);
  }

  buildPaymentLink(service) {
    const params = new URLSearchParams({
      service: service.serviceName,
      amount: String(service.pricing.amount),
      currency: service.pricing.currency,
    });

    return `${getPublicSiteUrl()}/consultation?${params.toString()}`;
  }

  buildServiceLink(service) {
    const path = SERVICE_PATHS[service.serviceCode] || "/services";
    return `${getPublicSiteUrl()}${path}`;
  }

  buildConsultationLink(service) {
    const params = new URLSearchParams({
      service: service.serviceName,
    });

    return `${getPublicSiteUrl()}/consultation?${params.toString()}`;
  }

  buildServicePayload(service) {
    return {
      code: service.serviceCode,
      name: service.serviceName,
      amount: service.pricing.amount,
      currency: service.pricing.currency,
      amountFormatted: formatCurrency(service.pricing.amount, service.pricing.currency),
      serviceLink: this.buildServiceLink(service),
      consultationLink: this.buildConsultationLink(service),
      paymentLink: this.buildPaymentLink(service),
    };
  }

  async chat(message) {
    const normalizedMessage = normalizeText(message);

    if (!normalizedMessage) {
      throw new AppError("Message is required.", 400, "VALIDATION_ERROR");
    }

    const faqMatch = this.findBestMatch(normalizedMessage);
    const suggestion = this.suggestService(normalizedMessage);

    if (faqMatch) {
      return {
        type: "faq",
        reply: faqMatch.answer,
        service: this.buildServicePayload(faqMatch),
      };
    }

    if (suggestion) {
      return {
        type: "suggestion",
        reply: `Based on your query, ${suggestion.serviceName} looks like the best fit for you.`,
        service: this.buildServicePayload(suggestion),
      };
    }

    return {
      type: "fallback",
      reply:
        "I can help with GST registration, ITR filing, company registration, LLP setup, trademark work, Startup India registration, recurring compliance, ROC filings, and bookkeeping. Tell me what you need and I'll point you to the best next step.",
      service: null,
    };
  }
}

module.exports = new ChatbotService();