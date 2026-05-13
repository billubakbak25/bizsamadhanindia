import { PricingModule } from "@/components/admin/PricingModule";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminPricingPage() {
  return (
    <AdminShell
      title="Pricing control"
      description="Manage base prices and live pricing rules from one admin pricing engine instead of editing scattered service constants."
      activeHref="/admin/pricing"
      badge="Revenue operations"
    >
      <PricingModule />
    </AdminShell>
  );
}