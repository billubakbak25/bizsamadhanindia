import { redirect } from "next/navigation";

export default function LegacyClientRedirectPage() {
  redirect("/client-portal");
}
