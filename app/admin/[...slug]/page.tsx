import { redirect } from "next/navigation";

export default async function AdminCatchAll({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolved = await params;
  const path = resolved.slug?.join("/") || "";
  redirect(`/admin-wikis${path ? `/${path}` : ""}`);
}
