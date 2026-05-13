const servicePricing = require("./servicePricing");

function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0) / 100);
}

function getServicePrice(serviceName) {
  const item = servicePricing[serviceName];
  return item ? Number(item.amount || 0) : 0;
}

const packageCatalog = [
  {
    key: "startup-launch-pack",
    name: "Startup Launch Pack",
    category: "Startup",
    badge: "Most Popular",
    description: "A practical starter bundle for founders launching a company and setting up the first compliance steps.",
    amount: 899900,
    currency: "INR",
    includedServices: ["Company Registration", "GST Registration", "Startup India Registration"],
    bestFor: ["First-time founders", "Early-stage startups", "Teams needing formation plus tax setup"],
    highlights: ["Formation + GST + startup recognition", "Consultation-led onboarding", "Fast next-step routing"],
    route: "/consultation",
    consultationLabel: "Plan launch bundle",
  },
  {
    key: "compliance-care-pack",
    name: "Compliance Care Pack",
    category: "Compliance",
    badge: "Recurring",
    description: "Ongoing compliance support for companies and LLPs that want tax and filing work handled together.",
    amount: 1299900,
    currency: "INR",
    includedServices: ["GST Return Filing", "Annual Compliance Filing", "ROC Filing", "Accounting and Bookkeeping"],
    bestFor: ["Growing businesses", "Recurring compliance teams", "Founders who want monthly support"],
    highlights: ["Tax filing + annual filings", "Bookkeeping included", "Calendar-friendly compliance"],
    route: "/consultation",
    consultationLabel: "Plan compliance bundle",
  },
  {
    key: "brand-protection-pack",
    name: "Brand Protection Pack",
    category: "IP Protection",
    badge: "Protective",
    description: "A creator-friendly bundle for brands that want trademark and copyright protection together.",
    amount: 699900,
    currency: "INR",
    includedServices: ["Trademark Registration", "Copyright Registration"],
    bestFor: ["Brands and creators", "Product teams", "Businesses with original work"],
    highlights: ["Trademark + copyright", "Filing support", "Ownership-proof oriented"],
    route: "/consultation",
    consultationLabel: "Plan IP bundle",
  },
  {
    key: "partner-growth-pack",
    name: "Partner Growth Pack",
    category: "Partner Program",
    badge: "Partner Ready",
    description: "A referral-friendly bundle for partners who want a broader cross-sell offer to share with clients.",
    amount: 1099900,
    currency: "INR",
    includedServices: ["LLP Registration", "GST Registration", "Accounting and Bookkeeping"],
    bestFor: ["Referral partners", "Consultants", "Channel sellers"],
    highlights: ["Good for warm referrals", "Formation + bookkeeping mix", "Easy to explain to clients"],
    route: "/consultation",
    consultationLabel: "Plan partner bundle",
  },
];

const toolDefaults = [
  {
    key: "gst-readiness",
    name: "GST Readiness Check",
    description: "Quick starting values for a GST eligibility or filing calculator.",
    inputs: {
      monthlyTurnover: 150000,
      interstateSales: false,
      ecommerceSales: false,
      serviceBusiness: true,
    },
    outputLabels: ["Eligibility risk", "Recommended next step", "Filing frequency"],
  },
  {
    key: "compliance-planner",
    name: "Compliance Planner",
    description: "Starting defaults for a recurring compliance timeline calculator.",
    inputs: {
      entityType: "private_limited",
      activeServices: 2,
      monthlyTransactions: 40,
      renewalWindowDays: 30,
    },
    outputLabels: ["Next due item", "Recurring workload", "Suggested plan"],
  },
];

function buildPackageCard(entry) {
  const includedValue = entry.includedServices.reduce((sum, serviceName) => sum + getServicePrice(serviceName), 0);
  const savings = Math.max(includedValue - Number(entry.amount || 0), 0);

  return {
    key: entry.key,
    name: entry.name,
    category: entry.category,
    badge: entry.badge,
    description: entry.description,
    amount: Number(entry.amount || 0),
    currency: entry.currency || "INR",
    amountFormatted: formatCurrency(entry.amount, entry.currency || "INR"),
    includedValue,
    includedValueFormatted: formatCurrency(includedValue, entry.currency || "INR"),
    savings,
    savingsFormatted: formatCurrency(savings, entry.currency || "INR"),
    includedServices: entry.includedServices,
    bestFor: entry.bestFor,
    highlights: entry.highlights,
    route: entry.route,
    consultationLabel: entry.consultationLabel,
  };
}

function getPackageCatalog() {
  return packageCatalog.map(buildPackageCard);
}

function getToolDefaults() {
  return toolDefaults.map((tool) => ({
    ...tool,
    inputs: { ...tool.inputs },
    outputLabels: [...tool.outputLabels],
  }));
}

function getCatalogSummary() {
  const items = getPackageCatalog();
  const amounts = items.map((item) => item.amount);

  return {
    total: items.length,
    minAmount: amounts.length ? Math.min(...amounts) : 0,
    maxAmount: amounts.length ? Math.max(...amounts) : 0,
    averageAmount: amounts.length ? Math.round(amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length) : 0,
  };
}

module.exports = {
  getPackageCatalog,
  getToolDefaults,
  getCatalogSummary,
  getServicePrice,
};
