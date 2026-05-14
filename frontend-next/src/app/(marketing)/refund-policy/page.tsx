import type { Metadata } from "next";
import { generateLegalPolicyMetadata, renderLegalPolicy } from "../legalPolicyRoute";

const slug = "refund-policy";

export function generateMetadata(): Metadata {
  return generateLegalPolicyMetadata(slug);
}

export default function RefundPolicyPage() {
  return renderLegalPolicy(slug);
}
