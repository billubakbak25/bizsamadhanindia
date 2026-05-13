const LEAD_TEMPERATURE = {
  HOT: "hot",
  WARM: "warm",
  COLD: "cold",
};

const LEAD_PRIORITY = {
  URGENT: "urgent",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

// Service weights - higher value services score higher
const SERVICE_WEIGHTS = {
  "Company Registration": 35,
  "Private Limited Company": 35,
  "LLP Registration": 30,
  "Trademark Registration": 28,
  "GST Registration": 22,
  "Income Tax Return": 18,
  "Income Tax Return (ITR)": 18,
  "Annual Compliance": 20,
  "Accounting & Bookkeeping": 24,
  "One Person Company": 25,
  "Partnership Firm": 18,
  "Sole Proprietorship": 12,
  "Copyright Registration": 22,
  "ROC Filing": 16,
  "GST Return Filing": 14,
};

// Keywords that indicate urgency or buying intent
const MESSAGE_KEYWORDS = {
  // Urgency indicators
  urgent: 20,
  immediately: 20,
  asap: 18,
  today: 15,
  tomorrow: 12,
  "this week": 10,
  deadline: 15,
  "time sensitive": 18,
  emergency: 20,
  
  // Buying signals
  "want to start": 15,
  "need to register": 18,
  "looking to": 12,
  "ready to": 18,
  "how much": 14,
  pricing: 14,
  cost: 12,
  quote: 16,
  "proceed with": 18,
  
  // Engagement signals
  callback: 12,
  "call me": 14,
  "call back": 14,
  meeting: 10,
  discuss: 8,
  consultation: 10,
  
  // Action keywords
  register: 10,
  filing: 8,
  compliance: 8,
  trademark: 10,
  incorporate: 12,
  apply: 8,
};

// Business type indicators
const BUSINESS_INDICATORS = {
  startup: 15,
  "private limited": 18,
  llp: 15,
  company: 12,
  firm: 10,
  enterprise: 14,
  "e-commerce": 16,
  export: 18,
  import: 18,
  "international": 16,
  franchise: 14,
  "funding": 18,
  investor: 20,
  venture: 18,
};

// Time-based scoring (leads during business hours score higher)
function scoreTimeOfDay(timestamp) {
  if (!timestamp) return 0;
  
  const date = new Date(timestamp);
  const hour = date.getHours();
  const day = date.getDay();
  
  // Weekend leads
  if (day === 0 || day === 6) {
    return 5; // Lower but still shows intent
  }
  
  // Business hours (9 AM - 6 PM IST)
  if (hour >= 9 && hour <= 18) {
    return 10;
  }
  
  // Early morning or late evening
  if ((hour >= 7 && hour < 9) || (hour > 18 && hour <= 21)) {
    return 7;
  }
  
  return 3;
}

// Geographic scoring (tier 1 cities score higher due to higher deal sizes)
const CITY_TIERS = {
  tier1: ["mumbai", "delhi", "bangalore", "bengaluru", "chennai", "hyderabad", "kolkata", "pune"],
  tier2: ["ahmedabad", "jaipur", "lucknow", "kanpur", "nagpur", "indore", "thane", "bhopal", "visakhapatnam", "patna", "vadodara", "ghaziabad", "ludhiana", "agra", "nashik", "faridabad", "meerut", "rajkot", "varanasi", "srinagar", "aurangabad", "dhanbad", "amritsar", "allahabad", "ranchi", "howrah", "coimbatore", "jabalpur", "gwalior", "vijayawada", "jodhpur", "madurai", "raipur", "kota", "chandigarh", "guwahati", "solapur", "hubli", "mysore", "tiruchirappalli", "bareilly", "aligarh", "tiruppur", "moradabad", "jalandhar", "bhubaneswar"],
};

function scoreCityTier(city) {
  if (!city) return 0;
  
  const normalizedCity = String(city).toLowerCase().trim();
  
  if (CITY_TIERS.tier1.some(c => normalizedCity.includes(c))) {
    return 15;
  }
  
  if (CITY_TIERS.tier2.some(c => normalizedCity.includes(c))) {
    return 10;
  }
  
  return 5; // Other cities
}

// Referral source scoring
const SOURCE_WEIGHTS = {
  referral: 25,
  "google partner": 20,
  organic: 15,
  google: 12,
  direct: 10,
  social: 8,
  facebook: 8,
  instagram: 6,
  linkedin: 10,
  ads: 6,
  "paid search": 8,
  email: 10,
  webinar: 18,
  event: 16,
  "partner website": 18,
};

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidPhone(phone) {
  return /^[0-9]{10,15}$/.test(String(phone || "").replace(/\D/g, ""));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function isCorporateEmail(email) {
  const freeEmailDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "rediffmail.com", "ymail.com", "aol.com", "protonmail.com", "icloud.com"];
  const normalizedEmail = normalizeText(email);
  
  if (!isValidEmail(normalizedEmail)) return false;
  
  const domain = normalizedEmail.split("@")[1];
  return !freeEmailDomains.includes(domain);
}

function scoreService(service) {
  const normalized = normalizeText(service);
  
  for (const [key, weight] of Object.entries(SERVICE_WEIGHTS)) {
    if (normalized.includes(normalizeText(key))) {
      return weight;
    }
  }
  
  return 10; // Default score for unknown services
}

function scoreMessage(message) {
  const normalized = normalizeText(message);

  if (!normalized) {
    return 0;
  }

  let score = 0;

  // Keyword scoring
  for (const [keyword, weight] of Object.entries(MESSAGE_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      score += weight;
    }
  }

  // Business indicator scoring
  for (const [indicator, weight] of Object.entries(BUSINESS_INDICATORS)) {
    if (normalized.includes(indicator)) {
      score += weight;
    }
  }

  // Message length bonus (detailed messages show higher intent)
  if (normalized.length >= 150) {
    score += 12;
  } else if (normalized.length >= 80) {
    score += 8;
  } else if (normalized.length >= 30) {
    score += 4;
  }

  // Question marks indicate engagement
  const questionCount = (normalized.match(/\?/g) || []).length;
  score += Math.min(questionCount * 3, 9);

  return score;
}

function scoreContact({ phone, email, name }) {
  let score = 0;

  // Phone scoring
  if (isValidPhone(phone)) {
    score += 20;
    
    // Indian mobile number bonus
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    if (cleanPhone.startsWith("91") || cleanPhone.length === 10) {
      score += 5;
    }
  }

  // Email scoring
  if (isValidEmail(email)) {
    score += 10;
    
    // Corporate email bonus
    if (isCorporateEmail(email)) {
      score += 12;
    }
  }

  // Name completeness (full names are better)
  const normalizedName = normalizeText(name);
  if (normalizedName.includes(" ")) {
    score += 5; // Full name provided
  }

  return score;
}

function scoreEngagement({ source, hasFollowUpRequest, preferredTime, previousInteractions, pageViews, sessionDuration }) {
  let score = 0;
  const normalizedSource = normalizeText(source);

  // Source scoring
  for (const [key, weight] of Object.entries(SOURCE_WEIGHTS)) {
    if (normalizedSource.includes(normalizeText(key))) {
      score += weight;
      break;
    }
  }

  // Default source score if no match
  if (score === 0 && normalizedSource) {
    score += 5;
  }

  // Follow-up request bonus
  if (hasFollowUpRequest === true) {
    score += 15;
  }

  // Preferred time bonus (shows planning and seriousness)
  if (normalizeText(preferredTime)) {
    score += 8;
  }

  // Previous interactions bonus
  if (typeof previousInteractions === "number" && previousInteractions > 0) {
    score += Math.min(previousInteractions * 5, 20);
  }

  // Page views bonus
  if (typeof pageViews === "number" && pageViews > 1) {
    score += Math.min(pageViews * 2, 10);
  }

  // Session duration bonus (in seconds)
  if (typeof sessionDuration === "number") {
    if (sessionDuration > 300) score += 10; // 5+ minutes
    else if (sessionDuration > 120) score += 6; // 2+ minutes
    else if (sessionDuration > 60) score += 3; // 1+ minute
  }

  return score;
}

function scoreBudget(budget) {
  if (!budget) return 0;
  
  const normalizedBudget = normalizeText(budget);
  
  if (normalizedBudget.includes("50000") || normalizedBudget.includes("50k") || parseInt(normalizedBudget) >= 50000) {
    return 20;
  }
  
  if (normalizedBudget.includes("25000") || normalizedBudget.includes("25k") || parseInt(normalizedBudget) >= 25000) {
    return 15;
  }
  
  if (normalizedBudget.includes("10000") || normalizedBudget.includes("10k") || parseInt(normalizedBudget) >= 10000) {
    return 10;
  }
  
  return 5;
}

function mapTemperature(score) {
  if (score >= 75) {
    return LEAD_TEMPERATURE.HOT;
  }

  if (score >= 45) {
    return LEAD_TEMPERATURE.WARM;
  }

  return LEAD_TEMPERATURE.COLD;
}

function mapPriority(score, temperature) {
  if (score >= 85 || temperature === LEAD_TEMPERATURE.HOT) {
    return LEAD_PRIORITY.URGENT;
  }
  
  if (score >= 65) {
    return LEAD_PRIORITY.HIGH;
  }
  
  if (score >= 40) {
    return LEAD_PRIORITY.MEDIUM;
  }
  
  return LEAD_PRIORITY.LOW;
}

function calculateFollowUpTime(temperature, priority) {
  // Returns minutes until first follow-up
  if (priority === LEAD_PRIORITY.URGENT) {
    return 15; // 15 minutes
  }
  
  if (priority === LEAD_PRIORITY.HIGH) {
    return 30; // 30 minutes
  }
  
  if (temperature === LEAD_TEMPERATURE.HOT) {
    return 60; // 1 hour
  }
  
  if (temperature === LEAD_TEMPERATURE.WARM) {
    return 240; // 4 hours
  }
  
  return 1440; // 24 hours for cold leads
}

function getRecommendedActions(score, temperature, breakdown) {
  const actions = [];
  
  if (temperature === LEAD_TEMPERATURE.HOT) {
    actions.push("Call immediately");
    actions.push("Send WhatsApp message");
    actions.push("Prepare service quote");
  } else if (temperature === LEAD_TEMPERATURE.WARM) {
    actions.push("Call within 30 minutes");
    actions.push("Send information email");
    actions.push("Schedule follow-up reminder");
  } else {
    actions.push("Send nurture email");
    actions.push("Add to drip campaign");
    actions.push("Schedule weekly check-in");
  }
  
  if (breakdown.engagement < 10) {
    actions.push("Verify contact details");
  }
  
  if (breakdown.message < 10) {
    actions.push("Ask qualifying questions");
  }
  
  return actions;
}

function scoreLead(input) {
  const serviceScore = scoreService(input.service);
  const messageScore = scoreMessage(input.message);
  const contactScore = scoreContact({
    phone: input.phone,
    email: input.email,
    name: input.name,
  });
  const engagementScore = scoreEngagement({
    source: input.source,
    hasFollowUpRequest: input.hasFollowUpRequest,
    preferredTime: input.preferredTime,
    previousInteractions: input.previousInteractions,
    pageViews: input.pageViews,
    sessionDuration: input.sessionDuration,
  });
  const timeScore = scoreTimeOfDay(input.timestamp);
  const cityScore = scoreCityTier(input.city);
  const budgetScore = scoreBudget(input.budget);

  // Calculate raw score
  const rawScore = serviceScore + messageScore + contactScore + engagementScore + timeScore + cityScore + budgetScore;
  
  // Normalize to 0-100
  const totalScore = Math.min(Math.round(rawScore * 0.8), 100);
  
  const temperature = mapTemperature(totalScore);
  const priority = mapPriority(totalScore, temperature);

  const breakdown = {
    service: serviceScore,
    message: messageScore,
    contact: contactScore,
    engagement: engagementScore,
    time: timeScore,
    city: cityScore,
    budget: budgetScore,
  };

  return {
    score: totalScore,
    category: temperature,
    temperature,
    priority,
    followUpInMinutes: calculateFollowUpTime(temperature, priority),
    recommendedActions: getRecommendedActions(totalScore, temperature, breakdown),
    breakdown,
    factors: {
      hasValidPhone: isValidPhone(input.phone),
      hasValidEmail: isValidEmail(input.email),
      hasCorporateEmail: isCorporateEmail(input.email),
      hasDetailedMessage: (input.message || "").length >= 80,
      isBusinessHours: timeScore >= 7,
      isTier1City: cityScore >= 15,
    },
  };
}

module.exports = {
  LEAD_TEMPERATURE,
  LEAD_PRIORITY,
  scoreLead,
  scoreService,
  scoreMessage,
  scoreContact,
  scoreEngagement,
  scoreCityTier,
  scoreTimeOfDay,
  scoreBudget,
  mapTemperature,
  mapPriority,
  calculateFollowUpTime,
  getRecommendedActions,
};
