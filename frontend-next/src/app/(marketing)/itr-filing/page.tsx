import type { Metadata } from "next";
import { ServiceDetail } from "@/components/sections/ServiceDetail";
import { getMarketingPage } from "@/lib/constants";

const page = getMarketingPage("itr-filing");

export const metadata: Metadata = {
  title: page?.title || "ITR Filing",
  description: page?.description,
};

export default function ItrFilingPage() {
  if (!page) {
    return null;
  }

  return <ServiceDetail page={page} />;
}
