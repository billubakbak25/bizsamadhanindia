import { redirect } from "next/navigation";

export default async function LegacyCrmLeadRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/crm/${id}`);
}
