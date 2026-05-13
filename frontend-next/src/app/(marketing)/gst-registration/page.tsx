import type { Metadata } from "next";
import { ServiceDetail } from "@/components/sections/ServiceDetail";
import { getMarketingPage } from "@/lib/constants";

const page = getMarketingPage("gst-registration");

export const metadata: Metadata = {
  title: page?.title || "GST Registration",
  description: page?.description,
};

export default function GstRegistrationPage() {
  if (!page) {
    return null;
  }

  return <ServiceDetail page={page} />;
}
