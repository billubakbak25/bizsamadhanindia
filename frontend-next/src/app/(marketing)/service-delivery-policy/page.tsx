import type { Metadata } from "next";
import { generateLegalPolicyMetadata, renderLegalPolicy } from "../legalPolicyRoute";

const slug = "service-delivery-policy";

export function generateMetadata(): Metadata {
  return generateLegalPolicyMetadata(slug);
}

export default function ServiceDeliveryPolicyPage() {
  return renderLegalPolicy(slug);
}
