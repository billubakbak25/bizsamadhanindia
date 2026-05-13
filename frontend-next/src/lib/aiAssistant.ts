export type AiAssistantService = {
  code: string;
  name: string;
  amount?: number;
  currency?: string;
  amountFormatted?: string;
  paymentLink?: string;
  serviceLink?: string;
  consultationLink?: string;
};

export type AiAssistantReply = {
  type: "faq" | "suggestion" | "fallback";
  reply: string;
  service: AiAssistantService | null;
};

export type AiAssistantMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  service?: AiAssistantService | null;
};

const SERVICE_ROUTE_BY_CODE: Record<string, string> = {
  GST_REGISTRATION: "/gst-registration",
  GST_RETURN_FILING: "/gst-return-filing",
  ITR_FILING: "/itr-filing",
  TRADEMARK_REGISTRATION: "/trademark-registration",
  COMPANY_REGISTRATION: "/company-registration",
  LLP_REGISTRATION: "/llp-registration",
  STARTUP_INDIA_REGISTRATION: "/startup-india-registration",
  ANNUAL_COMPLIANCE_FILING: "/annual-compliance-filing",
  ROC_FILING: "/roc-filing",
  ACCOUNTING_BOOKKEEPING: "/accounting-bookkeeping",
};

export const AI_ASSISTANT_STARTERS = [
  "Which service should I choose for GST registration?",
  "How much does trademark registration cost?",
  "I need help filing income tax returns.",
  "What is the best option for company registration?",
  "Do I need LLP registration or private limited company setup?",
  "Can you help with annual compliance and ROC filing?",
];

export function getAiAssistantServiceHref(service: AiAssistantService | null | undefined) {
  if (!service) {
    return "/services";
  }

  return service.serviceLink || SERVICE_ROUTE_BY_CODE[service.code] || "/services";
}

export function getAiAssistantConsultationHref(service: AiAssistantService | null | undefined) {
  if (service?.consultationLink) {
    return service.consultationLink;
  }

  const params = new URLSearchParams();

  if (service?.name) {
    params.set("service", service.name);
  }

  const query = params.toString();
  return query ? `/consultation?${query}` : "/consultation";
}

export function createAiAssistantMessage(
  role: AiAssistantMessage["role"],
  content: string,
  service?: AiAssistantService | null,
): AiAssistantMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    service: service || null,
  };
}