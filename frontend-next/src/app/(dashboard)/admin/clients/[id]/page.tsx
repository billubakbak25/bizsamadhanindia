import { ClientDetailView } from "@/components/admin/ClientsModule";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AdminShell
      title="Client profile"
      description="See the selected client, linked services, and status history in one place."
      activeHref="/admin/clients"
      badge="Client operations"
    >
      <ClientDetailView clientId={id} />
    </AdminShell>
  );
}
