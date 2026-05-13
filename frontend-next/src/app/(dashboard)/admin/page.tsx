import { DashboardModule } from "@/components/admin/DashboardModule";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminPage() {
  return (
    <AdminShell
      title="Admin dashboard"
      description="Monitor leads, services, tasks, revenue, and recent operational activity from a single control surface."
      activeHref="/admin"
      badge="Admin operations"
    >
      <DashboardModule />
    </AdminShell>
  );
}
