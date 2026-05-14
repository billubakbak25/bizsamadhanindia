import type { Metadata } from "next";
import { generateLegalPolicyMetadata, renderLegalPolicy } from "../legalPolicyRoute";

const slug = "cancellation-policy";

export function generateMetadata(): Metadata {
  return generateLegalPolicyMetadata(slug);
}

export default function CancellationPolicyPage() {
  return renderLegalPolicy(slug);
}
