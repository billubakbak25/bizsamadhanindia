import type { Metadata } from "next";
import { ClientPortal } from "@/components/dashboard/ClientPortal";

export const metadata: Metadata = {
  title: "Client Portal",
  description: "Email OTP-authenticated client workspace for payments, services, documents, consultations, and support tickets.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ClientPortalPage() {
  return <ClientPortal />;
}

