import { redirect } from "next/navigation";

export default async function LegacyDashboardSlugRedirect({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  redirect(`/admin/${slug.join("/")}`);
}
