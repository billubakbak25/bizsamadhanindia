import { redirect } from "next/navigation";

export default function LegacyClientsRedirect() {
  redirect("/admin/clients");
}
