import { CrmModule } from "@/components/admin/CrmModule";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminCrmPage() {
  return (
    <AdminShell
      title="CRM panel"
      description="Search, qualify, convert, and follow up on leads without leaving the admin workflow."
      activeHref="/admin/crm"
      badge="CRM operations"
    >
      <CrmModule />
    </AdminShell>
  );
}
