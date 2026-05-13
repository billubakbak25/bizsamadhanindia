import { DocumentsModule } from "@/components/admin/DocumentsModule";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminDocumentsPage() {
  return (
    <AdminShell
      title="Document management"
      description="Upload, tag, preview, and track documents attached to live service records."
      activeHref="/admin/documents"
      badge="Service operations"
    >
      <DocumentsModule />
    </AdminShell>
  );
}
