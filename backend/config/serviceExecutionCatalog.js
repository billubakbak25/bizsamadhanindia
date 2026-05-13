function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function task(title, description, priority = "normal", slaDays = 1) {
  return { title, description, priority, slaDays };
}
const SERVICE_CATEGORIES = [
  {
    key: "tax_compliance",
    label: "Tax & Compliance",
    description: "GST, ITR, TDS, accounting, and annual compliance workflows.",
  },
  {
    key: "business_setup",
    label: "Business Setup",
    description: "Entity formation and foundational business registrations.",
  },
  {
    key: "licenses",
    label: "Licenses",
    description: "Operational licenses and sector-specific approvals.",
  },
  {
    key: "legal",
    label: "Legal",
    description: "Trademark, copyright, and drafting workflows.",
  },
  {
    key: "advanced_compliance",
    label: "Advanced Compliance",
    description: "Certification and standards-based compliance projects.",
  },
  {
    key: "finance",
    label: "Finance",
    description: "Lending support and project report preparation.",
  },
  {
    key: "special_registrations",
    label: "Special Registrations",
    description: "Trust, society, and special statutory registrations.",
  },
  {
    key: "digital",
    label: "Digital",
    description: "Digital signature and identity certificate workflows.",
  },
];

function buildWorkflowTemplate(categoryKey, serviceName, documentRequirements) {
  const taxLike = {
    pending: {
      code: "intake",
      title: `${serviceName} intake and eligibility review`,
      description: `Review the request and confirm the basic facts required to start ${serviceName}.`,
      tasks: [task(`Collect ${serviceName} intake details`, `Capture the core information needed to begin ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    in_progress: {
      code: "preparation",
      title: `${serviceName} preparation and reconciliation`,
      description: `Prepare the working papers and supporting documents for ${serviceName}.`,
      tasks: [task(`Prepare ${serviceName} documents`, `Complete the document pack and working draft for ${serviceName}.`, "high", 2)],
      slaDays: 2,
    },
    submitted: {
      code: "submission",
      title: `${serviceName} filing and submission`,
      description: `Submit the request and capture filing or acknowledgement references for ${serviceName}.`,
      tasks: [task(`Submit ${serviceName} request`, `File the request and capture the reference number for ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    completed: {
      code: "closure",
      title: `${serviceName} closure and archive`,
      description: `Send the completion note and archive the ${serviceName} case.`,
      tasks: [task(`Close ${serviceName} case`, `Share the completion note and archive the finished ${serviceName} request.`, "normal", 1)],
      slaDays: 1,
    },
  };

  const businessSetup = {
    pending: {
      code: "intake",
      title: `${serviceName} entity and eligibility review`,
      description: `Review structure, ownership, and eligibility details for ${serviceName}.`,
      tasks: [task(`Collect ${serviceName} setup details`, `Gather the information needed to plan ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    in_progress: {
      code: "preparation",
      title: `${serviceName} document and incorporation prep`,
      description: `Prepare the incorporation or setup pack for ${serviceName}.`,
      tasks: [task(`Prepare ${serviceName} pack`, `Complete the documents and application draft for ${serviceName}.`, "high", 2)],
      slaDays: 2,
    },
    submitted: {
      code: "submission",
      title: `${serviceName} filing and approval tracking`,
      description: `Submit the request and track approval progress for ${serviceName}.`,
      tasks: [task(`Submit ${serviceName} request`, `File the application and record the reference for ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    completed: {
      code: "handoff",
      title: `${serviceName} handoff and next steps`,
      description: `Share the final output and explain the next obligations for ${serviceName}.`,
      tasks: [task(`Close ${serviceName} case`, `Deliver the final handoff and archive the setup file for ${serviceName}.`, "normal", 1)],
      slaDays: 1,
    },
  };

  const license = {
    pending: {
      code: "intake",
      title: `${serviceName} eligibility and site review`,
      description: `Check the premises, entity facts, and eligibility needed for ${serviceName}.`,
      tasks: [task(`Collect ${serviceName} intake details`, `Capture the premise and compliance details needed for ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    in_progress: {
      code: "preparation",
      title: `${serviceName} document and application prep`,
      description: `Prepare the document pack and application for ${serviceName}.`,
      tasks: [task(`Prepare ${serviceName} application`, `Compile the documents and draft the application for ${serviceName}.`, "high", 2)],
      slaDays: 2,
    },
    submitted: {
      code: "submission",
      title: `${serviceName} submission and tracking`,
      description: `File the application and follow the approval trail for ${serviceName}.`,
      tasks: [task(`Submit ${serviceName} request`, `File the application and capture the regulator reference for ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    completed: {
      code: "handoff",
      title: `${serviceName} license handoff`,
      description: `Share the approved license and store the reference records for ${serviceName}.`,
      tasks: [task(`Close ${serviceName} case`, `Hand over the approved license and archive the file for ${serviceName}.`, "normal", 1)],
      slaDays: 1,
    },
  };

  const legal = {
    pending: {
      code: "intake",
      title: `${serviceName} scope and intake review`,
      description: `Review the facts, scope, and evidence needed for ${serviceName}.`,
      tasks: [task(`Collect ${serviceName} brief`, `Capture the background and goals required to start ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    in_progress: {
      code: "drafting",
      title: `${serviceName} drafting and revision`,
      description: `Prepare the draft work product and iterate on the requested changes for ${serviceName}.`,
      tasks: [task(`Draft ${serviceName}`, `Prepare the legal draft and internal review notes for ${serviceName}.`, "high", 2)],
      slaDays: 2,
    },
    submitted: {
      code: "delivery",
      title: `${serviceName} dispatch and filing`,
      description: `Deliver the final document or file the matter for ${serviceName}.`,
      tasks: [task(`Deliver ${serviceName}`, `Send the final version or filing reference for ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    completed: {
      code: "archive",
      title: `${serviceName} completion and archive`,
      description: `Close the matter and archive the final work file for ${serviceName}.`,
      tasks: [task(`Close ${serviceName} matter`, `Archive the completed matter for ${serviceName}.`, "normal", 1)],
      slaDays: 1,
    },
  };

  const advancedCompliance = {
    pending: {
      code: "intake",
      title: `${serviceName} gap analysis and intake`,
      description: `Review the baseline and collect the inputs needed for ${serviceName}.`,
      tasks: [task(`Collect ${serviceName} intake`, `Capture the compliance facts needed to begin ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    in_progress: {
      code: "preparation",
      title: `${serviceName} technical document prep`,
      description: `Prepare the audit, SOP, or technical documents required for ${serviceName}.`,
      tasks: [task(`Prepare ${serviceName} document pack`, `Create the working pack and technical notes for ${serviceName}.`, "high", 3)],
      slaDays: 3,
    },
    submitted: {
      code: "submission",
      title: `${serviceName} audit or submission tracking`,
      description: `Submit the package or track the external review for ${serviceName}.`,
      tasks: [task(`Track ${serviceName} submission`, `Record submission details and review notes for ${serviceName}.`, "high", 2)],
      slaDays: 2,
    },
    completed: {
      code: "certification",
      title: `${serviceName} certification handoff`,
      description: `Deliver the result and store certification records for ${serviceName}.`,
      tasks: [task(`Close ${serviceName} certification`, `Archive the final certification and handoff file for ${serviceName}.`, "normal", 1)],
      slaDays: 1,
    },
  };

  const finance = {
    pending: {
      code: "intake",
      title: `${serviceName} financial intake review`,
      description: `Collect the statements and assumptions required for ${serviceName}.`,
      tasks: [task(`Collect ${serviceName} financial data`, `Gather the revenue, expense, and credit inputs for ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    in_progress: {
      code: "preparation",
      title: `${serviceName} report and model prep`,
      description: `Prepare the report, projections, or supporting model for ${serviceName}.`,
      tasks: [task(`Prepare ${serviceName} report`, `Draft the financial report or loan pack for ${serviceName}.`, "high", 3)],
      slaDays: 3,
    },
    submitted: {
      code: "submission",
      title: `${serviceName} submission and follow-up`,
      description: `Send the pack and track lender or reviewer feedback for ${serviceName}.`,
      tasks: [task(`Submit ${serviceName} pack`, `Submit the financial pack and track responses for ${serviceName}.`, "high", 2)],
      slaDays: 2,
    },
    completed: {
      code: "closure",
      title: `${serviceName} closure and archive`,
      description: `Close the file and retain the final report for ${serviceName}.`,
      tasks: [task(`Close ${serviceName} file`, `Archive the completed financial file for ${serviceName}.`, "normal", 1)],
      slaDays: 1,
    },
  };

  const specialRegistrations = {
    pending: {
      code: "intake",
      title: `${serviceName} eligibility and entity review`,
      description: `Check the entity details and eligibility needed for ${serviceName}.`,
      tasks: [task(`Collect ${serviceName} intake`, `Capture the trust, society, or statutory details needed for ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    in_progress: {
      code: "preparation",
      title: `${serviceName} document and form prep`,
      description: `Prepare the forms and supporting records for ${serviceName}.`,
      tasks: [task(`Prepare ${serviceName} forms`, `Create the application set for ${serviceName}.`, "high", 2)],
      slaDays: 2,
    },
    submitted: {
      code: "submission",
      title: `${serviceName} submission and approval tracking`,
      description: `File the request and follow the approval path for ${serviceName}.`,
      tasks: [task(`Submit ${serviceName} request`, `File the application and record the reference for ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    completed: {
      code: "handoff",
      title: `${serviceName} compliance handoff`,
      description: `Deliver the outcome and record any follow-up obligations for ${serviceName}.`,
      tasks: [task(`Close ${serviceName} case`, `Archive the approval and handoff notes for ${serviceName}.`, "normal", 1)],
      slaDays: 1,
    },
  };

  const digital = {
    pending: {
      code: "intake",
      title: `${serviceName} identity and KYC review`,
      description: `Collect the identity and contact details required for ${serviceName}.`,
      tasks: [task(`Collect ${serviceName} KYC details`, `Capture the identity inputs needed for ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    in_progress: {
      code: "preparation",
      title: `${serviceName} request and document prep`,
      description: `Prepare the certificate request and supporting KYC documents for ${serviceName}.`,
      tasks: [task(`Prepare ${serviceName} request`, `Compile the request pack and identity proof for ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    submitted: {
      code: "issuance",
      title: `${serviceName} issuance and activation`,
      description: `Issue the certificate and track activation details for ${serviceName}.`,
      tasks: [task(`Issue ${serviceName}`, `Complete issuance and capture the delivery reference for ${serviceName}.`, "high", 1)],
      slaDays: 1,
    },
    completed: {
      code: "handoff",
      title: `${serviceName} credential handoff`,
      description: `Share the certificate or activation details and archive the request for ${serviceName}.`,
      tasks: [task(`Close ${serviceName} request`, `Archive the completed certificate request for ${serviceName}.`, "normal", 1)],
      slaDays: 1,
    },
  };

  const templates = {
    tax_compliance: taxLike,
    business_setup: businessSetup,
    licenses: license,
    legal,
    advanced_compliance: advancedCompliance,
    finance,
    special_registrations: specialRegistrations,
    digital,
  };

  return templates[categoryKey];
}

function buildServiceDefinition({ serviceCode, serviceName, categoryKey, aliases = [], documentRequirements = [], assignmentRole = "operations" }) {
  const category = SERVICE_CATEGORIES.find((item) => item.key === categoryKey);
  const template = buildWorkflowTemplate(categoryKey, serviceName, documentRequirements);

  if (!category) {
    throw new Error(`Unknown service category: ${categoryKey}`);
  }

  if (!template) {
    throw new Error(`No workflow template defined for category: ${categoryKey}`);
  }

  return {
    code: serviceCode,
    name: serviceName,
    currency: "INR",
    paymentDescription: `${serviceName} service package`,
    serviceCode,
    serviceName,
    categoryKey,
    categoryLabel: category.label,
    aliases,
    assignmentRole,
    documentRequirements,
    statusFlow: ["pending", "in_progress", "submitted", "completed"],
    steps: [
      {
        ...template.pending,
        documentRequirements,
      },
      {
        ...template.in_progress,
        documentRequirements,
      },
      {
        ...template.submitted,
        documentRequirements,
      },
      {
        ...template.completed,
        documentRequirements: [],
      },
    ],
  };
}

const identityDocs = ["PAN Card", "Aadhaar Card"];
const businessProofDocs = ["Business Proof", "Business Address Proof"];
const taxDocs = ["PAN Card", "Financial Records"];
const incorporationDocs = ["Partner/Director ID", "Address Proof", "Business Proof"];
const licenseDocs = ["Address Proof", "Premises Proof", "Identity Proof"];
const ipDocs = ["Work Sample / Logo / Mark", "Claimant Details"];
const complianceDocs = ["Technical Documents", "Policy / SOP Records"];
const financeDocs = ["Bank Statements", "GST / ITR Records", "Financial Statements"];
const specialDocs = ["Entity Proof", "Identity Proof", "Supporting Records"];
const digitalDocs = ["Identity Proof", "Photograph", "Mobile / Email Access"];

const SERVICE_DEFINITIONS = [
  buildServiceDefinition({
    serviceCode: "gst_registration",
    serviceName: "GST Registration",
    categoryKey: "tax_compliance",
    aliases: ["GST Registration", "GST Registration Service", "GST"],
    documentRequirements: [...identityDocs, ...businessProofDocs],
    assignmentRole: "tax",
  }),
  buildServiceDefinition({
    serviceCode: "gst_return_filing",
    serviceName: "GST Return Filing",
    categoryKey: "tax_compliance",
    aliases: ["GST Return Filing", "GST Returns", "GST Filing"],
    documentRequirements: ["Sales Register", "Purchase Register", "GSTIN", "Input Tax Credit Records"],
    assignmentRole: "tax",
  }),
  buildServiceDefinition({
    serviceCode: "itr_filing",
    serviceName: "ITR Filing",
    categoryKey: "tax_compliance",
    aliases: ["ITR Filing", "Income Tax Filing", "Income Tax Return", "Income Tax Return (ITR)"],
    documentRequirements: ["PAN Card", "Form 16", "Bank Statement", "Investment Proofs"],
    assignmentRole: "tax",
  }),
  buildServiceDefinition({
    serviceCode: "tds_returns",
    serviceName: "TDS Returns",
    categoryKey: "tax_compliance",
    aliases: ["TDS Returns", "TDS Return Filing"],
    documentRequirements: ["TAN", "Deduction Register", "Challans", "PAN Details"],
    assignmentRole: "tax",
  }),
  buildServiceDefinition({
    serviceCode: "accounting_bookkeeping",
    serviceName: "Accounting and Bookkeeping",
    categoryKey: "tax_compliance",
    aliases: ["Accounting and Bookkeeping", "Accounting Bookkeeping"],
    documentRequirements: financeDocs,
    assignmentRole: "accounts",
  }),
  buildServiceDefinition({
    serviceCode: "annual_compliance_filing",
    serviceName: "Annual Compliance Filing",
    categoryKey: "tax_compliance",
    aliases: ["Annual Compliance Filing", "Annual Compliance", "ROC Filing"],
    documentRequirements: ["Financial Statements", "Board / Partner Records", "Statutory Registers"],
    assignmentRole: "compliance",
  }),
  buildServiceDefinition({
    serviceCode: "company_registration",
    serviceName: "Company Registration",
    categoryKey: "business_setup",
    aliases: ["Company Registration", "Private Limited Company Registration", "Company Incorporation"],
    documentRequirements: incorporationDocs,
    assignmentRole: "corporate",
  }),
  buildServiceDefinition({
    serviceCode: "llp_registration",
    serviceName: "LLP Registration",
    categoryKey: "business_setup",
    aliases: ["LLP Registration", "LLP Incorporation"],
    documentRequirements: incorporationDocs,
    assignmentRole: "corporate",
  }),
  buildServiceDefinition({
    serviceCode: "opc_registration",
    serviceName: "OPC Registration",
    categoryKey: "business_setup",
    aliases: ["OPC Registration"],
    documentRequirements: incorporationDocs,
    assignmentRole: "corporate",
  }),
  buildServiceDefinition({
    serviceCode: "sole_proprietorship_registration",
    serviceName: "Sole Proprietorship Registration",
    categoryKey: "business_setup",
    aliases: ["Sole Proprietorship Registration", "Proprietorship Registration"],
    documentRequirements: businessProofDocs,
    assignmentRole: "business_setup",
  }),
  buildServiceDefinition({
    serviceCode: "partnership_firm_registration",
    serviceName: "Partnership Firm Registration",
    categoryKey: "business_setup",
    aliases: ["Partnership Firm Registration", "Partnership Registration"],
    documentRequirements: incorporationDocs,
    assignmentRole: "business_setup",
  }),
  buildServiceDefinition({
    serviceCode: "startup_india_registration",
    serviceName: "Startup India Registration",
    categoryKey: "business_setup",
    aliases: ["Startup India Registration", "Startup India"],
    documentRequirements: ["Incorporation Certificate", "Founder Details", "Business Description"],
    assignmentRole: "startup",
  }),
  buildServiceDefinition({
    serviceCode: "msme_udhyam",
    serviceName: "MSME / Udyam Registration",
    categoryKey: "business_setup",
    aliases: ["MSME Registration", "Udyam Registration", "MSME / Udyam Registration"],
    documentRequirements: ["PAN", "Aadhaar", "Business Address Proof"],
    assignmentRole: "business_setup",
  }),
  buildServiceDefinition({
    serviceCode: "fssai",
    serviceName: "FSSAI Registration",
    categoryKey: "licenses",
    aliases: ["FSSAI", "FSSAI Registration"],
    documentRequirements: licenseDocs,
    assignmentRole: "licensing",
  }),
  buildServiceDefinition({
    serviceCode: "shop_act",
    serviceName: "Shop Act Registration",
    categoryKey: "licenses",
    aliases: ["Shop Act", "Shop Act Registration"],
    documentRequirements: ["Shop Address Proof", "Identity Proof", "Employee Details"],
    assignmentRole: "licensing",
  }),
  buildServiceDefinition({
    serviceCode: "iec_rcmc_apeda",
    serviceName: "IEC / RCMC / APEDA",
    categoryKey: "licenses",
    aliases: ["IEC", "RCMC", "APEDA", "IEC Registration"],
    documentRequirements: ["PAN", "Bank Details", "Business Proof", "Export / Import Details"],
    assignmentRole: "licensing",
  }),
  buildServiceDefinition({
    serviceCode: "trade_license",
    serviceName: "Trade License",
    categoryKey: "licenses",
    aliases: ["Trade License", "Trade License Registration"],
    documentRequirements: ["Premises Proof", "Identity Proof", "Business Activity Details"],
    assignmentRole: "licensing",
  }),
  buildServiceDefinition({
    serviceCode: "trademark_copyright",
    serviceName: "Trademark / Copyright",
    categoryKey: "legal",
    aliases: ["Trademark Registration", "Copyright Registration", "Trademark / Copyright"],
    documentRequirements: ipDocs,
    assignmentRole: "legal",
  }),
  buildServiceDefinition({
    serviceCode: "legal_drafting",
    serviceName: "Legal Drafting",
    categoryKey: "legal",
    aliases: ["Legal Drafting"],
    documentRequirements: ["Matter Brief", "Party Details", "Relevant Supporting Records"],
    assignmentRole: "legal",
  }),
  buildServiceDefinition({
    serviceCode: "iso_certification",
    serviceName: "ISO Certification",
    categoryKey: "advanced_compliance",
    aliases: ["ISO Certification"],
    documentRequirements: ["Process Docs", "Policy / SOP Records", "Organisation Details"],
    assignmentRole: "quality",
  }),
  buildServiceDefinition({
    serviceCode: "bis_isi_ce_haccp_rohs",
    serviceName: "BIS / ISI / CE / HACCP / ROHS",
    categoryKey: "advanced_compliance",
    aliases: ["BIS Certification", "ISI Certification", "CE Certification", "HACCP Certification", "ROHS Certification"],
    documentRequirements: complianceDocs,
    assignmentRole: "quality",
  }),
  buildServiceDefinition({
    serviceCode: "business_loans",
    serviceName: "Business Loans",
    categoryKey: "finance",
    aliases: ["Business Loans", "Business Loan"],
    documentRequirements: financeDocs,
    assignmentRole: "finance",
  }),
  buildServiceDefinition({
    serviceCode: "cma_project_report",
    serviceName: "CMA Project Report",
    categoryKey: "finance",
    aliases: ["CMA Project Report", "CMA Report"],
    documentRequirements: ["Projected Financials", "Business Plan", "Bank Statements"],
    assignmentRole: "finance",
  }),
  buildServiceDefinition({
    serviceCode: "trust_society",
    serviceName: "Trust / Society",
    categoryKey: "special_registrations",
    aliases: ["Trust Registration", "Society Registration", "Trust / Society"],
    documentRequirements: specialDocs,
    assignmentRole: "special_registrations",
  }),
  buildServiceDefinition({
    serviceCode: "form_12a_80g",
    serviceName: "12A / 80G",
    categoryKey: "special_registrations",
    aliases: ["12A Registration", "80G Registration", "12A / 80G"],
    documentRequirements: ["Trust Deed / MOA", "PAN", "Activity Details", "Financial Records"],
    assignmentRole: "special_registrations",
  }),
  buildServiceDefinition({
    serviceCode: "form_15ca_15cb",
    serviceName: "15CA / 15CB",
    categoryKey: "special_registrations",
    aliases: ["15CA Filing", "15CB Certification", "15CA / 15CB"],
    documentRequirements: ["Remittance Details", "PAN", "Bank Details", "Supporting Invoices"],
    assignmentRole: "special_registrations",
  }),
  buildServiceDefinition({
    serviceCode: "digital_signature",
    serviceName: "Digital Signature",
    categoryKey: "digital",
    aliases: ["Digital Signature", "DSC"],
    documentRequirements: digitalDocs,
    assignmentRole: "digital",
  }),
];

const SERVICE_DEFINITION_LOOKUP = new Map();

for (const definition of SERVICE_DEFINITIONS) {
  const lookupKeys = [definition.serviceCode, definition.serviceName, ...(definition.aliases || [])];

  for (const key of lookupKeys) {
    const normalized = normalizeKey(key);
    if (normalized) {
      SERVICE_DEFINITION_LOOKUP.set(normalized, definition);
    }
  }
}

function findServiceDefinition(value) {
  return SERVICE_DEFINITION_LOOKUP.get(normalizeKey(value)) || null;
}

function listServiceDefinitions() {
  return SERVICE_DEFINITIONS.map((definition) => ({
    code: definition.serviceCode,
    name: definition.serviceName,
    currency: definition.currency,
    paymentDescription: definition.paymentDescription,
    serviceCode: definition.serviceCode,
    serviceName: definition.serviceName,
    categoryKey: definition.categoryKey,
    categoryLabel: definition.categoryLabel,
    aliases: [...definition.aliases],
    assignmentRole: definition.assignmentRole,
    documentRequirements: [...definition.documentRequirements],
    statusFlow: [...definition.statusFlow],
    steps: definition.steps.map((step) => ({
      code: step.code,
      status: step.status,
      title: step.title,
      description: step.description,
      slaDays: step.slaDays,
      documentRequirements: [...step.documentRequirements],
      tasks: step.tasks.map((item) => ({ ...item })),
    })),
  }));
}

function listServiceCategories() {
  return SERVICE_CATEGORIES.map((category) => ({
    ...category,
    services: SERVICE_DEFINITIONS.filter((definition) => definition.categoryKey === category.key).map((definition) => ({
      code: definition.serviceCode,
      name: definition.serviceName,
      currency: definition.currency,
      serviceCode: definition.serviceCode,
      serviceName: definition.serviceName,
      aliases: [...definition.aliases],
      assignmentRole: definition.assignmentRole,
      statusFlow: [...definition.statusFlow],
      documentRequirements: [...definition.documentRequirements],
    })),
  }));
}

module.exports = {
  SERVICE_CATEGORIES,
  SERVICE_DEFINITIONS,
  findServiceDefinition,
  listServiceDefinitions,
  listServiceCategories,
  normalizeKey,
};
