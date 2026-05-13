import { ServicesModule } from "@/components/admin/ServicesModule";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminServicesPage() {
  return (
    <AdminShell
      title="Service management"
      description="Manage category-based services, update execution status, and inspect workflow timelines."
      activeHref="/admin/services"
      badge="Service operations"
    >
      <ServicesModule />
    </AdminShell>
  );
}
