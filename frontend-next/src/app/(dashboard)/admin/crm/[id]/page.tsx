import { LeadDetailView } from "@/components/admin/CrmModule";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AdminCrmLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AdminShell
      title="Lead detail"
      description="Inspect a single lead, manage follow-ups, qualify the record, and convert it into a client."
      activeHref="/admin/crm"
      badge="CRM operations"
    >
      <LeadDetailView leadId={id} />
    </AdminShell>
  );
}
