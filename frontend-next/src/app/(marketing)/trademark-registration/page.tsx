import type { Metadata } from "next";
import { ServiceDetail } from "@/components/sections/ServiceDetail";
import { getMarketingPage } from "@/lib/constants";

const page = getMarketingPage("trademark-registration");

export const metadata: Metadata = {
  title: page?.title || "Trademark Registration",
  description: page?.description,
};

export default function TrademarkRegistrationPage() {
  if (!page) {
    return null;
  }

  return <ServiceDetail page={page} />;
}
