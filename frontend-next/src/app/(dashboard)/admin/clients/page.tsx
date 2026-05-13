import { ClientsModule } from "@/components/admin/ClientsModule";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminClientsPage() {
  return (
    <AdminShell
      title="Client management"
      description="Review client profiles, service counts, and operational health across the live service graph."
      activeHref="/admin/clients"
      badge="Client operations"
    >
      <ClientsModule />
    </AdminShell>
  );
}
