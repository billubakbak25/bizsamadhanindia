import { redirect } from "next/navigation";

export default function LegacyDocumentsRedirect() {
  redirect("/admin/documents");
}
