import { ServiceDetailView } from "@/components/admin/ServicesModule";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AdminServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AdminShell
      title="Service detail"
      description="Review the selected service, task queue, documents, and activity timeline."
      activeHref="/admin/services"
      badge="Service operations"
    >
      <ServiceDetailView serviceId={id} />
    </AdminShell>
  );
}
