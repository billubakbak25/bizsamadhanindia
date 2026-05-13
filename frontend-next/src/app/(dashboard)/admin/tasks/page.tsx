import { TasksModule } from "@/components/admin/TasksModule";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminTasksPage() {
  return (
    <AdminShell
      title="Task management"
      description="Monitor the operational queue, auto-assign work, and track SLA risk from a single screen."
      activeHref="/admin/tasks"
      badge="Workflow operations"
    >
      <TasksModule />
    </AdminShell>
  );
}
