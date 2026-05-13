import { streamText, convertToModelMessages, stepCountIs, tool } from "ai";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a helpful legal services assistant for BizSamadhan India, a leading legal and compliance platform. Your role is to:

1. Help users understand which services they need
2. Answer questions about company registration, GST, trademark, compliance, etc.
3. Qualify leads by understanding their business needs
4. Guide users to book consultations or start services

Key Services:
- Company Registration (Pvt Ltd, LLP, OPC)
- GST Registration & Filing
- Trademark Registration
- Annual Compliance
- Accounting & Bookkeeping

Be helpful, professional, and concise. If the user needs specific legal advice, recommend they book a consultation with our experts.

When users show interest in a service, use the captureLeadIntent tool to log their interest.
When users want to schedule a consultation, use the scheduleConsultation tool.`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: {
      captureLeadIntent: tool({
        description: "Capture when a user expresses interest in a specific service",
        inputSchema: z.object({
          serviceName: z.string().describe("The service the user is interested in"),
          userQuery: z.string().describe("What the user asked or expressed interest in"),
          urgency: z.enum(["low", "medium", "high"]).describe("How urgent the need seems"),
        }),
        execute: async ({ serviceName, userQuery, urgency }) => {
          // In production, this would save to CRM/database
          console.log("[v0] Lead intent captured:", { serviceName, userQuery, urgency });
          return {
            success: true,
            message: `I've noted your interest in ${serviceName}. Would you like to speak with an expert or explore the service page?`,
          };
        },
      }),
      scheduleConsultation: tool({
        description: "Help user schedule a consultation with an expert",
        inputSchema: z.object({
          serviceCategory: z.string().describe("Category of service needed"),
          preferredTime: z.string().nullable().describe("User's preferred time if mentioned"),
        }),
        execute: async ({ serviceCategory, preferredTime }) => {
          return {
            success: true,
            consultationLink: "/consultation",
            message: `Great choice! You can book a free consultation for ${serviceCategory}. ${preferredTime ? `I'll note your preference for ${preferredTime}.` : ""}`,
          };
        },
      }),
      getServiceInfo: tool({
        description: "Get detailed information about a specific service",
        inputSchema: z.object({
          serviceName: z.string().describe("Name of the service to get info about"),
        }),
        execute: async ({ serviceName }) => {
          const serviceInfo: Record<string, { price: string; timeline: string; description: string }> = {
            "private limited company": {
              price: "Starting ₹6,999",
              timeline: "7-10 working days",
              description: "Most popular for startups, offers limited liability protection",
            },
            "llp registration": {
              price: "Starting ₹5,999",
              timeline: "10-15 working days",
              description: "Ideal for professional partnerships with limited liability",
            },
            "gst registration": {
              price: "Starting ₹1,999",
              timeline: "3-5 working days",
              description: "Mandatory for businesses with turnover above ₹40 lakhs",
            },
            "trademark registration": {
              price: "Starting ₹4,999",
              timeline: "6-8 months (application filed in 2-3 days)",
              description: "Protect your brand name and logo legally",
            },
          };

          const info = serviceInfo[serviceName.toLowerCase()] || {
            price: "Contact us for pricing",
            timeline: "Varies based on requirements",
            description: "Speak with our expert for detailed information",
          };

          return info;
        },
      }),
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
